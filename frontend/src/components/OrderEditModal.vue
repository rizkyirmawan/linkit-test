<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Edit Order #{{ order?.id }}</h3>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Coffee</label>
          <input :value="order?.coffee?.title || 'N/A'" disabled
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">User</label>
          <input :value="order?.user?.username || 'N/A'" disabled
            class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
          <input v-model.number="form.quantity" type="number" min="1" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Total Price ($) *</label>
          <input v-model.number="form.totalPrice" type="number" step="0.01" min="0.01" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm">
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{{ error }}</div>

        <div class="flex gap-2 pt-2">
          <button type="button" @click="$emit('close')"
            class="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="submitting"
            class="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors">
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useOrderStore, type Order } from '../stores/order'

const props = defineProps<{
  visible: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const orderStore = useOrderStore()
const submitting = ref(false)
const error = ref<string | null>(null)

const form = ref({
  quantity: 1,
  totalPrice: 0,
  status: 'pending',
})

watch(() => props.visible, (v) => {
  if (v && props.order) {
    form.value = {
      quantity: props.order.quantity,
      totalPrice: parseFloat(props.order.totalPrice),
      status: props.order.status,
    }
    error.value = null
  }
})

async function handleSubmit() {
  if (!props.order) return
  submitting.value = true
  error.value = null
  try {
    await orderStore.update(props.order.id, form.value)
    emit('saved')
    emit('close')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update order'
  } finally {
    submitting.value = false
  }
}
</script>
