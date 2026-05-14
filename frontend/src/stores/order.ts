import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderAPI } from '../services/api'

export interface Order {
  id: number
  coffeeId: number
  userId: number
  quantity: number
  totalPrice: string
  status: 'pending' | 'completed' | 'cancelled'
  orderedAt: string
  updatedAt: string
  coffee?: { id: number; title: string }
  user?: { id: number; username: string }
}

export const useOrderStore = defineStore('order', () => {
  const items = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const res = await orderAPI.getAll()
      items.value = res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch orders'
    } finally {
      loading.value = false
    }
  }

  async function create(data: any) {
    const res = await orderAPI.create(data)
    await fetchAll()
    return res.data
  }

  async function update(id: number, data: any) {
    const res = await orderAPI.update(id, data)
    await fetchAll()
    return res.data
  }

  async function remove(id: number) {
    await orderAPI.delete(id)
    await fetchAll()
  }

  return { items, loading, error, fetchAll, create, update, remove }
})
