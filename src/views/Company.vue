<template>
  <div>
    <div class="page-header">
      <el-button v-if="canAddCompany" type="primary" icon="Plus" @click="openCreate">បន្ថែមក្រុមហ៑ុន</el-button>
    </div>

    <el-card class="table-card">
      <el-table :data="companies" v-loading="loading" stripe>
        <el-table-column prop="id" label="ល.រ" width="70" />
        <el-table-column prop="name" label="ឈ្មោះ" min-width="110" />
        <el-table-column prop="user_count" label="បុគ្គលិកសរុប" min-width="110" />
        <el-table-column prop="latitude" label="Latitude" width="120" />
        <el-table-column prop="longitude" label="Longitude" width="120" />
        <el-table-column prop="radius" label="ចម្ងាយអាចស្កែន (m)" width="150" />
        <el-table-column prop="currency" label="រូបិយប័ណ្ណ" width="100" />
        <el-table-column prop="late_penalty" label="ពិន័យយឺត" width="120" />
        <el-table-column prop="left_early_penalty" label="ពិន័យចេញមុនម៉ោង" width="150" />
        <el-table-column prop="can_scan_outsize" label="អាចស្កែនក្រៅតំបន់" width="150" >
          <template #default="{row}">
            <el-tag :type="row.can_scan_outsize ? 'success' : 'danger'">
              {{ row.can_scan_outsize ? 'បាន' : 'មិនបាន'}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="ស្ថានភាព" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
              {{ row.is_active ? 'Active' : 'Inactive' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="សកម្មភាព" width="100">
          <template #default="{ row }">
            <el-button v-if="canEditCompany" size="small" icon="Edit" circle @click="openEdit(row)" />
            <el-button v-if="canEditCompany" size="small" icon="Promotion" circle @click="openEditTelegram(row)" />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @change="fetchCompanies"
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
<el-dialog v-model="dialogVisible" :title="isEdit ? 'កែប្រែក្រុមហ៑ុន' : 'បន្ថែមក្រុមហ៑ុន'" width="600px" destroy-on-close>
  <el-form :model="form" :rules="rules" ref="formRef" label-position="top">

    <p class="section-label">Basic info</p>
    <el-form-item label="ឈ្មោះ" prop="name">
      <el-input v-model="form.name" size="large" />
    </el-form-item>

    <el-divider />
    <p class="section-label">Location</p>
    <el-form-item label="Map Link" prop="map_link">
      <el-input v-model="form.map_link" size="large"></el-input>
    </el-form-item>
    <div class="form-row">
      <el-form-item label="Latitude" prop="latitude">
        <el-input v-model="form.latitude" placeholder="e.g. 11.5564" size="large"/>
      </el-form-item>
      <el-form-item label="Longitude" prop="longitude">
        <el-input v-model="form.longitude" placeholder="e.g. 104.9282" size="large"/>
      </el-form-item>
    </div>
    <div class="form-row">
      <el-form-item label="ចម្ងាយអាចស្កែនបាន (ម៉េត្រ)" prop="radius">
      <el-input v-model="form.radius" placeholder="e.g. 100" size="large"/>
    </el-form-item>
    <el-form-item label="អាចស្កែនក្រៅតំបន់បាន">
        <el-select v-model="form.can_scan_outsize" placeholder="អាចស្កែនក្រៅតំបន់បាន" size="large" style="width:100%">
          <el-option label="អាចស្កែនបាន" :value="1" />
          <el-option label="មិនអាចស្កែនបាន"  :value="0" />
        </el-select>

    </el-form-item>
    </div>

    <el-divider />
    <div class="form-row">
      <el-form-item label="រូបិយប័ណ្ណ">
       <el-select v-model="form.currency" style="width: 100%;" size="large">
  <el-option label="USD" value="USD" />
  <el-option label="KHR" value="KHR" />
</el-select>
        
      </el-form-item>
      <el-form-item label="ពិន័យយឺត">
        <el-input v-model="form.late_penalty" placeholder="ប្រាក់ពិន័យពេលមកយឺត" size="large"/>
      </el-form-item>
    </div>
    <el-form-item label="ពិន័យចេញមុនម៉ោង">
      <el-input v-model="form.left_early_penalty" placeholder="ប្រាក់ពិន័យពេលចេញមុនម៉ោង" size="large"/>
    </el-form-item>

    <el-divider />
    <p class="section-label">Telegram</p>
    <div class="form-row">
      <el-form-item label="Bot Token">
        <el-input :disabled="isEdit" v-model="form.bot_token" placeholder="Telegram bot token" size="large"/>
      </el-form-item>
      <el-form-item label="Group Chat ID">
        <el-input :disabled="isEdit" v-model="form.group_link" placeholder="Telegram group chat ID" size="large"/>
      </el-form-item>
    </div>

  </el-form>
  <template #footer>
    <el-button @click="dialogVisible = false" size="large">ថតក្រោយ</el-button>
    <el-button type="primary" :loading="saving" @click="handleSave" size="large">
      {{ isEdit ? 'កែប្រែ' : 'បង្កេីត' }}
    </el-button>
  </template>
</el-dialog>

<el-dialog v-model="dialogTelegramVisible" title="កែប្រែ" width="600px" destroy-on-close>
  <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
    <el-divider />
    <p class="section-label">Telegram</p>
    <div class="form-row">
      <el-form-item label="Bot Token">
        <el-input v-model="form.bot_token" placeholder="Telegram bot token" size="large"/>
      </el-form-item>
      <el-form-item label="Group Chat ID">
        <el-input v-model="form.group_link" placeholder="Telegram group chat ID" size="large"/>
      </el-form-item>
    </div>

  </el-form>
  <template #footer>
    <el-button @click="dialogTelegramVisible = false" size="large">ថតក្រោយ</el-button>
    <el-button type="primary" :loading="saving" @click="handleUpdateTelegram" size="large">
     កែប្រែ
    </el-button>
  </template>
</el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getCompany, createCompany, updateCompany, updateTelegram } from '../api/services'
import { useAuthStore } from '../stores/auth'

const companies = ref([])
const loading = ref(false)
const saving = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const isEditTelegram = ref(false)
const dialogTelegramVisible = ref(false)
const editId = ref(null)
const formRef = ref()
const auth = useAuthStore()
const form = reactive({
  map_link:'',
  name: '', latitude: '', longitude: '', radius: '', currency: '',
  late_penalty: '', left_early_penalty: '', bot_token: '', group_link: '',can_scan_outsize:null
})
const canAddCompany = computed(() => auth.permission?.some(p => p.name === 'add.company'))
const canEditCompany = computed(() => auth.permission?.some(p => p.name === 'edit.company'))
const rules = {
  name: [{ required: true, message: 'Company name is required' }],
  latitude: [{ required: true, message: 'Latitude is required' }],
  longitude: [{ required: true, message: 'Longitude is required' }],
  radius: [{ required: true, message: 'Radius is required' }],
}

async function fetchCompanies() {
  loading.value = true
  try {
    const res = await getCompany({ page: page.value, page_size: pageSize.value })
    companies.value = res.data.data || []
    total.value = res.data.metadata?.total_count || 0
  } catch (e) {
    ElMessage.error('Failed to load companies')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  isEdit.value = false
  Object.keys(form).forEach(k => form[k] = '')
  form.can_scan_outsize = null  // ← add this
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    map_link: '', 
    name: row.name || '', latitude: row.latitude || '', longitude: row.longitude || '',
    radius: row.radius || '', currency: row.currency || '',
    bot_token: row.bot_token || '', group_link: row.group_link || '',
    late_penalty: row.late_penalty || '', left_early_penalty: row.left_early_penalty || '',
    can_scan_outsize: row.can_scan_outsize ?? null
  })
  dialogVisible.value = true
}

function openEditTelegram(row) {
  isEditTelegram.value = true
  editId.value = row.id
  Object.assign(form, {
    bot_token: row.bot_token || '', group_link: row.group_link || ''
  })
  dialogTelegramVisible.value = true
}

async function handleSave() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isEdit.value) {
      // Send only non-empty fields as nullable update
      const payload = {}
      Object.entries(form).forEach(([k, v]) => { if (v !== '') payload[k] = v })
      if (form.can_scan_outsize !== null && form.can_scan_outsize !== '') {
        payload.can_scan_outsize = form.can_scan_outsize
      }
      await updateCompany(editId.value, payload)
      ElMessage.success('កែប្រែបានជោគជ័យ')
    } else {
      await createCompany(form)
      ElMessage.success('បង្កេីតក្រុមហ៑ុនបានជោគជ័យ')
    }
    dialogVisible.value = false
    fetchCompanies()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

async function handleUpdateTelegram() {
  await formRef.value.validate()
  saving.value = true
  try {
    if (isEditTelegram.value) {
      // Send only non-empty fields as nullable update
      const payload = {}
      Object.entries(form).forEach(([k, v]) => { if (v !== '') payload[k] = v })
      await updateTelegram(editId.value, payload)
      ElMessage.success('កែប្រែបានជោគជ័យ')
    }
    dialogTelegramVisible.value = false
    fetchCompanies()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

onMounted(fetchCompanies)
</script>

<style scoped>
.page-header { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.table-card { border-radius: 6px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
:deep(.el-table__header-wrapper th) {
  background-color: #4589ce !important;
  color: #ffffff !important;
}
.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.form-row .el-form-item {
  margin-bottom: 8px;
}
</style>
