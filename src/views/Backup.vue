<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Database Backup</h1>
      <button
        @click="handleTriggerBackup"
        :disabled="triggering"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <span v-if="triggering">⏳ Backing up...</span>
        <span v-else>🗄️ Backup Now</span>
      </button>
    </div>

    <!-- Success / Error alert -->
    <div v-if="alert.message" :class="[
      'mb-4 px-4 py-3 rounded-lg text-sm',
      alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    ]">
      {{ alert.message }}
    </div>

    <!-- Backup list -->
    <div class="bg-white rounded-xl border border-gray-200">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span class="font-medium text-gray-700">Backup Files</span>
        <button @click="loadBackups" class="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      <div v-if="loading" class="p-8 text-center text-gray-400">Loading...</div>

      <div v-else-if="backups.length === 0" class="p-8 text-center text-gray-400">
        No backups yet. Click "Backup Now" to create one.
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="px-4 py-3 font-medium">Filename</th>
            <th class="px-4 py-3 font-medium">Size</th>
            <th class="px-4 py-3 font-medium">Created At</th>
            <th class="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="backup in backups"
            :key="backup.filename"
            class="border-b border-gray-50 hover:bg-gray-50"
          >
            <td class="px-4 py-3 font-mono text-xs text-gray-700">{{ backup.filename }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatSize(backup.size_bytes) }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDate(backup.created_at) }}</td>
            <td class="px-4 py-3">
              <button
                @click="handleDownload(backup.filename)"
                class="text-blue-600 hover:underline text-xs"
              >
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { triggerBackup, listBackups, downloadBackup } from '../api/services'

const backups = ref([])
const loading = ref(false)
const triggering = ref(false)
const alert = ref({ type: '', message: '' })

const showAlert = (type, message) => {
  alert.value = { type, message }
  setTimeout(() => { alert.value = { type: '', message: '' } }, 4000)
}

const loadBackups = async () => {
  loading.value = true
  try {
    const res = await listBackups()
    backups.value = res.data.backups ?? []
  } catch (e) {
    showAlert('error', 'Failed to load backups')
  } finally {
    loading.value = false
  }
}

const handleTriggerBackup = async () => {
  triggering.value = true
  try {
    const res = await triggerBackup()
    showAlert('success', `Backup created: ${res.data.filename}`)
    await loadBackups()
  } catch (e) {
    showAlert('error', e.response?.data?.error ?? 'Backup failed')
  } finally {
    triggering.value = false
  }
}

const handleDownload = async (filename) => {
  try {
    const res = await downloadBackup(filename)
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    showAlert('error', 'Download failed')
  }
}

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

const formatDate = (iso) => {
  return new Date(iso).toLocaleString()
}

onMounted(loadBackups)
</script>