<template>
  <!-- Header Component -->
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="true" pageTitle="Stock Take"/>

  <div class="image-wrapper">
    <div class="image-container">
      <image alt="Search" src="/static/stock-take.png"/>
    </div>
  </div>

  <up-col span="12">
    <up-button :disabled="!lastConfirmedData" class="details-btn" text="DETAILS" type="info"
               @click="viewDetails"></up-button>
  </up-col>
  <view class="page">
    <!-- Details Section -->
    <scroll-view class="scroll-container" scroll-y="true">


      <!-- Products Table -->
      <view class="products-section">
        <up-row align="center" class="table-header" justify="space-between">
          <up-col span="3">
            <text class="header-text">Product Code</text>
          </up-col>
          <up-col span="4">
            <text class="header-text">Product Name</text>
          </up-col>
          <up-col span="2">
            <text class="header-text">Count</text>
          </up-col>
        </up-row>

        <scroll-view class="table-content" scroll-y="true">
          <view v-for="(item, index) in visibleInventoryList" :key="index" class="table-row">
            <up-row align="center" justify="space-between">
              <up-col span="3">
                <text class="table-text">{{ item.productCode || '-' }}</text>
              </up-col>
              <up-col span="4">
                <text class="table-text">{{ item.productName || '-' }}</text>
              </up-col>
              <up-col span="2">
                <text class="table-text">{{ item.productName || '-' }}</text>
              </up-col>
            </up-row>
          </view>
        </scroll-view>
      </view>
    </scroll-view>

    <!-- Action Buttons -->
    <view class="action-section">
      <!-- First Row: Three Buttons -->
      <up-row class="action-buttons" gutter="10" justify="center">
        <up-col span="4">
          <up-button :text="inventoryText" shape="circle" size="mini" type="primary"
                     @click="inventoryTrigger"></up-button>
        </up-col>
        <up-col span="4">
          <up-button :text="searchText" shape="circle" size="mini" type="warning" @click="searchTrigger"></up-button>
        </up-col>
        <up-col span="4">
          <up-button shape="circle" size="mini" text="Clear" type="error" @click="clear"></up-button>
        </up-col>
      </up-row>

      <!-- Second Row: Full-Width Confirm Button -->
      <up-row justify="center">
        <up-col span="12">
          <up-button class="confirm-btn" text="CONFIRM STOCK IN" type="success" @click="confirmStockIn"></up-button>
        </up-col>
      </up-row>
    </view>
    <!-- Sticky Footer -->
    <div class="floating-footer">
      <FooterComponent/>
    </div>

  </view>
</template>

<script>
import {mapActions, mapState, mapWritableState} from 'pinia'
import {useInventoryStore} from '@/store/inventory'
import HeaderComponent from '@/views/components/Header.vue'
import FooterComponent from '@/views/components/Footer.vue'

