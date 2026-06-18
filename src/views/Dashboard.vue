<template>
  <div class="dashboard">
    <!-- Stats row: 4-col on desktop, 2-col on mobile -->
    <!-- <div class="stat-grid">
      <div
        class="stat-card"
        v-for="stat in stats"
        :key="stat.label"
        :style="{ borderTop: `4px solid ${stat.color}` }"
      >
        <div class="stat-icon" :style="{ background: stat.color + '1a', color: stat.color }">
          <el-icon size="22"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-body">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div> -->

    <!-- Two-col on desktop, stacked on mobile -->
    <div class="dash-grid">
      <el-card class="dash-card">
        <template #header><span class="card-title">សកម្មភាពរហ័ស</span></template>
        <div class="action-grid">
          <div class="action-btn" @click="$router.push('/users')">
            <el-icon size="26" color="#409eff"><UserFilled /></el-icon>
            <span>បន្ថែមបុគ្គលិក</span>
          </div>
          <div class="action-btn" @click="$router.push('/attendance')">
            <el-icon size="26" color="#67c23a"><Clock /></el-icon>
            <span>មេីលវត្តមាន</span>
          </div>
          <div class="action-btn" @click="$router.push('/createattendance')">
            <el-icon size="26" color="#e6a23c"><Camera /></el-icon>
            <span>កត់ត្រាវត្តមាន</span>
          </div>
          <div class="action-btn" @click="$router.push('/company')">
            <el-icon size="26" color="#f56c6c"><OfficeBuilding /></el-icon>
            <span>គ្រប់គ្រងក្រុមហ៑ុន</span>
          </div>
        </div>
      </el-card>

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
            <el-tag :type="item.status === 'COMPLETE' ? 'success' : 'warning'" size="small">
              {{ item.status === 'COMPLETE' ? 'បានចេញ' : 'កំពុងធ្វេីការ' }}
            </el-tag>
          </div>
        </div>
        <el-empty v-else description="No attendance today" :image-size="60" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAttendance, countuser } from '../api/services'

const stats = ref([
  { label: 'បុគ្គលិកសរុប',  value: '—', icon: 'User',    color: '#409eff' },
  { label: 'វត្តមានថ្ងៃនេះ', value: '—', icon: 'Clock',   color: '#67c23a' },
  { label: 'ប្រាក់ខែ',       value: '—', icon: 'Money',   color: '#e6a23c' },
  { label: 'ក្រុមហ៑ុន',      value: '—', icon: 'OfficeBuilding', color: '#f56c6c' },
])
const recentAttendance = ref([])

onMounted(async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [usersRes, attendRes] = await Promise.allSettled([
     // countuser({}),
      getAttendance({ page: 1, page_size: 5, check_date: today }),
    ])
    if (usersRes.status === 'fulfilled')
      stats.value[0].value = usersRes.value.data.data.total || 0
    if (attendRes.status === 'fulfilled') {
      recentAttendance.value = attendRes.value.data.data || []
      stats.value[1].value = recentAttendance.value.length
    }
  } catch {}
})
</script>

<style scoped>
/* ── Stats grid: 4-col → 2-col ───────────────── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 12px; color: #888; margin-top: 2px; }

/* ── Dashboard two-col grid ──────────────────── */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.dash-card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-title { font-weight: 600; font-size: 14px; }

/* ── Quick actions ────────────────────────────── */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border-radius: 10px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #555;
  text-align: center;
}
.action-btn:hover {
  background: #f5f7fa;
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
}

/* ── Attendance list ──────────────────────────── */
.attend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid #f5f5f5;
}
.attend-row:last-child { border-bottom: none; }
.attend-info { flex: 1; min-width: 0; }
.attend-name {
  font-weight: 500;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.attend-meta { font-size: 11px; color: #13097b; }

/* ── Mobile overrides ────────────────────────── */
@media (max-width: 767px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card  { padding: 12px; gap: 10px; }
  .stat-icon  { width: 40px; height: 40px; }
  .stat-value { font-size: 20px; }
  .stat-label { font-size: 11px; }

  .dash-grid {
    grid-template-columns: 1fr;   /* stack vertically */
    gap: 12px;
  }
}

@media (max-width: 400px) {
  /* Very small screens: action buttons tighter */
  .action-btn { padding: 12px 6px; font-size: 11px; }
}
</style>