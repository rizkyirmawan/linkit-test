<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">New Order</h3>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Coffee *</label>
          <select v-model="form.coffeeId" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm">
            <option value="" disabled>Select coffee</option>
            <option v-for="c in coffeeStore.items" :key="c.id" :value="c.id">{{ c.title }} ({{ c.type }})</option>
          </select>
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

        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{{ error }}</div>

        <div class="flex gap-2 pt-2">
          <button type="button" @click="$emit('close')"
            class="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="submitting"
            class="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors">
            {{ submitting ? 'Creating...' : 'Create Order' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useOrderStore } from '../stores/order'
import { useCoffeeStore } from '../stores/coffee'
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const orderStore = useOrderStore()
const coffeeStore = useCoffeeStore()

const submitting = ref(false)
const error = ref<string | null>(null)
const form = ref({
  coffeeId: '' as any,
  quantity: 1,
  totalPrice: 0,
})

watch(() => props.visible, (v) => {
  if (v) {
    form.value = { coffeeId: '', quantity: 1, totalPrice: 0 }
    error.value = null
    coffeeStore.fetchAll()
  }
})

async function handleSubmit() {
  submitting.value = true
  error.value = null
  try {
    await orderStore.create({
      coffeeId: form.value.coffeeId,
      quantity: form.value.quantity,
      totalPrice: form.value.totalPrice,
    })
    emit('created')
    emit('close')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to create order'
  } finally {
    submitting.value = false
  }
}
</script>
