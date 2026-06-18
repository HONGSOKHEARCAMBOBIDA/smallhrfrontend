<template>
  <div>
   <el-card class="filter-card">
  <el-row :gutter="12" align="middle">
    <el-col :span="10">
      <el-input
        v-model="filters.name"
        placeholder="ស្វែងរក"
        prefix-icon="Search"
        clearable
      />
    </el-col>
    <el-col :span="6">
      <el-select
        v-model="filters.role_id"
        placeholder="តួនាទី"
        clearable
        @change="fetchUsers"
        style="width:100%"
      >
        <el-option
          v-for="role in roles"
          :key="role.id"
          :label="role.display_name"
          :value="role.id"
        />
      </el-select>
    </el-col>
    <el-col :span="8" style="text-align:right">
      <el-button
        type="success"
        icon="Plus"
        @click="openCreate"
      >
        បន្ថែមបុគ្គលិក
      </el-button>
    </el-col>
  </el-row>
</el-card>

    <el-card class="table-card" style="margin-top:16px">
      <el-table :data="users" v-loading="loading" stripe row-key="id">
        <el-table-column prop="name" label="ឈ្មោះ" min-width="140" />
        <el-table-column prop="gender_string" label="ភេទ" width="90" />
        <el-table-column prop="phone_hash" label="លេខទូរសព្ទ" width="130" />
        <el-table-column prop="role_name" label="តួនាទី" width="110" />
        <el-table-column prop="company_name" label="ក្រុមហ៑ុន" min-width="130" />
        <el-table-column label="QR Token" min-width="150">
  <template #default="{ row }">
    <el-button type="primary" link @click="openQR(row.qr_token)">
      View QR
    </el-button>
  </template>
