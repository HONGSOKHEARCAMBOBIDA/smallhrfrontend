<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <el-icon size="48" color="#409eff"><UserFilled /></el-icon>
        <h1>គ្រប់គ្រងបុគ្គលិក</h1>
        <p>ប្រព័ន្ធគ្រប់គ្រងបុគ្គលិក និងធនធានមនុស្ស</p>
      </div>

      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="ចូលតាមរយៈលេខទូរសព្ទ" name="phone">
          <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin" label-position="top">
            <el-form-item label="លេខទូរសព្ទ" prop="phone">
              <el-input v-model="form.phone" placeholder="បញ្ចូលលេខទូរសព្ទ" prefix-icon="Phone" size="large" />
            </el-form-item>
            <el-form-item label="ពាក្យសម្ងាត់" prop="password">
              <el-input v-model="form.password" type="password" placeholder="បញ្ចូលពាក្យសម្ងាត់" prefix-icon="Lock" size="large" show-password />
            </el-form-item>
            <el-button type="primary" native-type="submit" size="large" :loading="loading" class="login-btn">
              ចូលប្រព័ន្ធ
            </el-button>
          </el-form>
        </el-tab-pane>

<el-tab-pane label="ចូលតាមរយៈQR" name="qr">
  <div class="qr-scanner-wrap">
    <div v-if="!scanning && !loading" class="qr-start">
      <p class="qr-hint">ចុចប៊ូតុងខាងក្រោម ដើម្បីស្កែន QR Code</p>
      <el-button type="primary" size="large" class="login-btn" @click="startScanner">
        <el-icon><Camera /></el-icon>&nbsp; បើកកាមេរ៉ាស្កែន
      </el-button>
    </div>

    <!-- Scanner viewport -->
    <div v-show="scanning" class="qr-viewport">
      <div id="qr-reader"></div>
      <p class="qr-hint">ដាក់ QR Code នៅក្នុងប្រអប់ស្កែន</p>
      <el-button size="small" @click="stopScanner" style="margin-top:12px">
        បោះបង់
      </el-button>
    </div>

    <div v-if="loading" class="qr-loading">
      <el-icon class="is-loading" size="32"><Loading /></el-icon>
      <p>កំពុងចូលប្រព័ន្ធ...</p>
    </div>
  </div>
</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { login, loginByQr } from '../api/services'
import { Html5Qrcode } from 'html5-qrcode'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref()
const loading = ref(false)
const activeTab = ref('phone')
const qrToken = ref('')
const scanning = ref(false)
let html5QrCode = null

async function startScanner() {
  scanning.value = true
  await nextTick() // wait for #qr-reader to mount

  html5QrCode = new Html5Qrcode('qr-reader')
  try {
    await html5QrCode.start(
      { facingMode: 'environment' },           // rear camera
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        stopScanner()
        handleQrLogin(decodedText)             // auto-login on scan
      },
      () => {}                                 // ignore per-frame errors
    )
  } catch (e) {
    ElMessage.error('មិនអាចបើកកាមេរ៉ាបាន: ' + e)
    scanning.value = false
  }
}

function stopScanner() {
  scanning.value = false
  html5QrCode?.stop().catch(() => {})
  html5QrCode = null
}

const form = reactive({ phone: '', password: '' })
const rules = {
  phone: [{ required: true, message: 'សូមបញ្ចូលលេខទូរសព្ទ', trigger: 'blur' }],
  password: [{ required: true, message: 'សូមបញ្ជូលពាក្យសម្ងាត់', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value.validate()
  loading.value = true
  try {
    const res = await login(form)
    auth.setAuth(res.data.data)
    router.push('/dashboard')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}

async function handleQrLogin(token) {
  if (!token) return ElMessage.warning('QR token មិនត្រឹមត្រូវ')
  loading.value = true
  try {
    const res = await loginByQr({ qr_token: token })
    auth.setAuth(res.data.data)
    router.push('/dashboard')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'QR login failed')
  } finally {
    loading.value = false
  }
}
onUnmounted(() => stopScanner())
watch(activeTab, (tab) => {
  if (tab !== 'qr') stopScanner()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border: 2px solid #102555;
  border-radius: 6px;
  padding: 48px 40px;
  width: 420px;
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 12px 0 4px;
}

.login-logo p {
  color: #888;
  font-size: 13px;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.qr-scanner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0 16px;
  min-height: 200px;
}

.qr-start, .qr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.qr-viewport {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

#qr-reader {
  width: 100% !important;
  max-width: 280px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #409eff;
}

/* Hide html5-qrcode's default UI clutter */
#qr-reader__scan_region img,
#qr-reader__dashboard { display: none !important; }

.qr-hint {
  color: #888;
  font-size: 13px;
  margin: 10px 0 0;
  text-align: center;
}

@media (max-width: 768px) {
  .login-page {
    padding: 25px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 24px 20px;
  }

  .login-logo h1 {
    font-size: 22px;
  }

  .login-logo p {
    font-size: 12px;
  }
}
</style>
