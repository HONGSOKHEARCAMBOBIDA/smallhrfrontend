<template>
  <div>
    <!-- Filters -->
    <el-card class="filter-card">
      <el-row :gutter="12" align="middle">
        <el-col :span="6">
          <el-input v-model="filters.name" placeholder="ស្វែងរក" prefix-icon="Search" clearable @change="fetchUsers" />
        </el-col>
        <el-col :span="4">
          <el-select v-model="filters.role_id" placeholder="All Roles" clearable @change="fetchUsers" style="width:100%">
            <el-option label="Employee" :value="1" />
            <el-option label="Manager" :value="2" />
            <el-option label="HR" :value="3" />
            <el-option label="Super Admin" :value="7" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input v-model="filters.company_id" placeholder="Company ID" clearable @change="fetchUsers" />
        </el-col>
        <el-col :span="10" style="text-align:right">
          <el-button type="primary" icon="Plus" @click="openCreate">Add Employee</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Table -->
    <el-card class="table-card" style="margin-top:16px">
      <el-table :data="users" v-loading="loading" stripe row-key="id">
        <el-table-column prop="name" label="Name" min-width="140" />
        <el-table-column prop="phone_hash" label="Phone" width="130" />
        <el-table-column prop="role_name" label="Role" width="110" />
        <el-table-column prop="company_name" label="Company" min-width="130" />
        <el-table-column prop="gender_string" label="Gender" width="90" />
        <el-table-column prop="base_salary" label="Base Salary" width="120">
          <template #default="{ row }">{{ row.base_salary }} {{ row.currency }}</template>
        </el-table-column>
        <el-table-column label="Status" width="95">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
              {{ row.is_active ? 'Active' : 'Inactive' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" icon="Edit" circle @click="openEdit(row)" title="Edit" />
            <el-button size="small" :icon="row.is_active ? 'CircleClose' : 'CircleCheck'" circle
              :type="row.is_active ? 'danger' : 'success'" @click="toggleStatus(row)" title="Toggle Status" />
            <el-button size="small" icon="View" circle @click="openShifts(row)" title="Shifts" />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next" @change="fetchUsers" />
      </div>
    </el-card>

    <!-- Create Employee Dialog -->
    <el-dialog v-model="createDialog" title="Add Employee" width="680px" destroy-on-close>
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="130px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Full Name" prop="name">
              <el-input v-model="createForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Phone" prop="phone_hash">
              <el-input v-model="createForm.phone_hash" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Role ID" prop="role_id">
              <el-input-number v-model="createForm.role_id" :min="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Gender" prop="gender">
              <el-select v-model="createForm.gender" style="width:100%">
                <el-option label="Male" :value="1" />
                <el-option label="Female" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Base Salary">
              <el-input v-model="createForm.base_salary" placeholder="e.g. 500" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Company ID">
              <el-input-number v-model="createForm.company_id" :min="0" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>Work Shifts (optional)</el-divider>
        <div v-for="(shift, i) in createForm.shifts" :key="i" class="shift-row">
          <el-row :gutter="8" align="middle">
            <el-col :span="4">
              <el-select v-model="shift.day" placeholder="Day" size="small">
                <el-option v-for="(d,idx) in days" :key="idx" :label="d" :value="idx" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="shift.shift_type" placeholder="Type" size="small">
                <el-option label="Full Day" :value="1" />
                <el-option label="Morning" :value="2" />
                <el-option label="Evening" :value="3" />
              </el-select>
            </el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_in1" placeholder="In 1" size="small" /></el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_out1" placeholder="Out 1" size="small" /></el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_in2" placeholder="In 2" size="small" /></el-col>
            <el-col :span="3"><el-time-select v-model="shift.check_out2" placeholder="Out 2" size="small" /></el-col>
            <el-col :span="2">
              <el-checkbox v-model="shift.is_dayoff" size="small">Off</el-checkbox>
            </el-col>
            <el-col :span="2">
              <el-button size="small" icon="Delete" circle type="danger" @click="createForm.shifts.splice(i,1)" />
            </el-col>
          </el-row>
        </div>
        <el-button size="small" icon="Plus" @click="addShift">Add Shift Row</el-button>
      </el-form>
      <template #footer>
        <el-button @click="createDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleCreate">Create</el-button>
      </template>
    </el-dialog>

    <!-- Edit Employee Dialog -->
    <el-dialog v-model="editDialog" title="Edit Employee" width="480px" destroy-on-close>
      <el-form :model="editForm" ref="editFormRef" label-width="130px">
        <el-form-item label="Full Name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="Phone">
          <el-input v-model="editForm.phone_hash" />
        </el-form-item>
        <el-form-item label="Gender">
          <el-select v-model="editForm.gender" style="width:100%">
            <el-option label="Male" :value="1" />
            <el-option label="Female" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="Base Salary">
          <el-input v-model="editForm.base_salary" />
        </el-form-item>
        <el-form-item label="Role ID">
          <el-input-number v-model="editForm.role_id" :min="1" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="handleUpdate">Update</el-button>
      </template>
    </el-dialog>

    <!-- Shifts View Dialog -->
    <el-dialog v-model="shiftsDialog" :title="`Shifts — ${selectedUser?.name}`" width="700px">
      <el-table :data="selectedUser?.shift_response || []" size="small">
        <el-table-column prop="day_name" label="Day" width="100" />
        <el-table-column prop="shift_type_string" label="Type" width="110" />
        <el-table-column prop="check_in1" label="Check In 1" width="110" />
        <el-table-column prop="check_out1" label="Check Out 1" width="115" />
        <el-table-column prop="check_in2" label="Check In 2" width="110" />
        <el-table-column prop="check_out2" label="Check Out 2" width="115" />
        <el-table-column label="Day Off" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_dayoff ? 'danger' : 'success'" size="small">
              {{ row.is_dayoff ? 'Yes' : 'No' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, toggleUserStatus } from '../api/services'

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filters = reactive({ name: '', role_id: null, company_id: '' })
const createDialog = ref(false)
const editDialog = ref(false)
const shiftsDialog = ref(false)
const selectedUser = ref(null)
const editId = ref(null)
const createFormRef = ref()
const editFormRef = ref()

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const createForm = reactive({
  name: '', phone_hash: '', role_id: 1, gender: 1,
  base_salary: '', company_id: 0, shifts: []
})
const createRules = {
  name: [{ required: true, message: 'Name is required' }],
  phone_hash: [{ required: true, message: 'Phone is required' }],
}
const editForm = reactive({ name: '', phone_hash: '', gender: 1, base_salary: '', role_id: 1 })

function addShift() {
  createForm.shifts.push({ day: 1, shift_type: 1, check_in1: '', check_out1: '', check_in2: '', check_out2: '', is_dayoff: false })
}

async function fetchUsers() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (filters.name) params.name = filters.name
    if (filters.role_id) params.role_id = filters.role_id
    if (filters.company_id) params.company_id = filters.company_id
    const res = await getUsers(params)
    users.value = res.data.data || []
    total.value = res.data.metadata?.total_count || 0
  } catch { ElMessage.error('Failed to load employees') }
  finally { loading.value = false }
}

function openCreate() {
  createForm.shifts = []
  Object.assign(createForm, { name: '', phone_hash: '', role_id: 1, gender: 1, base_salary: '', company_id: 0 })
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
      check_in1: createForm.shifts.map(s => s.check_in1),
      check_out1: createForm.shifts.map(s => s.check_out1),
      check_in2: createForm.shifts.map(s => s.check_in2),
      check_out2: createForm.shifts.map(s => s.check_out2),
      is_dayoff: createForm.shifts.map(s => s.is_dayoff),
    }
    await createUser(payload)
    ElMessage.success('Employee created (default password: 12345678)')
    createDialog.value = false
    fetchUsers()
  } catch (e) { ElMessage.error(e.response?.data?.message || 'Failed to create') }
  finally { saving.value = false }
}

