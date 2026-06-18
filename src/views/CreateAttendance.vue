<template>
  <el-card class="checkin-card">
    <template #header>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <el-text style="color: black; font-size: 18px; font-weight: bold;">វត្តមាន</el-text>
      </div>
      <el-text style="color: black; font-size: 18px; font-weight: bold;">
        {{ new Date().toLocaleDateString('km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
      </el-text>
    </template>

    <el-form :model="attendForm">
      <el-form-item label="មូលហេតុ">
        <el-input type="textarea" v-model="attendForm.reason" placeholder="បញ្ចូលមូលហេតុ" style="width: 100%;" />
      </el-form-item>

      <!-- Draft info row -->
      <el-form-item v-if="draft">
        <div style="display: flex; justify-content: space-between; width: 100%; color: #606266; font-size: 14px;">
          <span>{{ draft.type_string }}</span>
          <span>ម៉ោងកំណត់: {{ draft.scheduled_time }}</span>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          :type="draft?.type === 1 || draft?.type === 3 ? 'primary' : 'warning'"
          :loading="loading || draftLoading"
          :disabled="!draft"
          @click="handleCheckIn"
          size="large"
          style="width: 100%; height: 80px;"
        >
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="padding-top: 1px; padding-bottom: 10px; padding-left: 16px; padding-right: 16px;">
              <!-- Show type label from draft, fallback while loading -->
              <span style="font-size: 22px;">
                {{ draftLoading ? 'កំពុងផ្ទុក...' : (draft?.type_string ?? 'ចុះវត្តមាន') }}
              </span>
            </div>
            <span style="font-size: 13px; opacity: 0.95;">{{ currentTime }}</span>
          </div>
        </el-button>
      </el-form-item>

      <!-- Error state -->
      <el-alert v-if="draftError" :title="draftError" type="warning" show-icon :closable="false" />
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createAttendance, getAttendanceDraft } from '../api/services'

const currentTime = ref('')
const loading = ref(false)
const attendForm = reactive({ latitude: '', longitude: '', reason: '' })

// --- Draft state ---
const draft = ref(null)       // { type, type_string, scheduled_time }
const draftLoading = ref(false)
const draftError = ref('')

async function fetchDraft() {
  draftLoading.value = true
  draftError.value = ''
  draft.value = null
  try {
    const res = await getAttendanceDraft()
    draft.value = res.data.data || []
  } catch (e) {
    draftError.value = e.response?.data?.message || 'គ្មានព័ត៌មានវត្តមានបាន'
  } finally {
    draftLoading.value = false
  }
}

function getLocation() {
  if (!navigator.geolocation) return ElMessage.warning('Geolocation not supported')
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      attendForm.latitude = String(pos.coords.latitude)
      attendForm.longitude = String(pos.coords.longitude)
    },
    () => ElMessage.error('Failed to get location')
  )
}

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('km-KH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

async function handleCheckIn() {
  if (!attendForm.latitude || !attendForm.longitude) {
    return ElMessage.warning('ចាប់ទីតាំងមិនបាន!!')
  }
  loading.value = true
  try {
    await createAttendance(attendForm)
    ElMessage.success('ចុះវត្តមានបានជោគជ័យ')
    // Refresh draft so the button updates to the next session
    await fetchDraft()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || 'Sorry Something went wrong')
  } finally {
    loading.value = false
  }
}

let timer
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  getLocation()
  fetchDraft()
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.checkin-card { border-radius: 6px; }
</style>