<template>
  <view class="form-item">
    <text class="label">{{ labelText }}<text class="required">*</text></text>
    <view class="search-container">
      <up-input 
        v-model="searchKeyword" 
        :placeholder="placeholderText"
        border="none"
        class="input-field"
        @change="onSearchChange"
        @keyup.enter="searchOrder"
      >
        <template #suffix>
          <view class="input-actions">
            <view @click="scanQRCode" class="scan-icon-wrapper">
              <up-icon 
                name="scan" 
                size="20" 
                color="#19be6b"
                class="scan-icon"
              ></up-icon>
            </view>
            <up-button 
              :loading="isSearching"
              icon="search"
              shape="square"
              size="mini"
              text="Search"
              type="primary"
              @click="searchOrder"
            ></up-button>
          </view>
        </template>
      </up-input>
    </view>
    
    <!-- Search Results -->
    <view v-if="searchResults.length > 0" class="results-section">
      <text class="results-label">Select {{ orderTypeText }}:</text>
      <scroll-view class="results-list" scroll-y="true">
        <view 
          v-for="order in searchResults" 
          :key="order.id"
          :class="['result-item', { 'selected': isSelected(order) }]"
          @click="selectOrder(order)"
        >
          <view class="order-info">
            <view class="order-no">
              <up-icon name="file-text-fill" size="16"></up-icon>
              <text class="order-no-text">{{ order.orderNo }}</text>
            </view>
            <view class="order-details">
              <text class="detail-text">{{ getOrderDetails(order) }}</text>
            </view>
            <view class="order-date">
              <text class="date-text">{{ formatDate(order.createdAt) }}</text>
            </view>
          </view>
          <up-icon 
            v-if="isSelected(order)" 
            name="checkmark-circle-fill" 
            color="#19be6b"
            size="20"
          ></up-icon>
        </view>
      </scroll-view>
    </view>
    
    <!-- Selected Order Display -->
    <view v-if="selectedOrder" class="selected-order">
      <view class="selected-header">
        <text class="selected-label">Selected {{ orderTypeText }}:</text>
        <up-icon 
          name="close-circle" 
          size="18"
          @click="clearSelection"
        ></up-icon>
      </view>
      <view class="selected-content">
        <text class="selected-order-no">{{ selectedOrder.orderNo }}</text>
        <text class="selected-details">{{ getOrderDetails(selectedOrder) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { mapWritableState } from 'pinia'
import { useStockStore } from '@/store/stock'
import api from '@/api'

export default {
  data() {
    return {
      searchKeyword: '',
      searchResults: [],
      isSearching: false,
      searchTimeout: null
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockReturnForm: 'stockReturnForm',
      selectedOrder: 'selectedOrder'  // Use store's selectedOrder
    }),
    returnType() {
      return this.stockReturnForm.returnType
    },
    labelText() {
      return this.returnType === 'CUSTOMER_RETURN' ? 'Sales Order' : 'Purchase Order'
    },
    placeholderText() {
      return this.returnType === 'CUSTOMER_RETURN' 
        ? 'Enter Sales Order No.' 
        : 'Enter Purchase Order No.'
    },
    orderTypeText() {
      return this.returnType === 'CUSTOMER_RETURN' ? 'Order' : 'Receiving'
    }
  },
  watch: {
    returnType() {
      // Clear search when return type changes
      this.clearSearch()
      this.clearSelection()
    },
    searchKeyword(newVal) {
      // Auto-detect/scan when order number is entered
      if (newVal && newVal.length > 3) {
        // Clear previous timeout
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout)
        }
        // Auto search after 800ms of no typing (simulates scanning detection)
        this.searchTimeout = setTimeout(() => {
          this.searchOrder()
        }, 800)
      } else {
        // Clear results if search is too short
        this.searchResults = []
      }
    }
  },
  methods: {
    async searchOrder() {
      if (!this.returnType) {
        uni.showToast({
          title: 'Please select return type first',
          icon: 'none'
        })
        return
      }
      
      if (!this.searchKeyword.trim()) {
        uni.showToast({
          title: 'Please enter order number',
          icon: 'none'
        })
        return
      }
      
      this.isSearching = true
      
      try {
        // Fetch all orders like admin does
        const res = await api.getOrderList()
        
        if (res.success && res.data) {
          let filteredOrders = res.data
          
          // Filter by return type (matching admin logic)
          if (this.returnType === 'CUSTOMER_RETURN') {
            // Customer Return: SO orders that are SHIPPED or DELIVERED
            filteredOrders = filteredOrders.filter(order => 
              order.orderType === 'SO' &&
              (order.status === 'SHIPPED' || order.status === 'DELIVERED') &&
              order.orderNo.toLowerCase().includes(this.searchKeyword.toLowerCase())
            )
          } else if (this.returnType === 'SUPPLIER_RETURN') {
            // Supplier Return: PO orders that have receivings (PROCESSING, RECEIVED, or CLOSED)
            filteredOrders = filteredOrders.filter(order => 
              order.orderType === 'PO' &&
              (order.status === 'PROCESSING' || order.status === 'RECEIVED' || order.status === 'CLOSED') &&
              order.receivings && order.receivings.length > 0 &&
              order.orderNo.toLowerCase().includes(this.searchKeyword.toLowerCase())
            )
          }
          
          this.searchResults = filteredOrders
          
          if (this.searchResults.length === 0) {
            uni.showToast({
              title: 'No matching orders found',
              icon: 'none',
              duration: 2000
            })
          }
        } else {
          this.searchResults = []
          uni.showToast({
            title: 'No orders found',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('Search error:', error)
        uni.showToast({
          title: 'Search failed',
          icon: 'none'
        })
      } finally {
        this.isSearching = false
      }
    },
    
    async selectOrder(order) {
      try {
        // Clear previous scanned data when selecting new order
        const stockStore = useStockStore()
        stockStore.inquiredTagCodes = []
        stockStore.scannedTags = []
        stockStore.tagStore = {}
        
        // Fetch full order details with items (like admin does)
        const detailRes = await api.getOrderById(order.id)
        
        if (detailRes.success && detailRes.data) {
          const fullOrder = detailRes.data
          
          // Update form data
          this.stockReturnForm.referenceNumber = fullOrder.orderNo
          
          if (this.returnType === 'CUSTOMER_RETURN') {
            // Customer return: use order data
            this.stockReturnForm.orderId = fullOrder.id
            this.stockReturnForm.customerId = fullOrder.customerId
            this.stockReturnForm.receivingId = null
            this.stockReturnForm.supplierId = null
            
            // Products from order items
            this.selectedOrder = fullOrder
            
          } else if (this.returnType === 'SUPPLIER_RETURN') {
            // Supplier return: automatically fetch receiving and INBOUND EPCs
            if (!fullOrder.receivings || fullOrder.receivings.length === 0) {
              uni.showToast({
                title: 'No receiving found for this PO',
                icon: 'none'
              })
              return
            }
            
            const receiving = fullOrder.receivings[0]
            this.stockReturnForm.receivingId = receiving.id
            this.stockReturnForm.supplierId = fullOrder.supplierId
            this.stockReturnForm.orderId = fullOrder.id
            this.stockReturnForm.customerId = null
            
            console.log('🔍 Fetching INBOUND EPCs for receiving:', receiving.id)
            
            // Fetch INBOUND EPCs from the receiving
            try {
              const epcRes = await api.getEpcsByReceiving(receiving.id, 'INBOUND')
              
              if (epcRes.success && epcRes.data) {
                console.log('✅ INBOUND EPCs found:', epcRes.data)
                
                // Group EPCs by product and attach to order items
                fullOrder.orderItems.forEach(item => {
                  const productEpcs = epcRes.data.filter(epc => 
                    epc.productId === item.product.id
                  )
                  
                  item.allocatedEpcs = productEpcs.map(epc => ({
                    epcCode: epc.epcCode,
                    warehouseCode: epc.warehouse?.warehouseCode || '',
                    locationCode: epc.location?.locationCode || '',
                    status: epc.status
                  }))
                  
                  console.log(`📦 Product ${item.product.skuCode}: ${productEpcs.length} INBOUND EPCs`)
                })
              } else {
                console.warn('⚠️ No INBOUND EPCs found')
              }
            } catch (error) {
              console.error('Failed to fetch INBOUND EPCs:', error)
              uni.showToast({
                title: 'Failed to load EPCs',
                icon: 'none'
              })
            }
            
            this.selectedOrder = fullOrder
          }
          
          console.log('✅ Order selected:', fullOrder)
          console.log('📦 Order items:', fullOrder.orderItems)
          
          // Hide search results
          this.searchResults = []
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
        uni.showToast({
          title: 'Failed to load order details',
          icon: 'none'
        })
      }
    },
    
    isSelected(order) {
      return this.selectedOrder && this.selectedOrder.id === order.id
    },
    
    clearSearch() {
      this.searchKeyword = ''
      this.searchResults = []
    },
    
    clearSelection() {
      this.selectedOrder = null
      this.stockReturnForm.orderId = null
      this.stockReturnForm.receivingId = null
      this.stockReturnForm.customerId = null
      this.stockReturnForm.supplierId = null
    },
    
    getOrderDetails(order) {
      if (this.returnType === 'CUSTOMER_RETURN') {
        return `Customer: ${order.customer?.name || 'N/A'}`
      } else {
        return `Supplier: ${order.supplier?.name || 'N/A'} | DO: ${order.doNumber || 'N/A'}`
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString()
    },
    
    onSearchChange() {
      // Handled by watcher for auto-detection
    },
    
    scanQRCode() {
      // #ifdef APP-PLUS
      uni.scanCode({
        autoZoom: true,
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success: (res) => {
          console.log('QR Code scanned:', res.result)
          // Set the scanned result as search keyword
          this.searchKeyword = res.result
          // Auto-trigger search
          this.searchOrder()
        },
        fail: (err) => {
          console.error('Scan failed:', err)
          uni.showToast({
            title: 'Scan failed',
            icon: 'none'
          })
        }
      })
      // #endif
      
      // #ifdef H5
      uni.showToast({
        title: 'QR scanning only available on device',
        icon: 'none',
        duration: 2000
      })
      // #endif
    }
  },
  beforeUnmount() {
    // Clear timeout on component destroy
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  margin-bottom: 12px;

  .label {
    font-weight: 600;
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    
    .required {
      color: #f56c6c;
      margin-left: 2px;
    }
  }
  
  .search-container {
    width: 100%;
  }
  
  .input-field {
    background-color: #f8f9fa;
    border-radius: 8px;
    
    :deep(.u-input__content__field-wrapper) {
      padding-right: 4px;
    }
    
    .input-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .scan-icon-wrapper {
        display: flex;
        align-items: center;
        padding: 4px;
        cursor: pointer;
        transition: all 0.3s;
        border-radius: 4px;
        
        &:active {
          opacity: 0.6;
          transform: scale(0.95);
        }
      }
      
      .scan-icon {
        display: block;
      }
    }
    
    :deep(.up-button) {
      pointer-events: auto !important;
      z-index: 10;
    }
  }
  
  .results-section {
    margin-top: 12px;
    
    .results-label {
      font-size: 13px;
      color: #606266;
      display: block;
      margin-bottom: 8px;
    }
    
    .results-list {
      max-height: 300px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      
      .result-item {
        padding: 12px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fff;
        transition: background 0.3s;
        
        &:last-child {
          border-bottom: none;
        }
        
        &.selected {
          background: #ecf5ff;
        }
        
        &:active {
          background: #f5f7fa;
        }
        
        .order-info {
          flex: 1;
          
          .order-no {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
            
            .order-no-text {
              font-weight: 600;
              font-size: 14px;
              color: #303133;
            }
          }
          
          .order-details {
            margin-bottom: 4px;
            
            .detail-text {
              font-size: 12px;
              color: #606266;
            }
          }
          
          .order-date {
            .date-text {
              font-size: 11px;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  .selected-order {
    margin-top: 12px;
    padding: 12px;
    background: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    
    .selected-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      .selected-label {
        font-size: 13px;
        font-weight: 600;
        color: #409eff;
      }
    }
    
    .selected-content {
      .selected-order-no {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .selected-details {
        display: block;
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
</style>
