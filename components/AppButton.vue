<template>
  <el-button
    v-bind="$attrs"
    :type="type"
    :size="size"
    :loading="loading"
    :disabled="disabled || loading" 
    :native-type="nativeType"
    class="app-button"
    :class="{ 'app-button--block': block }"
    @click="$emit('click')"
  >
    <el-icon v-if="icon"><component :is="icon" /></el-icon>
    <slot />
  </el-button>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'primary' },       // primary, default, danger, text...
  size: { type: String, default: 'large' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  nativeType: { type: String, default: 'button' },   // 'submit' for form buttons
  block: { type: Boolean, default: false },           // full width by default
  icon: { type: [String, Object], default: null },
})
defineEmits(['click'])
</script>

<style scoped>
.app-button {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
}
.app-button--block {
  width: 100%;
}
</style>