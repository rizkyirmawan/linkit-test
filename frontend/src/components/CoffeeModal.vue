<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ isEdit ? 'Edit Coffee' : 'Add Coffee' }}</h3>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input v-model="form.title" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea v-model="form.description" rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type *</label>
          <select v-model="form.type" required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm">
            <option value="hot">Hot</option>
            <option value="iced">Iced</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma separated)</label>
          <input v-model="ingredientsStr"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            placeholder="Espresso, Milk, Sugar" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input v-model="form.image"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm" />
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{{ error }}</div>

        <div class="flex gap-2 pt-2">
          <button type="button" @click="$emit('close')"
            class="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
          <button type="submit" :disabled="submitting"
            class="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCoffeeStore, type Coffee } from '../stores/coffee'

const props = defineProps<{
  visible: boolean
  coffee: Coffee | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const coffeeStore = useCoffeeStore()
const submitting = ref(false)
const error = ref<string | null>(null)
const ingredientsStr = ref('')

const form = ref({
  title: '',
  description: '',
  type: 'hot' as 'hot' | 'iced',
  image: '',
})

const isEdit = () => props.coffee !== null

watch(() => props.visible, (v) => {
  if (v) {
    if (props.coffee) {
      form.value = {
        title: props.coffee.title,
        description: props.coffee.description || '',
        type: props.coffee.type,
        image: props.coffee.image || '',
      }
      ingredientsStr.value = coffeeStore.getParsedIngredients(props.coffee).join(', ')
    } else {
      form.value = { title: '', description: '', type: 'hot', image: '' }
      ingredientsStr.value = ''
    }
    error.value = null
  }
})

async function handleSubmit() {
  submitting.value = true
  error.value = null
  try {
    const data = {
      ...form.value,
      ingredients: ingredientsStr.value ? ingredientsStr.value.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    }
    if (isEdit()) {
      await coffeeStore.update(props.coffee!.id, data)
    } else {
      await coffeeStore.create(data)
    }
    emit('saved')
    emit('close')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save'
  } finally {
    submitting.value = false
  }
}
</script>
