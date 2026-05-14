<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-800">Coffee Menu</h2>
      <div class="flex gap-2">
        <button @click="$emit('sync')" :disabled="syncing"
          class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm transition-colors">
          {{ syncing ? 'Syncing...' : 'Sync from API' }}
        </button>
        <button @click="$emit('add')"
          class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm transition-colors">
          + Add Coffee
        </button>
      </div>
    </div>

    <div v-if="coffeeStore.loading" class="text-center py-8 text-gray-500">Loading...</div>
    <div v-else-if="coffeeStore.error" class="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{{ coffeeStore.error }}</div>
    <div v-else-if="coffeeStore.items.length === 0" class="text-center py-8 text-gray-400 italic">
      No coffees yet. Click "Sync from API" to fetch data.
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Type</th>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Ingredients</th>
            <th class="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="coffee in coffeeStore.items" :key="coffee.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">{{ coffee.title }}</td>
            <td class="px-4 py-3">
              <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', coffee.type === 'hot' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700']">
                {{ coffee.type }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 max-w-xs truncate">
              {{ coffeeStore.getParsedIngredients(coffee).join(', ') }}
            </td>
            <td class="px-4 py-3 text-right">
              <button @click="$emit('edit', coffee)" class="text-amber-600 hover:text-amber-800 mr-3">Edit</button>
              <button @click="handleDelete(coffee)" class="text-red-600 hover:text-red-800">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCoffeeStore, type Coffee } from '../stores/coffee'

defineProps<{
  syncing: boolean
}>()

defineEmits<{
  add: []
  edit: [coffee: Coffee]
  sync: []
}>()

const coffeeStore = useCoffeeStore()

async function handleDelete(coffee: Coffee) {
  if (confirm(`Delete "${coffee.title}"?`)) {
    await coffeeStore.remove(coffee.id)
  }
}
</script>
