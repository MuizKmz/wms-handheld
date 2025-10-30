<template>
  <view v-if="receivingProducts.length > 0" class="products-section">
    <view class="product-header">
      <view class="product-title-wrapper">
        <up-icon name="list" size="16" color="#667eea"></up-icon>
        <text class="product-title-text">Products in Stock In</text>
      </view>
      <view class="product-actions">
        <view class="product-count">
          <text class="count-badge">{{ receivingProducts.length }}</text>
        </view>
        <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="reload" shape="circle" size="mini"
                   text="" type="info"
                   @click="onReload"></up-button>
      </view>
    </view>
    
    <up-line color="#f0f2f5" margin="12px 0"></up-line>
    
    <view class="table-container">
      <view class="table-wrapper">
        <!-- Unified Scroll View for Both Header and Body -->
        <scroll-view 
          class="table-scroll" 
          scroll-x="true" 
          scroll-y="true"
          :scroll-with-animation="true"
        >
          <!-- Table Header -->
          <view class="table-header">
            <view class="table-cell header-cell product-name-col">Product Name</view>
            <view class="table-cell header-cell sku-col">SKU Code</view>
            <view class="table-cell header-cell qty-col">Expected</view>
            <view class="table-cell header-cell qty-col">Received</view>
            <view class="table-cell header-cell qty-col">Scanned</view>
          </view>
          
          <!-- Table Body -->
          <view v-for="(item, index) in productList" :key="index" class="table-row">
            <view class="table-cell product-name-col">
              <text class="product-name-text">{{ getTableText(item.productName) }}</text>
            </view>
            <view class="table-cell sku-col">
              <text class="sku-text">{{ getTableText(item.skuCode) }}</text>
            </view>
            <view class="table-cell qty-col">
              <text class="qty-text">{{ getTableText(item.expectedQuantity) }}</text>
            </view>
            <view class="table-cell qty-col">
              <text class="qty-text" :class="getReceivedClass(item)">{{ getTableText(item.receivedQuantity) }}</text>
            </view>
            <view class="table-cell qty-col">
              <text class="qty-text">{{ calcScannedQuantity(item) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  props: {},
  watch: {
    scannedTags: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          let quantityMap = new Map()
          newVal.forEach(tag => {
            let skuCode = tag.skuCode
            if (skuCode) {
              if (quantityMap.has(skuCode)) {
                quantityMap.set(skuCode, quantityMap.get(skuCode) + 1)
              } else {
                quantityMap.set(skuCode, 1)
              }
            }
          })
          setTimeout(() => {
            this.receivingProducts.forEach(product => {
              let skuCode = product.skuCode
              if (quantityMap.has(skuCode)) {
                product.scannedQuantity = quantityMap.get(skuCode)
              } else {
                product.scannedQuantity = 1
              }
            })
          }, 2000)
        }
      }
    }
  },
  data() {
    return {
      ctrl: {}
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts'
    }),
    productList() {
      if (this.stockInForm.tagFlow === 1) {
        return [...this.receivingProducts]
      } else {
        return [...this.receivingProducts].filter(item => {
          return item.skuCode === this.stockInForm.skuCode
        })
      }
    },
    quantityMap() {
      let quantityMap = new Map()
      this.scannedTags.forEach(tag => {
        let skuCode = tag.skuCode
        if (skuCode) {
          if (quantityMap.has(skuCode)) {
            quantityMap.set(skuCode, quantityMap.get(skuCode) + 1)
          } else {
            quantityMap.set(skuCode, 1)
          }
        }
      })
      return quantityMap
    }
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useStockStore, {getReceivingList: 'getReceivingListAction'}),
    async onReload() {
      this.getReceivingList()
      this.$msg('Reloaded')
    },
    getReceivedClass(item) {
      if (item.receivedQuantity < item.expectedQuantity) {
        return 'text-danger'
      } else if (item.receivedQuantity > item.expectedQuantity) {
        return 'text-warning'
      } else {
        return 'text-success'
      }
    },
    getTableText(value) {
      if (value === null || value === undefined) {
        return '--'
      }
      return value
    },
    calcScannedQuantity(item) {
      return this.quantityMap.get(item.skuCode) || 0
    },
  }
}
</script>
<style lang="scss" scoped>
.products-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .product-title-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .product-title-text {
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
    }

    .product-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .product-count {
        .count-badge {
          background-color: #667eea;
          color: #fff;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
      }
    }
  }

  .table-container {
    width: 100%;
    overflow: hidden;

    .table-wrapper {
      width: 100%;
      border-radius: 8px;
      border: 1px solid #e8eaed;
      overflow: hidden;

      .table-scroll {
        max-height: 300px;
        width: 100%;

        .table-header,
        .table-row {
          display: flex;
          min-width: 600px;
          width: max-content;
        }

        .table-header {
          background-color: #f8f9fa;
          border-bottom: 2px solid #e8eaed;
          position: sticky;
          top: 0;
          z-index: 10;

          .header-cell {
            font-weight: 600;
            color: #5f6368;
            padding: 12px 8px;
            font-size: 12px;
            text-align: center;
          }
        }

        .table-row {
          border-bottom: 1px solid #f0f2f5;
          transition: background-color 0.2s;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f8f9fa;
          }
        }

        .table-cell {
          padding: 12px 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          color: #333;
          word-break: break-word;
          flex-shrink: 0;

          &.product-name-col {
            width: 180px;
            justify-content: flex-start;

            .product-name-text {
              text-align: left;
              line-height: 1.4;
              width: 100%;
            }
          }

          &.sku-col {
            width: 140px;

            .sku-text {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #5f6368;
            }
          }

          &.qty-col {
            width: 90px;

            .qty-text {
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .text-danger {
    color: #dc3545 !important;
  }

  .text-warning {
    color: #ffc107 !important;
  }

  .text-success {
    color: #28a745 !important;
  }
}
</style>
  