function openEdit(row) {
  editId.value = row.id
  Object.assign(editForm, { name: row.name, phone_hash: row.phone_hash, gender: row.gender, base_salary: row.base_salary, role_id: row.role_id })
  editDialog.value = true
}

async function handleUpdate() {
  saving.value = true
  try {
    await updateUser(editId.value, editForm)
    ElMessage.success('Employee updated')
    editDialog.value = false
    fetchUsers()
  } catch (e) { ElMessage.error(e.response?.data?.message || 'Failed to update') }
  finally { saving.value = false }
}

async function toggleStatus(row) {
  await ElMessageBox.confirm(`${row.is_active ? 'Deactivate' : 'Activate'} ${row.name}?`, 'Confirm', { type: 'warning' })
  try {
    await toggleUserStatus(row.id)
    ElMessage.success('Status updated')
    fetchUsers()
  } catch (e) { ElMessage.error('Failed') }
}

function openShifts(row) {
  selectedUser.value = row
  shiftsDialog.value = true
}

onMounted(fetchUsers)
</script>

<style scoped>
.filter-card { border-radius: 6px; padding: 4px 0; }
.table-card { border-radius: 6px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
.shift-row { background: #f9f9f9; border-radius: 8px; padding: 10px; margin-bottom: 8px; }
</style>
