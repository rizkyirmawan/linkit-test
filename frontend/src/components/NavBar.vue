<template>
  <nav class="bg-amber-800 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-2">
          <span class="text-2xl">☕</span>
          <span class="font-bold text-xl">Coffee Shop Admin</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-amber-200">{{ authStore.user?.username }}</span>
          <button
            @click="handleLogout"
            class="px-3 py-1.5 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