</el-table-column>
        <el-table-column prop="base_salary" label="ប្រាក់ខែ" width="120">
          <template #default="{ row }">{{ row.base_salary }} {{ row.currency }}</template>
        </el-table-column>
        <el-table-column label="ស្ថានភាព" width="95">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
              {{ row.is_active ? 'សកម្ម' : 'អសកម្ម' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="សកម្មភាព" width="140">
          <template #default="{ row }">
            <el-button size="small" icon="Edit" circle @click="openEdit(row)" title="កែប្រែ" />
            <el-button size="small" :icon="row.is_active ? 'CircleClose' : 'CircleCheck'" circle
              :type="row.is_active ? 'danger' : 'success'" @click="toggleStatus(row)" title="បិទ/បេីក" />
            <el-button size="small" icon="View" circle @click="openShifts(row)" title="ម៉ោងធ្វេីការ" />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next" @change="fetchUsers" />
      </div>
    </el-card>

    <!-- Create Employee Dialog -->
    <el-dialog v-model="createDialog" title="បន្ថែមបុគ្គលិក"  width="983px" destroy-on-close>
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="130px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="ឈ្មោះ" prop="name">
              <el-input v-model="createForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="លេខទូរសព្ទ" prop="phone_hash">
              <el-input v-model="createForm.phone_hash" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
    
                      <el-form-item label="តួនាទី" prop="role_id">
          <el-select
            v-model="createForm.role_id"
            placeholder="ជ្រើសតួនាទី"
            clearable
            
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.display_name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
           
          </el-col>
          <el-col :span="12">
            <el-form-item label="ភេទ" prop="gender">
              <el-select v-model="createForm.gender" style="width:100%">
                <el-option label="ប្រុស" :value="1" />
                <el-option label="ស្រី" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ប្រាក់ខែ">
              <el-input v-model="createForm.base_salary" placeholder="e.g. 500" />
            </el-form-item>
          </el-col>
      <el-col :span="12">
      <el-form-item label="ក្រុមហ៑ុន" prop="company_id">
          <el-select
            v-model="createForm.company_id"
            placeholder="ជ្រើសក្រុមហ៑ុន"
            clearable
            
          >
            <el-option
              v-for="company in companys"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
        </el-form-item>
           
          </el-col>
        </el-row>

        <el-divider>ត្រូវបញ្ចូលម៉ោងធ្វេីការ</el-divider>
        <div v-for="(shift, i) in createForm.shifts" :key="i" class="shift-row">
          <el-row :gutter="8" align="middle">
            <el-col :span="4">
              <el-select v-model="shift.day" placeholder="Day" size="large">
                <el-option v-for="(d,idx) in days" :key="idx" :label="d" :value="idx + 1" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="shift.shift_type" placeholder="Type" size="large" clearable>
                <el-option label="ធ្វេីការពេញម៉ោង" :value="1" />
                <el-option label="ធ្វេីការតែមួយព្រឹក" :value="2" />
                <el-option label="ធ្វេីការតែមួយរសៀល" :value="3" />
              </el-select>
            </el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_in1" placeholder="In 1" size="large" start="00:00" end="23:30"  /></el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_out1" placeholder="Out 1" size="large" start="00:00" end="23:30" /></el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_in2" placeholder="In 2" size="large" start="00:00" end="23:30" /></el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_out2" placeholder="Out 2" size="large" start="00:00" end="23:30" /></el-col>
            <el-col :span="2">
              <el-checkbox v-model="shift.is_dayoff" size="large">សម្រាក</el-checkbox>
            </el-col>
            <el-col :span="2">
              <el-button size="large" icon="Delete" circle type="danger" @click="createForm.shifts.splice(i,1)" />
            </el-col>
          </el-row>
        </div>
        <el-button size="small" icon="Plus" @click="addShift"  :disabled="createForm.shifts.length >= 7">បន្ថែមវេនការងារ</el-button>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleCreate">បង្កេីត</el-button>
      </template>
    </el-dialog>

<el-dialog
  v-model="editDialog"
  title="កែប្រែបុគ្គលិក"
  width="720px"
  destroy-on-close
  :close-on-click-modal="false"
  class="edit-dialog"
>
  <el-form
    :model="editForm"
    :rules="rules"
    ref="editFormRef"
    label-position="top"
  >
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12">
        <el-form-item label="ឈ្មោះ"  prop="name">
          <el-input v-model="editForm.name" placeholder="បញ្ចូលឈ្មោះ" />
        </el-form-item>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-form-item label="លេខទូរសព្ទ" prop="phone_hash">
          <el-input v-model="editForm.phone_hash" placeholder="0xx xxx xxx" />
        </el-form-item>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-form-item label="ភេទ" prop="gender">
          <el-select v-model="editForm.gender" placeholder="ជ្រើសភេទ" style="width:100%">
            <el-option label="ប្រុស" :value="1" />
            <el-option label="ស្រី" :value="2" />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-form-item label="ប្រាក់ខែ" prop="base_salary">
          <el-input
            v-model="editForm.base_salary"
            :min="0"
            controls-position="right"
            style="width:100%"
          />
        </el-form-item>
      </el-col>

      <el-col :xs="24" :sm="12">
        <el-form-item label="តួនាទី" prop="role_id">
          <el-select
            v-model="editForm.role_id"
            placeholder="ជ្រើសតួនាទី"
            clearable
            style="width:100%"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.display_name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
            <el-col :xs="24" :sm="12">
        <el-form-item label="ក្រុនហ៑ុន" prop="company_id">
          <el-select
            v-model="editForm.company_id"
            placeholder="ជ្រើសក្រុនហ៑ុន"
            clearable
            style="width:100%"
          >
            <el-option
              v-for="company in companys"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
        </el-form-item>
      </el-col>

    </el-row>
  </el-form>

  <template #footer>
    <div class="dialog-footer">
      <el-button @click="editDialog = false">បោះបង់</el-button>
      <el-button type="primary" :loading="saving" @click="handleUpdate">
        រក្សាទុក
      </el-button>
    </div>
  </template>
</el-dialog>

    <!-- Shifts View Dialog -->
<!-- Shifts View/Edit Dialog -->
<el-dialog
  v-model="shiftsDialog"
  :title="`វេនធ្វើការ របស់ ${selectedUser?.name}`"
  width="50%"
  class="shift-dialog"
  @closed="shiftsEditMode = false"
>
  <div style="display:flex; justify-content:flex-end; margin-bottom:12px">
      <el-button
    icon="Plus"
    size="large"
    type="success"
    :disabled="selectedUser?.shift_response?.length >= 7"
    @click="startShiftCreate"
  >
    បន្ថែមវេន
  </el-button>
    <el-button
      v-if="!shiftsEditMode"
      icon="Edit"
      size="large"
      @click="startShiftEdit"
    >
      កែប្រែ
    </el-button>

  </div>

  <el-table
    :data="editableShifts"
    size="large"
    stripe
    border
    empty-text="មិនមានទិន្នន័យវេនការងារ"
  >
    <el-table-column prop="day_name" label="ថ្ងៃ" width="100" />

    <el-table-column label="ប្រភេទ" width="190">
      <template #default="{ row }">
        <el-select v-if="shiftsEditMode" v-model="row.shift_type" size="large" style="width:100%" clearable>
          <el-option label="ធ្វេីការពេញម៉ោង" :value="1" />
          <el-option label="ធ្វេីការតែមួយព្រឹក"  :value="2" />
          <el-option label="ធ្វេីការតែមួយរសៀល"  :value="3" />
        </el-select>
        <span v-else>{{ row.shift_type_string }}</span>
      </template>
    </el-table-column>

    <el-table-column label="ចូលវេន១" width="165">
      <template #default="{ row }">
        <el-time-select v-if="shiftsEditMode" v-model="row.check_in1" size="large"   start="00:00" end="23:30"  />
        <span v-else>{{ row.check_in1 || '—' }}</span>
      </template>
    </el-table-column>

    <el-table-column label="ចេញវេន១" width="165">
      <template #default="{ row }">
        <el-time-select v-if="shiftsEditMode" v-model="row.check_out1" size="large" start="00:00" end="23:30"/>
        <span v-else>{{ row.check_out1 || '—' }}</span>
      </template>
    </el-table-column>

    <el-table-column label="ចូលវេន២" width="165">
      <template #default="{ row }">
        <el-time-select v-if="shiftsEditMode" v-model="row.check_in2" size="large" start="00:00" end="23:30"/>
        <span v-else>{{ row.check_in2 || '—' }}</span>
      </template>
    </el-table-column>

    <el-table-column label="ចេញវេន២" width="165">
      <template #default="{ row }">
        <el-time-select v-if="shiftsEditMode" v-model="row.check_out2" size="large" start="00:00" end="23:30"/>
        <span v-else>{{ row.check_out2 || '—' }}</span>
      </template>
    </el-table-column>

    <el-table-column label="ថ្ងៃសម្រាក" width="100" align="center">
      <template #default="{ row }">
        <el-checkbox v-if="shiftsEditMode" v-model="row.is_dayoff" />
        <el-tag v-else :type="row.is_dayoff ? 'danger' : 'success'">
          {{ row.is_dayoff ? 'សម្រាក' : 'ធ្វើការ' }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>

  <template #footer>
    <template v-if="shiftsEditMode">
      <el-button @click="cancelShiftEdit" size="large">បោះបង់</el-button>
      <el-button type="primary" :loading="savingShifts" @click="handleShiftUpdate" size="large">
        រក្សាទុក
      </el-button>
    </template>
  </template>
</el-dialog>

<el-dialog v-model="qrDialog" title="ស្កែន QR" width="220px" center :show-close="false">
  <div class="qr-box">
    <img v-if="qrImage" :src="qrImage" />
  </div>
</el-dialog>
<el-dialog
  v-model="shiftsCreateDialog"
  title="បន្ថែមវេនការងារ"
  width="1200px"
  destroy-on-close
>
  <div v-for="(shift, i) in newShifts" :key="i" class="shift-row">
    <el-row :gutter="8" align="middle">
      <el-col :span="4">
        <el-select v-model="shift.day" placeholder="ថ្ងៃ" size="large" style="width:100%">
          <el-option v-for="(d, idx) in days" :key="idx" :label="d" :value="idx+1" />
        </el-select>
      </el-col>
      <el-col :span="5">
        <el-select v-model="shift.shift_type" placeholder="ប្រភេទ" size="large" style="width:100%">
          <el-option label="ធ្វេីការពេញម៉ោង" :value="1" />
          <el-option label="ធ្វេីការតែមួយព្រឹក"  :value="2" />
          <el-option label="ធ្វេីការតែមួយរសៀល"  :value="3" />
        </el-select>
      </el-col>
      <el-col :span="3">
        <el-time-select v-model="shift.check_in1"  placeholder="ចូលវេន១" size="large" start="00:00" end="23:30" step="00:30" />
      </el-col>
      <el-col :span="3">
        <el-time-select v-model="shift.check_out1" placeholder="ចេញវេន១" size="large" start="00:00" end="23:30" step="00:30" />
      </el-col>
      <el-col :span="3">
        <el-time-select v-model="shift.check_in2"  placeholder="ចូលវេន២" size="large" start="00:00" end="23:30" step="00:30" />
      </el-col>
      <el-col :span="3">
        <el-time-select v-model="shift.check_out2" placeholder="ចេញវេន២" size="large" start="00:00" end="23:30" step="00:30" />
      </el-col>
      <el-col :span="2" style="text-align:center">
        <el-checkbox v-model="shift.is_dayoff" size="large">សម្រាក</el-checkbox>
      </el-col>
      <el-col :span="1">
        <el-button size="small" icon="Delete" circle type="danger" @click="newShifts.splice(i, 1)" />
      </el-col>
    </el-row>
  </div>

  <el-button size="small" icon="Plus" style="margin-top:8px" @click="addNewShiftRow" :disabled="newShifts.length >= 7">
    បន្ថែមជួរ
  </el-button>

  <template #footer>
    <el-button @click="shiftsCreateDialog = false">បោះបង់</el-button>
    <el-button type="primary" :loading="savingShifts" @click="handleShiftCreate">
      រក្សាទុក
    </el-button>
  </template>
</el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, toggleUserStatus, getrole,updateShift,createShift,getCompany } from '../api/services'
import { Watch } from '@element-plus/icons-vue'
import { watch } from 'vue'
import { debounce } from 'lodash-es'
import QRCode from "qrcode"

const shiftsCreateDialog = ref(false)
const newShifts = ref([])
const qrDialog = ref(false)
const qrImage = ref("")
const users = ref([])
const roles = ref([])
const companys = ref([])
const loading = ref(false)
const saving = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filters = reactive({ name: '', role_id: null })
const createDialog = ref(false)
const editDialog = ref(false)
const shiftsDialog = ref(false)
const selectedUser = ref(null)
const editId = ref(null)
const createFormRef = ref()
const editFormRef = ref()
const day = ref(1)
const shiftsEditMode = ref(false)
const savingShifts = ref(false)
const editableShifts = ref([])

const days = [
  'ចន្ទ',
  'អង្គារ',
  'ពុធ',
  'ព្រហស្បតិ៍',
  'សុក្រ',
  'សៅរ៍',
  'អាទិត្យ',
]

function startShiftCreate() {
   day.value = 1
  newShifts.value = [
    // បន្ថែម row ១ ទុកជាដំបូង
    {
      day: day.value,
      shift_type: 1,
      check_in1: '08:00',
      check_out1: '11:30',
      check_in2: '13:30',
      check_out2: '17:00',
      is_dayoff: false
    }
  ]
  shiftsCreateDialog.value = true
}

function addNewShiftRow() {
  const lastDay = newShifts.value.at(-1)?.day ?? 0

  if (lastDay >= 7) {
    ElMessage.warning('មិនអាចបន្ថែមបានទៀតទេ មានតែ ៧ ថ្ងៃក្នុងមួយសប្តាហ៍')
    return
  }

  newShifts.value.push({
    day: lastDay + 1,
    shift_type: 1,
    check_in1: '08:00',
    check_out1: '11:30',
    check_in2: '13:30',
    check_out2: '17:00',
    is_dayoff: false
  })
}

async function handleShiftCreate() {
  if (newShifts.value.length === 0) {
    ElMessage.warning('សូមបន្ថែមវេនមួយយ៉ាងហោចណាស់')
    return
  }

  savingShifts.value = true
  try {
    const payload = {
      shifts: newShifts.value.map(s => ({
        user_id:    selectedUser.value.id,
        day:        s.day,
        shift_type: s.shift_type,
        check_in1:  s.check_in1  || '',
        check_out1: s.check_out1 || '',
        check_in2:  s.check_in2  || '',
        check_out2: s.check_out2 || '',
        is_dayoff:  s.is_dayoff,
      }))
    }
    await createShift(payload)
  //  selectedUser.value.shift_response = JSON.parse(JSON.stringify(newShifts.value))
    ElMessage.success('បន្ថែមវេនការងារបានជោគជ័យ')
    await fetchUsers()
    shiftsCreateDialog.value = false
    shiftsDialog.value = false
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to create shifts')
  } finally {
    savingShifts.value = false
  }
}

const openQR = async (token) => {
  qrImage.value = await QRCode.toDataURL(token)
  qrDialog.value = true
}

const debouncedFetch = debounce(() => {
  page.value = 1
  fetchUsers()
}, 500)

watch(() => filters.name, debouncedFetch)
const createForm = reactive({
  company_id:null,
  name: '', phone_hash: '', role_id: null, gender: null,
  base_salary: '', shifts: []
})
const createRules = {
  name: [{ required: true, message: 'Name is required' }],
  phone_hash: [{ required: true, message: 'Phone is required' }],
}

const rules = {
  name: [
    { required: true, message: 'សូមបញ្ចូលឈ្មោះ', trigger: 'blur' }
  ],
  phone_hash: [
    { required: true, message: 'សូមបញ្ចូលលេខទូរសព្ទ', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: 'សូមជ្រើសភេទ', trigger: 'change' }
  ],
  base_salary: [
    { required: true, message: 'សូមបញ្ចូលប្រាក់ខែ', trigger: 'blur' }
  ],
  role_id: [
    { required: true, message: 'សូមជ្រើសតួនាទី', trigger: 'change' }
  ]
}

const editForm = reactive({ name: '', phone_hash: '', gender: 1, base_salary: '', role_id: null,company_id:null })

function addShift() {
  createForm.shifts.push({ day: 1, shift_type: 1, check_in1: '', check_out1: '', check_in2: '', check_out2: '', is_dayoff: false })
}

async function fetchUsers() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (filters.name) params.name = filters.name
    if (filters.role_id) params.role_id = filters.role_id
    const res = await getUsers(params)
    users.value = res.data.data || []
    total.value = res.data.pagination?.totalCount || 0
  } catch { ElMessage.error('Failed to load employees') }
  finally { loading.value = false }
}

