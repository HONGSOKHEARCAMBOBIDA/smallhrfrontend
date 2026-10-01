<template>
  <div v-if="rec" class="scan">
    <b :style="{ color: scanColor(rec.attendance_type) }">
      {{ rec.check_time.slice(0, 5) }}
    </b>
    <small>{{ rec.time_diff }}</small>
    <el-tooltip v-if="rec.reason" :content="rec.reason">
      <el-icon><ChatDotRound /></el-icon>
    </el-tooltip>
  </div>
  <span v-else class="miss">—</span>
</template>

<script setup>
import { ChatDotRound } from "@element-plus/icons-vue";

defineProps({ rec: { type: Object, default: null } });

function scanColor(type) {
  return { 1: "#67c23a", 3: "#e6a23c", 4: "#f56c6c", 6: "#409eff" }[type] || "#909399";
}
</script>

<style scoped>
.scan { display: flex; flex-direction: column; gap: 2px; }
.scan small { font-size: 11px; color: #888; }
.miss { color: #c0c4cc; }
</style>