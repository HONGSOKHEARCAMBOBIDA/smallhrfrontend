<template>
  <div>
    <!-- Check-in Action Card -->
    <!-- <el-card class="checkin-card">
      <template #header>
        <div style="display:flex; align-items:center; gap:8px">
          <el-icon color="#409eff"><Clock /></el-icon>
          <span class="card-title">Record Attendance</span>
        </div>
      </template>
      <el-form :model="attendForm" inline>
        <el-form-item label="Latitude">
          <el-input v-model="attendForm.latitude" placeholder="11.5564" style="width:150px" />
        </el-form-item>
        <el-form-item label="Longitude">
          <el-input v-model="attendForm.longitude" placeholder="104.9282" style="width:150px" />
        </el-form-item>
        <el-form-item label="Reason">
          <el-input v-model="attendForm.reason" placeholder="Optional reason" style="width:200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Location" :loading="checking" @click="handleCheckIn">
            Check In / Out
          </el-button>
          <el-button icon="Aim" @click="getLocation" title="Auto-detect location" />
        </el-form-item>
      </el-form>
    </el-card> -->

    <!-- Filters -->
    <el-card class="filter-card" style="margin-top:16px">
      <el-row :gutter="12">
        <el-col :span="5">
          <el-input v-model="filters.name" placeholder="ស្វែងរក" prefix-icon="Search" clearable @change="fetchAttendance" />
        </el-col>
        <el-col :span="4">
          <el-date-picker v-model="filters.check_date" type="date" placeholder="ជ្រេីសរេីសថ្ងៃទី"
            value-format="YYYY-MM-DD" clearable @change="fetchAttendance" style="width:100%" />
        </el-col>
        <el-col :span="3">
          <el-button type="primary" icon="Search" @click="fetchAttendance">Search</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- Attendance Table -->
    <el-card style="margin-top:16px; border-radius:6px">
      <el-table :data="attendance" v-loading="loading" stripe>
        <el-table-column prop="name" label="ឈ្មោះ" min-width="130" />
        <el-table-column prop="gender_string" label="ភេទ" width="90" />
        <el-table-column prop="role_name" label="តួនាទី" width="110" />
        <el-table-column prop="company_name" label="ក្រុមហ៑ុន" min-width="130" />
        <el-table-column prop="check_date" label="ថ្ងៃស្កែន" width="120" />
        <el-table-column label="ស្ថានភាព" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 'COMPLETE' ? 'success' : 'warning'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
<el-table-column label="លម្អិត" width="100" align="center">
  <template #default="{ row }">
    <div class="detail-action">
      <el-badge :value="row.attendance_record?.length || 0" :type="row.status === 'COMPLETE' ? 'success' : 'warning'">
        <el-button size="small" icon="List" circle @click="viewRecords(row)" />
      </el-badge>
    </div>
  </template>
</el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" v-model:page-size="pageSize" :total="total"
          layout="total, prev, pager, next" @change="fetchAttendance" />
      </div>
    </el-card>

    <!-- Attendance Records Detail Dialog -->
    <el-dialog v-model="recordsDialog" :title="`លម្អិត — ${selectedRow?.name}`" width="60%">
      <el-table :data="selectedRow?.attendance_record || []" size="large" stripe>
        <el-table-column prop="day_string" label="ថ្ងៃ" width="100" />
        <el-table-column prop="type_string" label="ប្រភេទ" width="150" />
        <el-table-column prop="check_time" label="ម៉ោងបានស្កែន" width="150" />
        <el-table-column prop="scheduled_time" label="ម៉ោងត្រូវស្កែន" width="110" />
        <el-table-column prop="time_diff" label="យឺត/មុនម៉ោង" width="150" />
        <el-table-column prop="attendance_type_name" label="ស្ថានភាព" min-width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getAttendTypeTag(row.attendance_type)">
              {{ row.attendance_type_name || '—' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="ទីតាំងស្កែន" width="120" align="center">
          <template #default="{ row }">
            <el-icon size="large" :color="row.inzone ? '#67c23a' : '#f56c6c'">
              <component :is="row.inzone ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="មូលហេតុ" min-width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createAttendance, getAttendance } from '../api/services'

const attendance = ref([])
const loading = ref(false)
const checking = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const filters = reactive({ name: '', check_date: '', company_id: '' })
const recordsDialog = ref(false)
const selectedRow = ref(null)

const attendForm = reactive({ latitude: '', longitude: '', reason: '' })

function getAttendTypeTag(type) {
  const map = { 1: 'success', 2: 'info', 3: 'warning', 4: 'danger' }
  return map[type] || 'info'
}

function getLocation() {
  if (!navigator.geolocation) return ElMessage.warning('Geolocation not supported')
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      attendForm.latitude = String(pos.coords.latitude)
      attendForm.longitude = String(pos.coords.longitude)
      ElMessage.success('Location detected')
    },
    () => ElMessage.error('Failed to get location')
  )
}

async function handleCheckIn() {
  if (!attendForm.latitude || !attendForm.longitude) {
    return ElMessage.warning('Please provide latitude and longitude')
  }
  checking.value = true
  try {
    await createAttendance(attendForm)
    ElMessage.success('Attendance recorded successfully')
    fetchAttendance()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to record attendance')
  } finally {
    checking.value = false
  }
}

async function fetchAttendance() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (filters.name) params.name = filters.name
    if (filters.check_date) params.check_date = filters.check_date
    if (filters.company_id) params.company_id = filters.company_id
    const res = await getAttendance(params)
    attendance.value = res.data.data || []
    total.value = res.data.pagination?.totalCount || 0
  } catch { ElMessage.error('Failed to load attendance') }
  finally { loading.value = false }
}

function viewRecords(row) {
  selectedRow.value = row
  recordsDialog.value = true
}

onMounted(fetchAttendance)
</script>

<style scoped>
.checkin-card { border-radius: 6px; }
.filter-card { border-radius: 6px; }
.card-title { font-weight: 600; font-size: 15px; }
.pagination-wrap { margin-top: 16px; display: flex; justify-content: flex-end; }
:deep(.el-table__header-wrapper th) {
  background-color: #4589ce !important;
  color: #ffffff !important;
}
.detail-action {
  padding: 10px 0;
}
</style>
