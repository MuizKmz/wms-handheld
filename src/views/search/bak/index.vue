<template>
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="true" pageTitle="Search Product"/>
  <div class="image-wrapper">
    <div class="image-container">
      <image alt="Search" src="/static/search.png"/>
    </div>
  </div>

  <div class="search-container">
    <!-- Search Input -->
    <div class="search-input-container">
      <div class="search-label">Search :</div>
      <input v-model="searchQuery" :disabled="isSearching" class="search-input"
             placeholder="EPC Code / Product Name / SKU Code"
             type="text"/>
      <button :class="{ 'stop-button': isSearching }" class="search-button" @click="toggleSearch">
        {{ isSearching ? '⏹ STOP' : '🔍 SEARCH' }}
      </button>
    </div>

    <!-- Results Table -->
    <div v-if="showResults" class="results-table">
      <table>
        <thead>
        <tr>
          <th>EPC CODE</th>
          <th>PRODUCT NAME</th>
          <th>SKU CODE</th>
          <th>WAREHOUSE</th>
          <th>RACK</th>
          <th>SECTION</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in scannedEPCs" :key="index">
          <td>{{ item.epcCode || '--' }}</td>
          <td>{{ item.productName || '--' }}</td>
          <td>{{ item.skuCode || '--' }}</td>
          <td>{{ item.warehouseCode || '--' }}</td>
          <td>{{ item.rackCode || '--' }}</td>
          <td>{{ item.sectionCode || '--' }}</td>
        </tr>
        <tr v-if="scannedEPCs.length === 0">
          <td class="no-data" colspan="6">No matching products found</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <span>Frequency: {{ deviceInfo.frequency || '--' }}Hz</span>
      <span>Tag: {{ scannedEPCs.length }}</span>
    </div>
  </div>

  <!-- Sticky Footer -->
  <div class="floating-footer">
    <FooterComponent/>
  </div>
</template>

<script>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {useInventoryStore} from '@/store/inventory'
import HeaderComponent from '@/views/components/Header.vue'
import FooterComponent from '@/views/components/Footer.vue'
import apis from '@/api'

export default {
  components: {
    HeaderComponent,
    FooterComponent
  },
  setup() {
    const inventoryStore = useInventoryStore()
    const searchQuery = ref('')
    const isSearching = ref(false)
    const showResults = ref(false)
    const scannedEPCs = ref([])
    const deviceInfo = ref({frequency: null, tagCount: null})
    const currentUnwatch = ref(null)

    // Initialize device
    const initDevice = async () => {
      try {
        await inventoryStore.initDeviceAction()
        const info = await inventoryStore.getDeviceInfoAction()
        deviceInfo.value = {
          frequency: info?.frequency || 50,
          tagCount: info?.tagCount || 0
        }
      } catch (error) {
        console.error('Device initialization error:', error)
        deviceInfo.value = {frequency: 50, tagCount: 0}
      }
    }

    // Toggle search/stop
    const toggleSearch = async () => {
      if (isSearching.value) {

        // Stop searching
        await inventoryStore.stopInventoryAction()
        if (currentUnwatch.value) {
          currentUnwatch.value()
          currentUnwatch.value = null
        }
        showResults.value = true
      } else {
        if (!searchQuery.value) {
          uni.showToast({
            title: 'Please enter a search query',
            icon: 'none'
          })
          return
        }
        let res = await apis.getSearchList({
          page: 1,
          limit: 9999,
          keyword: searchQuery.value,
        })
        if (res.success) {
          scannedEPCs.value = res.data.records
          showResults.value = true
          isSearching.value = false
        }

        // await inventoryStore.startInventoryAction()

        // // Watch for new EPCs
        // currentUnwatch.value = inventoryStore.$subscribe((mutation, state) => {
        //   scannedEPCs.value = [...new Set(state.deviceInventoryList)]
        // })
      }
      // isSearching.value = !isSearching.value
    }

    // Filter results based on search query
    const filteredResults = computed(() => {
      if (!searchQuery.value) return scannedEPCs.value
      const query = searchQuery.value.toUpperCase()
      return scannedEPCs.value.filter(item =>
          item.epc?.includes(query) ||
          item.productName?.toUpperCase().includes(query) ||
          item.sku?.toUpperCase().includes(query)
      )
    })

    // Go back
    const goBack = () => {
      window.history.back()
    }

    // Initialize on mount
    onMounted(initDevice)

    // Clean up on unmount
    onBeforeUnmount(() => {
      if (isSearching.value) {
        inventoryStore.stopInventoryAction()
      }
      if (currentUnwatch.value) {
        currentUnwatch.value()
      }
    })

    return {
      searchQuery,
      isSearching,
      showResults,
      scannedEPCs,
      deviceInfo,
      filteredResults,
      toggleSearch,
      goBack
    }
  }
}
</script>

<style lang="scss" scoped>
.image-wrapper {
  width: 100vw;
  /* Full width */
  height: 20vh;
  /* Height relative to viewport */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5e1c1;
  border-radius: 0px 0px 20px 20px;
  /* Background color */
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(181, 180, 180);
  /* White background */
  border-radius: 12px;
  /* Rounded corners */
  padding: 10px;
  /* Padding for spacing */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* Optional shadow */
  max-width: 120px;
  /* Limit container width */
  max-height: 120px;
  /* Limit container height */
}

.image-container image {
  width: 80px;
  /* Fixed width for the image */
  height: 80px;
  /* Fixed height for the image */
  max-width: 100%;
  /* Ensure it doesn't overflow */
  max-height: 100%;
  /* Keep it within the container */
  object-fit: contain;
  /* Prevents stretching */
}

.search-container {
  font-family: Arial, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 15px;
  min-height: 100vh;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #e6d0bd;
  padding: 10px 15px;
  border-radius: 5px;
}

.back-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.search-header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.header-icons {
  display: flex;
  gap: 15px;
}

.icon {
  cursor: pointer;
}

.search-input-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-label {
  font-weight: bold;
  color: #333;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  max-width: 275px !important;
  margin-bottom: 10px;
}

.search-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0px 20px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  width: 70%;
}

.search-button.stop-button {
  background-color: #f44336;
}

.results-table {
  width: 100%;
  overflow-x: auto;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
  color: #333;
}

.no-data {
  text-align: center;
  color: #777;
  padding: 20px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  background-color: white;
  padding: 10px 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #555;
}

@media (max-width: 600px) {
  .search-input-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  th,
  td {
    padding: 8px 10px;
    font-size: 14px;
  }
}

.floating-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 0;
  text-align: center;
  z-index: 1000;
}
</style>