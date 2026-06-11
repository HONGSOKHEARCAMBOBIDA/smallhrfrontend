<template>
  <div>
    <!-- Payroll Draft Section -->
    <el-card class="top-card">
      <template #header>
        <div style="display:flex; align-items:center; justify-content:space-between">
          <span class="card-title">Payroll Draft</span>
          <div style="display:flex; gap:10px; align-items:center">
            <el-select v-model="payrollType" style="width:160px" @change="fetchDraft">
              <el-option label="Full Month" :value="1" />
              <el-option label="Half Month" :value="2" />
            </el-select>
            <el-button type="primary" icon="Refresh" @click="fetchDraft" :loading="draftLoading">
              Load Draft
            </el-button>
            <el-button type="success" icon="Money" @click="confirmPayroll"
              :disabled="!selectedRows.length" :loading="paying">
              Pay Selected ({{ selectedRows.length }})
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="draft" v-loading="draftLoading" @selection-change="selectedRows = $event" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="user_name" label="Employee" min-width="130" />
        <el-table-column prop="role_name" label="Role" width="110" />
        <el-table-column prop="basic_salary" label="Basic Salary" width="120">
          <template #default="{ row }">{{ row.basic_salary }} {{ row.currency }}</template>
        </el-table-column>
        <el-table-column prop="half_salary" label="Half Salary" width="115" />
        <el-table-column prop="total_work_day" label="Work Days" width="100" align="center" />
        <el-table-column prop="total_late" label="Late" width="75" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.total_late" type="warning" size="small">{{ row.total_late }}</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_left_early" label="Early Out" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.total_left_early" type="danger" size="small">{{ row.total_left_early }}</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_deduction" label="Deduction" width="110" />
        <el-table-column label="Net Salary" width="130">
          <template #default="{ row }">
            <strong style="color:#67c23a">{{ row.net_salary }} {{ row.currency }}</strong>
          </template>
        </el-table-column>
        <el-table-column label="Unpaid Days" width="110" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.count_un_paid_attendance?.length || 0 }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Pay Dialog -->
    <el-dialog v-model="payDialog" title="Confirm Payroll" width="560px">
      <el-alert title="Review payroll details before confirming. This action is irreversible." type="warning" show-icon :closable="false" style="margin-bottom:16px" />
      <el-form :model="payForm" label-width="130px">
        <el-form-item label="Payroll Date">
          <el-date-picker v-model="payForm.payroll_date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="Payroll Type">
          <el-select v-model="payForm.payroll_type" style="width:100%">
            <el-option label="Full Month" :value="1" />
            <el-option label="Half Month" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="Note">
          <el-input v-model="payForm.note" type="textarea" :rows="2" placeholder="Optional note" />
        </el-form-item>
      </el-form>

      <el-table :data="selectedRows" size="small" max-height="200">
        <el-table-column prop="user_name" label="Employee" />
        <el-table-column prop="net_salary" label="Net Salary" width="120">
          <template #default="{ row }">{{ row.net_salary }} {{ row.currency }}</template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="payDialog = false">Cancel</el-button>
        <el-button type="primary" :loading="paying" @click="submitPayroll">Confirm & Pay</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPayrollDraft, createPayroll } from '../api/services'

const draft = ref([])
const draftLoading = ref(false)
const paying = ref(false)
const payrollType = ref(1)
const selectedRows = ref([])
const payDialog = ref(false)

const payForm = reactive({
  payroll_date: new Date().toISOString().split('T')[0],
  payroll_type: 1,
  note: ''
})

async function fetchDraft() {
  draftLoading.value = true
  try {
    const res = await getPayrollDraft({ payroll_type: payrollType.value })
    draft.value = res.data.data || []
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to load payroll draft')
  } finally {
    draftLoading.value = false
  }
}

function confirmPayroll() {
  if (!selectedRows.value.length) return ElMessage.warning('Select employees to pay')
  payForm.payroll_type = payrollType.value
  payDialog.value = true
}

async function submitPayroll() {
  paying.value = true
  try {
    const payrolls = selectedRows.value.map(row => ({
      user_id: row.user_id,
      basic_salary: row.basic_salary,
      half_salary: row.half_salary,
      other: '0',
      total_work_day: row.total_work_day,
      total_deduction: row.total_deduction,
      net_salary: row.net_salary,
      payroll_type: payForm.payroll_type,
      payroll_date: payForm.payroll_date,
      status: 0,
      note: payForm.note,
      attendance_id: row.count_un_paid_attendance || [],
    }))
    await createPayroll({ payrolls })
    ElMessage.success('Payroll processed successfully')
    payDialog.value = false
    selectedRows.value = []
    fetchDraft()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to process payroll')
  } finally {
    paying.value = false
  }
}

onMounted(fetchDraft)
</script>

<style scoped>
.top-card { border-radius: 12px; }
.card-title { font-weight: 600; font-size: 15px; }
</style>
