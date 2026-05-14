<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow p-4">
          <div class="text-2xl font-bold text-amber-800">{{ coffeeStore.items.length }}</div>
          <div class="text-sm text-gray-500">Total Coffees</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4">
          <div class="text-2xl font-bold text-green-700">{{ orderStore.items.length }}</div>
          <div class="text-sm text-gray-500">Total Orders</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4">
          <div class="text-2xl font-bold text-blue-700">{{ pendingOrders }}</div>
          <div class="text-sm text-gray-500">Pending Orders</div>
        </div>
        <div class="bg-white rounded-xl shadow p-4">
          <div class="text-2xl font-bold text-gray-700">{{ totalRevenue }}</div>
          <div class="text-sm text-gray-500">Total Revenue</div>
        </div>
      </div>

      <!-- Coffee Section -->
      <div class="bg-white rounded-xl shadow p-6">
        <CoffeeTable
          :syncing="syncing"
          @add="openAddCoffee"
          @edit="openEditCoffee"
          @sync="handleSync"
        />
      </div>

      <!-- Orders Section -->
      <div class="bg-white rounded-xl shadow p-6">
        <OrderTable
          @add="openAddOrder"
          @edit="openEditOrder"
        />
      </div>

      <!-- Logs Section -->
      <div class="bg-white rounded-xl shadow p-6">
        <LogViewer />
      </div>
    </div>

    <!-- Coffee Modal -->
    <CoffeeModal
      :visible="showCoffeeModal"
      :coffee="selectedCoffee"
      @close="closeCoffeeModal"
      @saved="refreshData"
    />

    <!-- Order Modal -->
    <OrderModal
      :visible="showOrderModal"
      @close="showOrderModal = false"
      @created="refreshData"
    />

    <!-- Order Edit Modal -->
    <OrderEditModal
      :visible="showOrderEditModal"
      :order="selectedOrder"
      @close="showOrderEditModal = false"
      @saved="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCoffeeStore, type Coffee } from '../stores/coffee'
import { useOrderStore, type Order } from '../stores/order'
import { syncAPI, healthAPI } from '../services/api'
import NavBar from '../components/NavBar.vue'
import CoffeeTable from '../components/CoffeeTable.vue'
import CoffeeModal from '../components/CoffeeModal.vue'
import OrderTable from '../components/OrderTable.vue'
import OrderModal from '../components/OrderModal.vue'
import OrderEditModal from '../components/OrderEditModal.vue'
import LogViewer from '../components/LogViewer.vue'

const router = useRouter()
const authStore = useAuthStore()
const coffeeStore = useCoffeeStore()
const orderStore = useOrderStore()

const showCoffeeModal = ref(false)
const showOrderModal = ref(false)
const showOrderEditModal = ref(false)
const selectedCoffee = ref<Coffee | null>(null)
const selectedOrder = ref<Order | null>(null)
const syncing = ref(false)

const pendingOrders = computed(() =>
  orderStore.items.filter((o) => o.status === 'pending').length
)

const totalRevenue = computed(() => {
  const completed = orderStore.items.filter((o) => o.status === 'completed')
  const total = completed.reduce((sum, o) => sum + parseFloat(o.totalPrice), 0)
  return `$${total.toFixed(2)}`
})

function openAddCoffee() {
  selectedCoffee.value = null
  showCoffeeModal.value = true
}

function openEditCoffee(coffee: Coffee) {
  selectedCoffee.value = coffee
  showCoffeeModal.value = true
}

function closeCoffeeModal() {
  showCoffeeModal.value = false
  selectedCoffee.value = null
}

function openAddOrder() {
  showOrderModal.value = true
}

function openEditOrder(order: Order) {
  selectedOrder.value = order
  showOrderEditModal.value = true
}

async function handleSync() {
  syncing.value = true
  try {
    await syncAPI.sync()
    await refreshData()
  } catch (err: any) {
    alert('Sync failed: ' + (err.response?.data?.message || err.message))
  } finally {
    syncing.value = false
  }
}

async function refreshData() {
  await Promise.all([
    coffeeStore.fetchAll(),
    orderStore.fetchAll(),
  ])
}

onMounted(async () => {
  if (!authStore.token) {
    router.push('/login')
    return
  }
  await refreshData()
})
</script>
