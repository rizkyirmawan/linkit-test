<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800">Orders</h2>
      <button @click="$emit('add')"
        class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
        + New Order
      </button>
    </div>

    <div v-if="orderStore.loading" class="text-center py-8 text-gray-500">Loading...</div>
    <div v-else-if="orderStore.items.length === 0" class="text-center py-8 text-gray-400 italic">No orders yet.</div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">ID</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Coffee</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">User</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Qty</th>
            <th class="text-right px-4 py-3 font-medium text-gray-600">Price</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Status</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Date</th>
            <th class="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="order in orderStore.items" :key="order.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-500">#{{ order.id }}</td>
            <td class="px-4 py-3 font-medium">{{ order.coffee?.title || 'N/A' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ order.user?.username || 'N/A' }}</td>
            <td class="px-4 py-3 text-center">{{ order.quantity }}</td>
            <td class="px-4 py-3 text-right font-mono">${{ parseFloat(order.totalPrice).toFixed(2) }}</td>
            <td class="px-4 py-3 text-center">
              <select :value="order.status" @change="handleStatusChange(order.id, ($event.target as HTMLSelectElement).value)"
                class="text-xs px-2 py-1 rounded border"
                :class="statusClass(order.status)">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
            <td class="px-4 py-3 text-center text-gray-500 text-xs">{{ formatDate(order.orderedAt) }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="$emit('edit', order)" class="text-amber-600 hover:text-amber-800 mr-3">Edit</button>
              <button @click="handleDelete(order)" class="text-red-600 hover:text-red-800">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderStore, type Order } from '../stores/order'

const orderStore = useOrderStore()

defineEmits<{
  add: []
  edit: [order: Order]
}>()

function statusClass(status: string) {
  return {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    completed: 'bg-green-50 text-green-700 border-green-300',
    cancelled: 'bg-red-50 text-red-700 border-red-300',
  }[status] || ''
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function handleStatusChange(id: number, status: string) {
  await orderStore.update(id, { status })
}

async function handleDelete(order: Order) {
  if (confirm(`Delete order #${order.id}?`)) {
    await orderStore.remove(order.id)
  }
}
</script>
