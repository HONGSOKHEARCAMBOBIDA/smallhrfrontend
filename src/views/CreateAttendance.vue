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
      <el-form-item>
<el-button type="primary" :loading="loading" @click="handleCheckIn" size="large" style="width: 100%; height: 80px;">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
    <div style="padding-top: 1px; padding-bottom: 10px; padding-left: 16px; padding-right: 16px;">
        <span style="font-size: 22px;">ចុះវត្តមាន</span>
    </div>
    <span style="font-size: 13px; opacity: 0.95;">{{ currentTime }}</span>
  </div>
</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted,onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createAttendance } from '../api/services';
const currentTime = ref('')
const loading = ref(false)
const attendForm = reactive({ latitude: '', longitude: '', reason: '' })
function getLocation() {
  if (!navigator.geolocation) return ElMessage.warning('Geolocation not supported')
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      attendForm.latitude = String(pos.coords.latitude)
      attendForm.longitude = String(pos.coords.longitude)
//      ElMessage.success('Location detected')
    },
    () => ElMessage.error('Failed to get location')
  )
}
function updateTime() {
  currentTime.value = new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
async function handleCheckIn() {
    if(!attendForm.latitude || !attendForm.longitude){
        return ElMessage.warning('ចាប់ទីតាំងមិនបាន!!')
    }
    loading.value = true
    try {
        await createAttendance(attendForm)
        ElMessage.success('ចុះវត្តមានបានជោគជ័យ')
    } catch(e){
        ElMessage.error(e.response?.data?.message || 'Sorry Something went to wrong')
    } finally {
        loading.value = false
    }
}
let timer
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  getLocation()
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.checkin-card { border-radius: 6px; }

</style>