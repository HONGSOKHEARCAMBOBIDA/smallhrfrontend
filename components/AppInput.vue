<template>
  <el-form-item :label="label" :prop="prop">
    <el-input
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
       @keydown.enter="$emit('enter')"
      :type="type"
      :placeholder="placeholder"
      :prefix-icon="prefixIcon"
      :show-password="type === 'password'"
      size="large"
      :disabled="disabled"
      :clearable="clearable"
      :autofocus="autofocus"
      :readonly="readonly"
    />
  </el-form-item>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  prop: { type: String, default: '' },
  type: { type: String, default: 'text' },          
  placeholder: { type: String, default: '' },
  prefixIcon: { type: [String, Object], default: null },
  disabled: {type: Boolean,default: false},
  clearable: {type: Boolean,default: false},
  autofocus: {type: Boolean,default: false},
  readonly: {type: Boolean,default: false}
})
defineEmits([
    'update:modelValue',
    'enter'
    ])
</script>