<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <div class="stat-card" :style="{ borderTop: `4px solid ${stat.color}` }">
          <div class="stat-icon" :style="{ background: stat.color + '1a', color: stat.color }">
            <el-icon size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <el-card class="dash-card">
          <template #header><span class="card-title">សកម្មភាពរហ័ស</span></template>
          <div class="action-grid">
            <div class="action-btn" @click="$router.push('/users')">
              <el-icon size="28" color="#409eff"><UserFilled /></el-icon>
              <span>បន្ថែមបុគ្គលិក</span>
            </div>
            <div class="action-btn" @click="$router.push('/attendance')">
              <el-icon size="28" color="#67c23a"><Clock /></el-icon>
              <span>មេីលវត្តមាន</span>
            </div>
            <div class="action-btn" @click="$router.push('/payroll')">
              <el-icon size="28" color="#e6a23c"><Money /></el-icon>
              <span>បេីកប្រាក់ខែ</span>
            </div>
            <div class="action-btn" @click="$router.push('/company')">
              <el-icon size="28" color="#f56c6c"><OfficeBuilding /></el-icon>
              <span>គ្រប់គ្រងក្រុមហ៑ុន</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="dash-card">
          <template #header><span class="card-title">វត្តមានក្នុងថ្ងៃនេះ</span></template>
          <div v-if="recentAttendance.length">
            <div v-for="item in recentAttendance" :key="item.id" class="attend-row">
              <el-avatar :size="32" style="background:#409eff; flex-shrink:0">
                {{ item.name?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="attend-info">
                <div class="attend-name">{{ item.name }}</div>
                <div class="attend-meta">{{ item.company_name }}</div>
              </div>
              <el-tag :type="item.status === 'COMPLETE' ? 'success' : 'warning'" size="large">
                {{ item.status === 'COMPLETE' ? 'បានចេញពីធ្វេីការ' : 'កំពុងធ្វេីការ' }}
              </el-tag>
            </div>
          </div>
          <el-empty v-else description="No attendance today" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAttendance, getUsers, getCompany } from '../api/services'

const stats = ref([
  { label: 'បុគ្គលិកសរុប', value: '—', icon: 'User', color: '#409eff' },
  { label: 'ក្រុមហ៑ុនសរុប', value: '—', icon: 'OfficeBuilding', color: '#67c23a' }
])
const recentAttendance = ref([])

onMounted(async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [usersRes, companiesRes, attendRes] = await Promise.allSettled([
      getUsers({ page: 1, page_size: 1 }),
      getCompany({ page: 1, page_size: 1 }),
      getAttendance({ page: 1, page_size: 5, check_date: today }),
    ])
    if (usersRes.status === 'fulfilled')
      stats.value[0].value = usersRes.value.data.metadata?.total_count ?? '—'
    if (companiesRes.status === 'fulfilled')
      stats.value[1].value = companiesRes.value.data.metadata?.total_count ?? '—'
    if (attendRes.status === 'fulfilled') {
      recentAttendance.value = attendRes.value.data.data || []
      stats.value[2].value = recentAttendance.value.length
    }
  } catch {}
})
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.stat-value { font-size: 26px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 13px; color: #888; margin-top: 2px; }

.dash-card { border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-title { font-weight: 600; font-size: 15px; }

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #555;
}
.action-btn:hover { background: #f5f7fa; border-color: #409eff; color: #409eff; transform: translateY(-2px); }

.attend-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.attend-row:last-child { border-bottom: none; }
.attend-info { flex: 1; }
.attend-name { font-weight: 500; font-size: 14px; }
.attend-meta { font-size: 12px; color: #13097b; }
</style>
