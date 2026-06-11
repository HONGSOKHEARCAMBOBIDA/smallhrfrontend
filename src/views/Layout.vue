<template>
  <el-container class="layout">
    <!-- Sidebar -->
    <el-aside :width="collapsed ? '64px' : '280px'" class="sidebar">
      <div class="sidebar-header">
        <el-icon size="28" color="#fff"><UserFilled /></el-icon>
        <span v-if="!collapsed" class="brand-name">ប្រព័ន្ធគ្រប់គ្រងធនធានមនុស្ស</span>
      </div>

      <el-menu
        :default-active="$route.path"
        router
        :collapse="collapsed"
        background-color="#1a1a2e"
        text-color="#a0a8c0"
        active-text-color="#fff"
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>សង្ខែបទិន្ន័យ</template>
        </el-menu-item>
        <el-menu-item index="/company">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>ក្រុមហ៑ុន</template>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>បុគ្គលិក</template>
        </el-menu-item>
        <el-menu-item index="/attendance">
          <el-icon><Clock /></el-icon>
          <template #title>វត្តមាន</template>
        </el-menu-item>
        <el-menu-item index="/payroll">
          <el-icon><Money /></el-icon>
          <template #title>ប្រាក់ខែ</template>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><Setting /></el-icon>
          <template #title>ប្រវត្តរូប</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- Top bar -->
      <el-header class="topbar">
        <div class="topbar-left">
          <el-button :icon="collapsed ? 'Expand' : 'Fold'" circle plain @click="collapsed = !collapsed" />
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="topbar-right">
          <el-dropdown @command="handleCommand">
            <div class="user-avatar">
              <el-avatar :size="34" style="background:#409eff; cursor:pointer">
                {{ userName?.charAt(0)?.toUpperCase() || 'U' }}
              </el-avatar>
              <span class="user-name">{{ userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" icon="Setting">ប្រវត្តរូប</el-dropdown-item>
                <el-dropdown-item command="logout" icon="SwitchButton" divided>ចាកចេញ</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Main content -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)

const userName = computed(() => auth.user?.name || 'User')
const pageTitle = computed(() => {
  const map = {
    '/dashboard': 'សង្ខែបទិន្ន័យ',
    '/company': 'ក្រុមហ៑ុន',
    '/users': 'បុគ្គលិក',
    '/attendance': 'វត្តមាន',
    '/payroll': 'ប្រាក់ខែ',
    '/profile': 'ប្រវត្តរូប',
  }
  return map[route.path] || 'HR System'
})

function handleCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/login')
  } else if (cmd === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped>
.layout { height: 100vh; overflow: hidden; }

.sidebar {
  background: #1a1a2e;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.brand-name {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar-menu {
  border: none;
  flex: 1;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 2px 8px;
  border-radius: 2px;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgba(64,158,255,0.2) !important;
  color: #fff !important;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255,255,255,0.06) !important;
}

.topbar {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.topbar-right { display: flex; align-items: center; }

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-avatar:hover { background: #f5f7fa; }

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.main-content {
  background: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}
</style>
