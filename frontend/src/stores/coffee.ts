import { defineStore } from 'pinia'
import { ref } from 'vue'
import { coffeeAPI } from '../services/api'

export interface Coffee {
  id: number
  externalId: number | null
  title: string
  description: string | null
  ingredients: string | null
  image: string | null
  type: 'hot' | 'iced'
  createdAt: string
  updatedAt: string
}

export const useCoffeeStore = defineStore('coffee', () => {
  const items = ref<Coffee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const res = await coffeeAPI.getAll()
      items.value = res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch coffees'
    } finally {
      loading.value = false
    }
  }

  async function create(data: any) {
    const res = await coffeeAPI.create(data)
    await fetchAll()
    return res.data
  }

  async function update(id: number, data: any) {
    const res = await coffeeAPI.update(id, data)
    await fetchAll()
    return res.data
  }

  async function remove(id: number) {
    await coffeeAPI.delete(id)
    await fetchAll()
  }

  function getParsedIngredients(coffee: Coffee): string[] {
    if (!coffee.ingredients) return []
    try {
      return JSON.parse(coffee.ingredients)
    } catch {
      return []
    }
  }

  return { items, loading, error, fetchAll, create, update, remove, getParsedIngredients }
})
