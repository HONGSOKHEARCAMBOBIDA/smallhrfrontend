<template>
  <div>
    <el-card class="top-card">
      <template #header>
        <div style="display:flex; align-items:center; justify-content:space-between">
          <span class="card-title">របាយការណ៍បេីកប្រាក់ខែ</span>
          <div style="display:flex; gap:10px; align-items:center">
                  <el-input
        v-model="filters.name"
        placeholder="ស្វែងរក"
        prefix-icon="Search"
        clearable
      />
            <el-select v-model="filters.payroll_type" style="width:250px" @change="fetchPayroll" clearable>
              <el-option label="ទាំងអស់" value="" />
              <el-option label="បេីកពេញ១ខែ" :value="1" />
              <el-option label="បេីកកន្លះខែ" :value="2" />
            </el-select>
            <el-date-picker
              v-model="filters.payroll_date"
              type="month"
              placeholder="ជ្រើសរើសខែ និង ឆ្នាំ"
              format="MM/YYYY"
              value-format="YYYY-MM"
              @change="fetchPayroll"
              style="width: 300px;"
            />
            <el-button type="success" icon="Plus"  @click="$router.push({ name: 'Payroll' })" v-if="canAddPayroll">
                បេីកប្រាក់ខែ
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="payrolls" v-loading="loading" stripe>
        <el-table-column prop="user_name" label="ឈ្មោះបុគ្គលិក" min-width="130" />
        <el-table-column label="ភេទ" width="80" align="center">
  <template #default="{ row }">
    <el-tag :type="row.user_gender === 1 ? 'primary' : 'danger'" size="small">
      {{ row.user_gender === 1 ? 'ប្រុស' : 'ស្រី' }}
    </el-tag>
  </template>
</el-table-column>
        <el-table-column prop="role_name" label="តួនាទី" width="110" />
        <el-table-column prop="company_name" label="ក្រុមហ៊ុន" width="130" />
        <el-table-column label="ប្រភេទប្រាក់ខែ" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.payroll_type === 1 ? 'primary' : 'warning'" size="small">
              {{ row.payroll_type === 1 ? 'ពេញ១ខែ' : 'កន្លះខែ' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="ប្រាក់ខែគោល" width="130">
          <template #default="{ row }">{{ row.basic_salary }} {{ row.currency }}</template>
        </el-table-column>
        <el-table-column label="ប្រាក់ខែពាក់កណ្ដាល" width="155">
          <template #default="{ row }">{{ row.half_salary }} {{ row.currency }}</template>
        </el-table-column>
        <el-table-column prop="total_work_day" label="ចំនួនថ្ងៃធ្វើការ" width="120" align="center" />
        <el-table-column label="កាត់លុយ" width="130">
          <template #default="{ row }">{{ row.total_deduction || '0.00' }} {{ row.currency }}</template>
        </el-table-column>
        <el-table-column label="ប្រាក់ខែទទួលបាន" width="160">
          <template #default="{ row }">
            <strong>{{ row.net_salary }} {{ row.currency }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="other" label="ផ្សេងៗ" width="110" align="center">
          <template #default="{ row }">
            <span v-if="row.other">{{ row.other }}</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="ស្ថានភាព" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'info'" size="small">
              {{ row.status === 0 ? 'បានបេីក' : 'មិនទាន់' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payroll_date" label="កាលបរិច្ឆេទ" width="120" align="center" />
        <el-table-column prop="note" label="សម្គាល់" min-width="120">
          <template #default="{ row }">
            <span v-if="row.note">{{ row.note }}</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div style="display:flex; justify-content:flex-end; margin-top:16px">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="totalCount"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @change="fetchPayroll"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getPayroll } from '../api/services'
import { debounce } from 'lodash-es'
import { useAuthStore } from '../stores/auth'
const payrolls = ref([])
const loading = ref(false)
const totalCount = ref(0)
const authStore = useAuthStore()
const filters = reactive({
  name: '',
  payroll_date: '',
  payroll_type: ''
})
const canAddPayroll = computed(() =>
  authStore.permission?.some(p => p.name === 'add.payroll')
)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

async function fetchPayroll() {
  loading.value = true
  try {
    const params = { page: pagination.page, page_size: pagination.pageSize }
    if(filters.name) params.name = filters.name
    if(filters.payroll_date) params.payroll_date = filters.payroll_date
    if(filters.payroll_type) params.payroll_type = filters.payroll_type
    const res = await getPayroll(params)
    payrolls.value = res.data.data || []
    totalCount.value = res.data.pagination?.totalCount || 0
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to load payroll')
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce(() => {
  pagination.page = 1
  fetchPayroll()
}, 500)
watch(()=> filters.name,debouncedFetch)
onMounted(fetchPayroll)
</script>

<style scoped>
.top-card { border-radius: 6px; }
.card-title { font-weight: 600; font-size: 15px; }
:deep(.el-table__header-wrapper th) {
  background-color: #4589ce !important;
  color: #ffffff !important;
}
</style>