async function fetchRole(){
  loading.value = true
  try {
    const res = await getrole()
    roles.value = res.data.data || []
  } catch { ElMessage.error('Failed to load employees') }
  finally {
    loading.value = false
  }
}

async function fetchCompany(){
  loading.value = true
  try {
    const res = await getCompany()
    companys.value = res.data.data || []
  } catch { ElMessage.error('Failed to load employees') }
  finally {
    loading.value = false
  }
}

function openCreate() {
    createForm.shifts = [
    { day: 1, shift_type: 1, check_in1: '07:00', check_out1: '11:30', check_in2: '13:30', check_out2: '17:00', is_dayoff: false },
    { day: 2, shift_type: 1, check_in1: '07:00', check_out1: '11:30', check_in2: '13:30', check_out2: '17:00', is_dayoff: false },
    { day: 3, shift_type: 1, check_in1: '07:00', check_out1: '11:30', check_in2: '13:30', check_out2: '17:00', is_dayoff: false },
    { day: 4, shift_type: 1, check_in1: '07:00', check_out1: '11:30', check_in2: '13:30', check_out2: '17:00', is_dayoff: false },
    { day: 5, shift_type: 1, check_in1: '07:00', check_out1: '11:30', check_in2: '13:30', check_out2: '17:00', is_dayoff: false },
    { day: 6, shift_type: 1, check_in1: '07:00', check_out1: '11:30', check_in2: '13:30', check_out2: '17:00', is_dayoff: false },
    { day: 7, shift_type: 1, check_in1: '07:00', check_out1: '11:30', check_in2: '13:30', check_out2: '17:00', is_dayoff: false  }, 
  ]
  Object.assign(createForm, { name: '', phone_hash: '', role_id: null, gender: null, base_salary: '', company_id: null })
  createDialog.value = true
}

