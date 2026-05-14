<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800">Request Logs</h2>
      <button @click="fetchLogs" class="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
        Refresh
      </button>
    </div>

    <div v-if="loading" class="text-center py-4 text-gray-500 text-sm">Loading...</div>
    <div v-else-if="logs.length === 0" class="text-center py-4 text-gray-400 italic text-sm">No logs yet.</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Method</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Endpoint</th>
            <th class="text-center px-3 py-2 font-medium text-gray-600">Status</th>
            <th class="text-right px-3 py-2 font-medium text-gray-600">Time</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Message</th>
            <th class="text-right px-3 py-2 font-medium text-gray-600">Timestamp</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="log in logs" :key="log.id" :class="rowClass(log)">
            <td class="px-3 py-2 font-mono">{{ log.method }}</td>
            <td class="px-3 py-2 font-mono">{{ log.endpoint }}</td>
            <td class="px-3 py-2 text-center">
              <span :class="statusBadge(log.statusCode)">
                {{ log.statusCode }}
              </span>
            </td>
            <td class="px-3 py-2 text-right font-mono">{{ log.responseTime ? log.responseTime + 'ms' : '-' }}</td>
            <td class="px-3 py-2 max-w-xs truncate">{{ log.message }}</td>
            <td class="px-3 py-2 text-right text-gray-400">{{ formatTime(log.timestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { logAPI } from '../services/api'

interface LogEntry {
  id: number
  method: string
  endpoint: string
  statusCode: number
  responseTime: number
  level: string
  message: string
  timestamp: string
}

const logs = ref<LogEntry[]>([])
const loading = ref(false)

async function fetchLogs() {
  loading.value = true
  try {
    const res = await logAPI.getAll()
    logs.value = res.data
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function rowClass(log: LogEntry) {
  if (log.level === 'warn') return 'bg-yellow-50'
  if (log.level === 'error' || (log.statusCode >= 400)) return 'bg-red-50'
  return ''
}

function statusBadge(code: number) {
  const base = 'px-1.5 py-0.5 rounded font-medium'
  if (code >= 200 && code < 300) return `${base} bg-green-100 text-green-700`
  if (code >= 400 && code < 500) return `${base} bg-yellow-100 text-yellow-700`
  if (code >= 500) return `${base} bg-red-100 text-red-700`
  return `${base} bg-gray-100 text-gray-700`
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

onMounted(fetchLogs)
</script>
