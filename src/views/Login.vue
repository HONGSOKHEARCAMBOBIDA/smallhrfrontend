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
          <el-form @submit.prevent="handleQrLogin" label-position="top">
            <el-form-item label="QR Token">
              <el-input v-model="qrToken" placeholder="Enter QR token" size="large" />
            </el-form-item>
            <el-button type="primary" native-type="submit" size="large" :loading="loading" class="login-btn">
              ចូលប្រព័ន្ធ
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { login, loginByQr } from '../api/services'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref()
const loading = ref(false)
const activeTab = ref('phone')
const qrToken = ref('')

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

async function handleQrLogin() {
  if (!qrToken.value) return ElMessage.warning('Please enter QR token')
  loading.value = true
  try {
    const res = await loginByQr({ qr_token: qrToken.value })
    auth.setAuth(res.data.data)
    router.push('/dashboard')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'QR login failed')
  } finally {
    loading.value = false
  }
}
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

@media (max-width: 768px) {
  .login-page {
    padding: 45px;
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
