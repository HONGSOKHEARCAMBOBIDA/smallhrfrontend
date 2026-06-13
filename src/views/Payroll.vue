<template>
  <div>
    <!-- Payroll Draft Section -->
    <el-card class="top-card">
      <template #header>
        <div style="display:flex; align-items:center; justify-content:space-between">
          <span class="card-title">ប្រាក់ខែត្រូវបេីក</span>
          <div style="display:flex; gap:10px; align-items:center">
            <el-select v-model="payrollType" style="width:160px" @change="fetchDraft">
              <el-option label="បេីកពេញ១ខែ" :value="1" />
              <el-option label="បេីកកន្លះខែ" :value="2" />
            </el-select>
            <el-button type="primary" icon="Refresh" @click="fetchDraft" :loading="draftLoading">
              ទាញទិន្ន័យម្ដងទៀត
            </el-button>
            <el-button type="success" icon="Money" @click="confirmPayroll"
              :disabled="!selectedRows.length" :loading="paying">
              បេីកប្រាក់ខែ ({{ selectedRows.length }}) នាក់
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="draft" v-loading="draftLoading" @selection-change="selectedRows = $event" stripe>
        <el-table-column type="selection" width="50" />
        <el-table-column prop="user_name" label="ឈ្មោះបុគ្គលិក" min-width="130" />
        <el-table-column prop="role_name" label="តួនាទី" width="110" />
        <el-table-column prop="basic_salary" label="ប្រាក់ខែគោល" width="120">
          <template #default="{ row }">{{ row.basic_salary }} {{ row.currency }}</template>
        </el-table-column>
        <el-table-column prop="half_salary" label="ប្រាក់ខែពាក់កណ្ដាល" width="155" />
        <el-table-column prop="total_work_day" label="ចំនួនថ្ងៃធ្វើការ" width="100" align="center" />
        <el-table-column prop="total_late" label="ចំនួនយឺត" width="105" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.total_late" type="warning" size="small">{{ row.total_late }}</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_left_early" label="ចេញមុនម៉ោង" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.total_left_early" type="danger" size="small">{{ row.total_left_early }}</el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="total_deduction" label="កាត់លុយ" width="110" /> -->
         <el-table-column label="កាត់លុយ" width="80" align="center">
            <template #default="{row}">
<el-input
  v-model="row.total_deduction"
  :rows="1"
  :autosize="{ minRows: 1, maxRows: 3 }"
/>
            </template>
          </el-table-column>
        <el-table-column label="ប្រាក់ខែទទួលបាន" width="180">
         
                    <template #default="{row}">
<el-input
  v-model="row.net_salary"
  :rows="1"
  :autosize="{ minRows: 1, maxRows: 3 }">
<template #append>{{ row.currency }}</template>
</el-input>

            </template>
        </el-table-column>
        <el-table-column label="ផ្សេងៗ" width="110" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.unpaid_attendance?.length || 0 }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Pay Dialog -->
    <el-dialog v-model="payDialog" title="ពិនិត្យប្រាក់ខែម្ដងទៀត" width="720px">
      <el-alert title="សូមពិនិត្យព័ត៌មានប្រាក់បៀវត្សរ៍ឱ្យបានត្រឹមត្រូវ មុនពេលបញ្ជាក់។ សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានទេ" type="warning" show-icon :closable="false" style="margin-bottom:16px" />
      <el-form :model="payForm" label-width="130px">
        <el-form-item label="ថ្ងៃទីបេីកប្រាក់ខែ">
          <el-date-picker v-model="payForm.payroll_date" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
        <el-form-item label="ប្រភេទប្រាក់ខែ">
          <el-select v-model="payForm.payroll_type" style="width:100%">
            <el-option label="បេីកពេញ១ខែ" :value="1" />
            <el-option label="បេីកកន្លះខែ" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="សម្គល់">
          <el-input v-model="payForm.note" type="textarea" :rows="2" placeholder="Optional note" />
        </el-form-item>
      </el-form>

      <el-table :data="selectedRows" size="large" max-height="400">
        <el-table-column prop="user_name" label="ឈ្មោះបុគ្គលិក" />
        <el-table-column prop="net_salary" label="ប្រាក់ខែទទួលបាន" width="150">
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
      attendance_id: row.unpaid_attendance || [],
    }))
    await createPayroll({ payrolls })
    ElMessage.success('ប្រាក់ខែបេីកបានជោគជ័យ')
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
.top-card { border-radius: 6px; }
.card-title { font-weight: 600; font-size: 15px; }
:deep(.el-table__header-wrapper th) {
  background-color: #4589ce !important;
  color: #ffffff !important;
}
</style>
