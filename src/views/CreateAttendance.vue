<template>
  <el-card class="checkin-card">
    <template #header>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <el-text style="color: black; font-size: 18px; font-weight: bold;">វត្តមាន</el-text>
      </div>
      <el-row justify="space-between" align="middle">
        <el-text style="color: black; font-size: 18px; font-weight: bold;">
          {{ new Date().toLocaleDateString('km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
          }}
        </el-text>
        <AppButton type="success" size="large" @click="getLocation()" icon="MapLocation" plain>
          ទាញទីតាំង
        </AppButton>
      </el-row>
    </template>
    <el-form :model="attendForm">
      <el-form-item label="មូលហេតុ" :required="reasonRequired">
        <el-input type="textarea" v-model="attendForm.reason" :placeholder="reasonPlaceholder" style="width: 100%;" />
      </el-form-item>

      <!-- Draft info row -->
      <el-form-item v-if="draft">
        <div style="display: flex; justify-content: space-between; width: 100%; color: #606266; font-size: 14px;">
          <el-text tag="b" type="primary">{{ draft.type_string }}</el-text>
          <el-text tag="b" style="color: black;">ម៉ោងកំណត់: {{ draft.scheduled_time }}</el-text>
          <!-- <el-switch v-model="attendForm.is_permission" size="large">

          </el-switch> -->
        </div>
      </el-form-item>

      <!-- Late / early-leave warning -->
      <el-form-item v-if="reasonRequired">
        <el-alert :title="isLate ? 'អ្នកមកយឺត សូមបញ្ចូលមូលហេតុ' : 'អ្នកចេញមុនម៉ោង សូមបញ្ចូលមូលហេតុ'" type="warning"
          show-icon :closable="false" />
      </el-form-item>

      <el-form-item>
        <el-button :type="isCheckInType ? 'primary' : 'warning'" :loading="loading || draftLoading"
          :disabled="isButtonDisabled" @click="handleCheckIn" size="large" style="width: 100%; height: 80px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="padding-top: 1px; padding-bottom: 10px; padding-left: 16px; padding-right: 16px;">
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createAttendance, getAttendanceDraft } from '../api/services'
import { ElNotification } from 'element-plus'
import AppButton from "../../components/AppButton.vue";

const now = ref(new Date())
const currentTime = ref('')
const loading = ref(false)
const attendForm = reactive({ latitude: '', longitude: '', reason: ''})

const draft = ref(null)
const draftLoading = ref(false)
const draftError = ref('')

const isCheckInType = computed(() => draft.value?.type === 1 || draft.value?.type === 3)
const isCheckOutType = computed(() => draft.value?.type === 2 || draft.value?.type === 4)

const scheduledDateTime = computed(() => {
  const t = draft.value?.scheduled_time
  if (!t) return null
  const [h, m, s] = t.split(':').map(Number)
  const d = new Date()
  d.setHours(h || 0, m || 0, s || 0, 0)
  return d
})

const isLate = computed(() =>
  isCheckInType.value && scheduledDateTime.value && now.value > scheduledDateTime.value
)

const isEarlyLeave = computed(() =>
  isCheckOutType.value && scheduledDateTime.value && now.value < scheduledDateTime.value
)

const reasonRequired = computed(() => isLate.value || isEarlyLeave.value)

const reasonPlaceholder = computed(() => {
  if (isLate.value) return 'សូមបញ្ចូលមូលហេតុមកយឺត'
  if (isEarlyLeave.value) return 'សូមបញ្ចូលមូលហេតុចេញមុនម៉ោង'
  return 'បញ្ចូលមូលហេតុ'
})

const reasonMissing = computed(() => reasonRequired.value && !attendForm.reason.trim())

const isButtonDisabled = computed(() => !draft.value || reasonMissing.value)

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

// function getLocation() {
//   if (!navigator.geolocation) return ElMessage.warning('Geolocation not supported')
//   navigator.geolocation.getCurrentPosition(
//     (pos) => {
//       attendForm.latitude = String(pos.coords.latitude)
//       attendForm.longitude = String(pos.coords.longitude)
//     },
//     () => ElMessage.error('Failed to get location')
//   )
// }

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      ElNotification({
        title: 'មានបញ្ហាទីតាំង',
        message: 'Geolocation not supported',
        type: 'error',
      })
      return reject()
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        attendForm.latitude = String(pos.coords.latitude)
        attendForm.longitude = String(pos.coords.longitude)
        resolve()
      },
      () => {
        ElNotification({
          title: 'មានបញ្ហាទីតាំង',
          message: 'ចាប់ទីតាំងមិនបាន',
          type: 'error',
        })
        reject()
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

function updateTime() {
  now.value = new Date()
  currentTime.value = now.value.toLocaleTimeString('km-KH', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

async function handleCheckIn() {
  if (reasonMissing.value) {
    return ElMessage.warning('សូមបញ្ចូលមូលហេតុជាមុនសិន')
  }
  if (!attendForm.latitude || !attendForm.longitude) {
    return ElNotification({
      title: 'មានបញ្ហាទីតាំង',
      message: 'មិនអាចទទួលបានទីតាំង សូមបើកការអនុញ្ញាត GPS',
      type: 'error',
    })
  }
  loading.value = true
  try {
    await createAttendance(attendForm)
    ElNotification({
      title: 'ជោគជ័យ',
      message: 'ចុះវត្តមានបានជោគជ័យ',
      type: 'success',
    })
    attendForm.reason = ''
    // Refresh draft so the button updates to the next session
    await fetchDraft()
  } catch (e) {
    ElNotification({
      title: 'មានបញ្ហា',
      message: e.response?.data?.error || "",
      type: 'error',
    })
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
.checkin-card {
  border-radius: 6px;
}
</style>