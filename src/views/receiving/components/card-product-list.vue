<template>
  <view v-if="receivingProducts.length > 0" class="products-section">
    <view class="product-header">
      <view class="product-title-wrapper">
        <up-icon name="list" size="16" color="#667eea"></up-icon>
        <text class="product-title-text">Products in Receiving</text>
      </view>
      <view class="product-count">
        <text class="count-badge">{{ receivingProducts.length }}</text>
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
            <view class="table-cell header-cell sku-col">SKU</view>
            <view class="table-cell header-cell qty-col">Quantity</view>
          </view>
          
          <!-- Table Body -->
          <view v-for="(item, index) in receivingProducts" :key="index" class="table-row">
            <view class="table-cell product-name-col">
              <text class="product-name-text">{{ getTableText(item.name) }}</text>
            </view>
            <view class="table-cell sku-col">
              <text class="sku-text">{{ getTableText(item.skuCode) }}</text>
            </view>
            <view class="table-cell qty-col">
              <up-number-box v-model="item.receivingQuantity" :min="1" :max="item.orderedQuantity || 9999">
                <template #minus>
                  <view class="qty-btn minus">
                    <up-icon name="minus" size="14" color="#666"></up-icon>
                  </view>
                </template>
                <template #input>
                  <text class="qty-input">{{ item.receivingQuantity }}</text>
                </template>
                <template #plus>
                  <view class="qty-btn plus">
                    <up-icon name="plus" size="14" color="#666"></up-icon>
                  </view>
                </template>
              </up-number-box>
            </view>
          </view>
        </scroll-view>
        
        <!-- Fixed Action Column -->
        <view class="action-column-fixed">
          <!-- Action Header -->
          <view class="action-header-cell">
            <text class="action-header-text">Action</text>
          </view>
          
          <!-- Action Cells -->
          <view v-for="(item, index) in receivingProducts" :key="index" class="action-cell">
            <view class="action-btn" @click="removeProduct(item, index)">
              <up-icon name="trash" size="18" color="#ff4d4f"></up-icon>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  props: {
  },
  watch: {},
  data() {
    return {
      ctrl: {}
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
      receivingProducts: 'receivingProducts'
    }),
    productList() {
      if (this.receivingForm.tagFlow === 1) {
        return [...this.receivingProducts]
      } else {
        return [...this.receivingProducts].filter(item => {
          return item.skuCode === this.receivingForm.skuCode
        })
      }
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
    ...mapActions(useReceivingStore, {getReceivingList: 'getReceivingListAction'}),
    getTableText(value) {
      if (value === null || value === undefined) {
        return '--'
      }
      return value
    },
    removeProduct(item, index) {
      this.receivingProducts.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.products-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  min-height: 120px;

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .product-title-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .product-title-text {
        font-size: 16px;
        font-weight: 700;
        color: #1a1a1a;
        letter-spacing: -0.3px;
      }
    }

    .product-count {
      .count-badge {
        background-color: #667eea;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 12px;
        min-width: 24px;
        text-align: center;
        display: inline-block;
      }
    }
  }

  .table-container {
    margin-top: 8px;
    overflow: hidden;
  }

  .table-wrapper {
    display: flex;
    border: 1px solid #e8eaed;
    border-radius: 8px;
    overflow: hidden;
  }

  .table-scroll {
    flex: 1;
    max-height: 400px;
    overflow: auto;
  }

  .table-header {
    display: flex;
    background-color: #f8f9fa;
    padding: 12px 0;
    border-bottom: 2px solid #e8eaed;
    position: sticky;
    top: 0;
    z-index: 10;
    min-width: 460px;

    .header-cell {
      font-size: 12px;
      font-weight: 700;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      padding: 0 12px;
    }
  }

  .table-row {
    display: flex;
    padding: 14px 0;
    border-bottom: 1px solid #f0f2f5;
    transition: background-color 0.2s ease;
    min-width: 460px;

    &:hover {
      background-color: #f8f9fa;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .table-cell {
    display: flex;
    align-items: center;
    padding: 0 12px;
    
    &.product-name-col {
      min-width: 180px;
      flex: 0 0 180px;
    }

    &.sku-col {
      min-width: 120px;
      flex: 0 0 120px;
      justify-content: center;
    }

    &.qty-col {
      min-width: 160px;
      flex: 0 0 160px;
      justify-content: center;
    }
  }

  .action-column-fixed {
    width: 70px;
    min-width: 70px;
    border-left: 2px solid #667eea;
    background-color: #fff;
    display: flex;
    flex-direction: column;
  }

  .action-header-cell {
    background-color: #f8f9fa;
    padding: 12px;
    border-bottom: 2px solid #e8eaed;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;

    .action-header-text {
      font-size: 12px;
      font-weight: 700;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .action-cell {
    background-color: #fff;
    border-bottom: 1px solid #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 62px;

    &:last-child {
      border-bottom: none;
    }
  }

  .product-name-text {
    font-size: 13px;
    color: #1a1a1a;
    font-weight: 600;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .sku-text {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    font-family: 'Courier New', monospace;
  }

  .qty-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background-color: #f0f2f5;
    border: 1px solid #e8eaed;
    transition: all 0.2s ease;

    &:active {
      background-color: #e0e2e5;
      transform: scale(0.95);
    }
  }

  .qty-input {
    width: 50px;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    padding: 0 8px;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background-color: #fff1f0;
    border: 1px solid #ffccc7;
    cursor: pointer;
    transition: all 0.2s ease;

    &:active {
      background-color: #ffe7e5;
      transform: scale(0.95);
    }
  }

  .text-danger {
    color: $uni-color-error;
  }

  .text-warning {
    color: $uni-color-warning;
  }

  .text-success {
    color: $uni-color-success;
  }
}
</style>
  