async function handleCreate() {
  await createFormRef.value.validate()
  saving.value = true
  try {
    const payload = {
      name: createForm.name,
      phone_hash: createForm.phone_hash,
      role_id: createForm.role_id,
      gender: createForm.gender,
      base_salary: createForm.base_salary,
      company_id: createForm.company_id,
      day: createForm.shifts.map(s => s.day),
      shift_type: createForm.shifts.map(s => s.shift_type),
      check_in1: createForm.shifts.map(s => s.check_in1 || null),
      check_out1: createForm.shifts.map(s => s.check_out1 || null),
      check_in2: createForm.shifts.map(s => s.check_in2 || null),
      check_out2: createForm.shifts.map(s => s.check_out2 || null),
      is_dayoff: createForm.shifts.map(s => s.is_dayoff),
    }
    await createUser(payload)
    ElMessage.success('បង្កេីតបុគ្គលិកបានជោគជ័យ')
    createDialog.value = false
    fetchUsers()
  } catch (e) { ElMessage.error(e.response?.data?.message || 'Failed to create') }
  finally { saving.value = false }
}

function openEdit(row) {
  editId.value = row.id
  Object.assign(editForm, { name: row.name, phone_hash: row.phone_hash, gender: row.gender, base_salary: row.base_salary, role_id: row.role_id,company_id: row.company_id })
  editDialog.value = true
}

