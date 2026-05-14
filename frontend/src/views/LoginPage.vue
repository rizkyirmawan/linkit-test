<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-amber-800">☕ Coffee Shop</h1>
        <p class="text-gray-500 mt-1">Sign in to manage your menu</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
            placeholder="Enter password"
          />
        </div>

        <div v-if="authStore.error" class="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold rounded-lg transition-colors"
        >
          {{ isRegister ? 'Register' : 'Sign In' }}
        </button>

        <div class="flex gap-2">
          <button
            type="button"
            @click="isRegister = false"
            :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', !isRegister ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
          >
            Sign In
          </button>
          <button
            type="button"
            @click="isRegister = true"
            :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors', isRegister ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isRegister = ref(false)

async function handleSubmit() {
  let success: boolean
  if (isRegister.value) {
    success = await authStore.register(username.value, password.value)
  } else {
    success = await authStore.login(username.value, password.value)
  }
  if (success) {
    router.push('/')
  }
}
</script>
