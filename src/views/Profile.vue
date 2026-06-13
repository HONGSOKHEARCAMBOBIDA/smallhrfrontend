<template>
  <div class="profile-wrap">
    <el-row :gutter="20">
      <!-- Profile Card -->
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="profile-avatar-section">
            <el-avatar :size="90" style="background: linear-gradient(135deg, #667eea, #764ba2); font-size:32px">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <h2>{{ auth.user?.name }}</h2>
            <p class="profile-id">User ID: {{ auth.user?.id }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- Change Password -->
      <el-col :span="16">
        <el-card>
          <template #header><span class="card-title">ប្ដូរពាក្យសម្ងាត់</span></template>
          <el-form :model="pwForm" :rules="pwRules" ref="pwFormRef" label-width="160px" style="max-width:460px">
            <el-form-item label="ពាក្យសម្ងាត់ថ្មី" prop="new_password">
              <el-input v-model="pwForm.new_password" type="password" show-password />
            </el-form-item>
            <el-form-item label="បញ្ជាក់ពាក្យសម្ងាត់ថ្មី" prop="confirm_password">
              <el-input v-model="pwForm.confirm_password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="changingPw" @click="handleChangePassword">
                កែប្រែ
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { changePassword } from '../api/services'

const auth = useAuthStore()
const pwFormRef = ref()
const changingPw = ref(false)

const pwForm = reactive({ new_password: '', confirm_password: '' })
const pwRules = {
  new_password: [
    { required: true, message: 'Password is required' },
    { min: 6, message: 'Password must be at least 6 characters' }
  ],
  confirm_password: [
    { required: true, message: 'Please confirm password' },
    {
      validator: (_, value, callback) => {
        if (value !== pwForm.new_password) callback(new Error('Passwords do not match'))
        else callback()
      }
    }
  ]
}

async function handleChangePassword() {
  await pwFormRef.value.validate()
  changingPw.value = true
  try {
    await changePassword({ new_password: pwForm.new_password })
    ElMessage.success('Password changed successfully')
    pwForm.new_password = ''
    pwForm.confirm_password = ''
    pwFormRef.value.resetFields()
  } catch (e) {
    ElMessage.error(e.response?.data?.message || 'Failed to change password')
  } finally {
    changingPw.value = false
  }
}
</script>

<style scoped>
.profile-wrap {}
.profile-card { border-radius: 6px; }
.profile-avatar-section { text-align: center; padding: 20px 0; }
.profile-avatar-section h2 { margin-top: 16px; font-size: 20px; font-weight: 700; }
.profile-id { color: #888; font-size: 13px; margin-top: 4px; }
.card-title { font-weight: 600; font-size: 15px; }
</style>