async function handleUpdate() {
  saving.value = true
  try {
    await updateUser(editId.value, editForm)
    ElMessage.success('កែប្រែបុគ្គលិកបានជោគជ័យ')
    editDialog.value = false
    fetchUsers()
  } catch (e) {
    ElMessage.error(
    e.response?.data?.message ||
    e.response?.data?.error ||
    e.message ||
    'Failed to update'
  )
  }
  finally { saving.value = false }
}

async function toggleStatus(row) {
  await ElMessageBox.confirm(`${row.is_active ? 'បិទ' : 'បេីក'} ${row.name}?`, 'សូមបញ្ជាក់', { type: 'warning' })
  try {
    await toggleUserStatus(row.id)
    ElMessage.success('កែប្រែស្ថានភាពបានជោគជ័យ')
    fetchUsers()
  } catch (e) { 

   ElMessage.error(e.response?.data?.message || e.message || 'Something went wrong, please try again')
  
  }
}

function openShifts(row) {
  selectedUser.value = row
  editableShifts.value = JSON.parse(JSON.stringify(row.shift_response || []))
  shiftsEditMode.value = false
  shiftsDialog.value = true
}

function startShiftEdit() {
  editableShifts.value = JSON.parse(JSON.stringify(selectedUser.value?.shift_response || []))
  shiftsEditMode.value = true
}