const mockProducts = [
  {code: 'P-1001', name: 'Stainless Steel Bolt'},
  {code: 'P-1002', name: 'Aluminum Bracket'},
  {code: 'P-1003', name: 'Rubber Gasket'},
  {code: 'P-1004', name: 'Plastic Washer'},
  {code: 'P-1005', name: 'Copper Wire'},
  {code: 'P-1006', name: 'Steel Nut'},
  {code: 'P-1007', name: 'PVC Pipe'},
  {code: 'P-1008', name: 'Wooden Panel'},
  {code: 'P-1009', name: 'Glass Sheet'},
  {code: 'P-1010', name: 'Concrete Block'}
]
export default {
  components: {
    HeaderComponent,
    FooterComponent
  },
  data() {
    return {
      stockTypes: [
        {value: 'FG', label: 'Finished Goods'},
        {value: 'Raw Mat.', label: 'Raw Materials'}
      ],
      doNumber: '',
      stockType: '',
      warehouse: '',
      rack: '',
      section: '',
      confirmedItems: [],
      lastConfirmedData: null,
      visibleInventoryList: [] // This will show mock product data
    }
  },
  computed: {
    ...mapState(useInventoryStore, {
      deviceInfo: 'deviceInfo',
      inventoryInProgress: 'inventoryInProgress',
    }),
    ...mapWritableState(useInventoryStore, {deviceInventoryList: 'deviceInventoryList'}),
    inventoryText() {
      return this.inventoryInProgress ? 'Stop' : 'Start'
    },
    searchText() {
      return this.inventoryInProgress ? 'Stop' : 'Search'
    },
  },
  async onLoad() {
    await this.initDevice()
    this.loadConfirmedData()
  },
  onUnload() {
    this.stopInventory()
  },
  methods: {
    ...mapActions(useInventoryStore, {
      initDevice: 'initDeviceAction',
      startInventory: 'startInventoryAction',
      stopInventory: 'stopInventoryAction',
      getDeviceInfo: 'getDeviceInfoAction',
    }),
    inventoryTrigger() {
      if (this.inventoryInProgress) {
        this.stopInventory()
      } else {
        this.startInventory()
        this.setupMockDataWatcher()
      }
    },

    searchTrigger() {
      if (this.inventoryInProgress) {
        this.stopInventory()
      } else {
        this.startInventory('E281D061200098964835B647')
        this.setupMockDataWatcher()
      }
    },

    setupMockDataWatcher() {
      // Remove any existing watcher
      if (this.mockDataWatcher) {
        this.mockDataWatcher()
      }

      // Create new watcher
      this.mockDataWatcher = this.$watch(
          () => [...this.deviceInventoryList],
          (newList) => {
            if (newList.length > 0) {
              this.displayRandomProduct()
            }
          },
          {deep: true}
      )
    },

    displayRandomProduct() {
      if (this.deviceInventoryList.length === 0) {
        this.visibleInventoryList = []
        return
      }

      // Select a random EPC from the scanned list
      const randomEPCIndex = Math.floor(Math.random() * this.deviceInventoryList.length)
      const selectedEPC = this.deviceInventoryList[randomEPCIndex]

      // Select a random product from mock data
      const randomProductIndex = Math.floor(Math.random() * mockProducts.length)
      const mockProduct = mockProducts[randomProductIndex]

      // Display just this one product
      this.visibleInventoryList = [{
        ...selectedEPC, // Keep the EPC data
        productCode: mockProduct.code,
        productName: mockProduct.name,
        price: (Math.random() * 100).toFixed(2),
        quantity: Math.floor(Math.random() * 10) + 1
      }]
    },

    clear() {
      this.deviceInventoryList = []
      this.visibleInventoryList = []
      if (this.mockDataWatcher) {
        this.mockDataWatcher()
        this.mockDataWatcher = null
      }
    },
    confirmStockIn() {
      if (this.deviceInventoryList.length === 0) {
        uni.showToast({
          title: 'No items to confirm',
          icon: 'none'
        })
        return
      }

      const stockInData = {
        date: new Date().toISOString(),
        doNumber: this.doNumber,
        items: [...this.deviceInventoryList] // Still store original EPC data
      }

      // Save to local storage
      this.confirmedItems.unshift(stockInData)
      this.saveConfirmedData()
      this.lastConfirmedData = stockInData

      uni.showToast({
        title: 'Stock confirmed!',
        icon: 'success'
      })
    },
    viewDetails() {
      if (!this.lastConfirmedData) {
        uni.showToast({
          title: 'No confirmed data to show',
          icon: 'none'
        })
        return
      }

      // Navigate to details page with all data
      uni.navigateTo({
        url: `/views/detail-take?data=${encodeURIComponent(JSON.stringify(this.lastConfirmedData))}`
      })
    },
    saveConfirmedData() {
      try {
        uni.setStorageSync('confirmedStockInData', this.confirmedItems)
      } catch (e) {
        console.error('Failed to save data:', e)
      }
    },
    loadConfirmedData() {
      try {
        const data = uni.getStorageSync('confirmedStockInData')
        if (data) {
          this.confirmedItems = data
        }
      } catch (e) {
        console.error('Failed to load data:', e)
      }
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack() // Go to the previous page
      } else {
        uni.reLaunch({
          url: '/views/login'  // Redirect to the default page instead of closing the app
        })
      }
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


.page {
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.details-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .form-item {
    margin-bottom: 10px;

    .label {
      font-weight: 600;
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .input-field,
    .select-field {
      background-color: #f5f5f5;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 13px;
    }
  }

  .location-fields {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;

    .location-item {
      width: calc(50% - 5px);

      &:last-child {
        width: 100%;
      }
    }
  }
}

.details-btn {
  margin-top: 10px;
  width: 70%;
  font-size: 14px;
  padding: 8px 0;
  border-radius: 9999px;
  background-color: #f0f0f0;
  font-weight: 900;
  font-family: 'Segoe UI', Arial, sans-serif;
  /* Fully rounded */
}

.products-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 150px;

  .table-header .header-text {
    font-size: 12px;
    font-weight: bold;
  }

  .table-text {
    font-size: 11px;
    /* Smaller font for more columns */
  }

  .table-content {
    max-height: 200px;
    overflow-y: auto;

    .table-row {
      border-bottom: 1px solid #f0f0f0;
      padding: 6px 0;

      &:last-child {
        border-bottom: none;
      }
    }

    .table-text {
      font-size: 12px;
      padding: 4px 0;
      text-align: center;
    }

    .epc {
      word-break: break-all;
      text-align: left;
      padding-left: 5px;
    }
  }
}

.action-section {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: #f5e1c1;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6px;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.confirm-btn {
  width: 100%;
  font-size: 16px;
  border-radius: 100px;
  min-width: 150px;
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