function cancelShiftEdit() {
  editableShifts.value = JSON.parse(JSON.stringify(selectedUser.value?.shift_response || []))
  shiftsEditMode.value = false
}

async function handleShiftUpdate() {
  savingShifts.value = true
  try {
    const payload = {
      shifts: editableShifts.value.map(s => ({
        id: s.id,
        check_in1:  s.check_in1  || null,
        check_out1: s.check_out1 || null,
        check_in2:  s.check_in2  || null,
        check_out2: s.check_out2 || null,
        shift_type: s.shift_type,
        is_dayoff:  s.is_dayoff,
      }))
    }
    await updateShift(payload)
    selectedUser.value.shift_response = JSON.parse(JSON.stringify(editableShifts.value))
    ElMessage.success('កែប្រែវេនការងារបានជោគជ័យ')
    shiftsEditMode.value = false
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to update shifts')
  } finally {
    savingShifts.value = false
  }
}

onMounted(() => {
  fetchCompany()
  fetchUsers()
  fetchRole()
})

</script>

<style scoped>
.filter-card { border-radius: 6px; padding: 4px 0; }
.table-card { border-radius: 6px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
.shift-row { background: #f9f9f9; border-radius: 8px; padding: 10px; margin-bottom: 8px; }
:deep(.el-table__header-wrapper th) {
  background-color: #4589ce !important;
  color: #ffffff !important;
}
.shift-dialog .el-dialog__header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.shift-dialog .el-dialog__body {
  padding: 24px;
}

.dialog-content {
  margin-top: 4px;
}

.qr-box {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px;
  background: #ffffff;
}

.qr-box img {
  width: 170px;
  height: 170px;
}

@media (max-width: 768px) {
  .shift-dialog {
    width: 95% !important;
  }

  .shift-dialog .el-dialog__body {
    padding: 16px;
  }
}
</style>
