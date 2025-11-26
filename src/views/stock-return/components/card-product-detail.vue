<template>
  <view v-if="selectedProduct" class="products-section">
    <view class="product-header">
      <view class="product-title-wrapper">
        <up-icon name="list" size="16" color="#667eea"></up-icon>
        <text class="product-title-text">Selected Product</text>
      </view>
    </view>
    
    <up-line color="#f0f2f5" margin="12px 0"></up-line>
    
    <view class="product-card">
      <view class="product-info">
        <view class="info-row">
          <text class="info-label">Product Name:</text>
          <text class="info-value">{{ selectedProduct.product?.name || selectedProduct.name }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">SKU Code:</text>
          <text class="info-value">{{ selectedProduct.product?.skuCode || selectedProduct.skuCode }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">Available Qty:</text>
          <text class="info-value highlight">{{ selectedProduct.quantity || 0 }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">To Return:</text>
          <text class="info-value highlight-red">{{ scannedEPCsCount }}</text>
        </view>
      </view>
      
      <up-line color="#f0f2f5" margin="12px 0"></up-line>
      
      <!-- Return Condition Selector -->
      <view class="condition-section">
        <text class="section-label">Return Condition <text class="required">*</text></text>
        <view class="condition-buttons">
          <view 
            v-for="condition in returnConditions" 
            :key="condition.value"
            class="condition-btn"
            :class="{ 'active': selectedCondition === condition.value }"
            @click="selectCondition(condition.value)"
          >
            <text class="condition-text">{{ condition.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  props: {},
  data() {
    return {
      selectedCondition: '',
      returnConditions: [
        { label: 'Good', value: 'GOOD' },
        { label: 'Defective', value: 'DEFECTIVE' },
        { label: 'Damaged', value: 'DAMAGED' },
        { label: 'Wrong Item', value: 'WRONG_ITEM' }
      ]
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockReturnForm: 'stockReturnForm',
      selectedProduct: 'selectedProduct',
      scannedTags: 'scannedTags'
    }),
    scannedEPCsCount() {
      if (!this.scannedTags || this.scannedTags.length === 0) {
        return 0
      }
      
      const productSku = this.selectedProduct?.product?.skuCode || this.selectedProduct?.skuCode
      if (!productSku) return 0
      
      return this.scannedTags.filter(tag => tag.skuCode === productSku).length
    }
  },
  watch: {
    selectedCondition(newVal) {
      this.stockReturnForm.defaultCondition = newVal
    }
  },
  mounted() {
    // Set default condition to GOOD
    this.selectedCondition = 'GOOD'
  },
  methods: {
    selectCondition(value) {
      this.selectedCondition = value
      this.$msg(`Condition set to: ${value}`)
    }
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
  }

  .product-card {
    .product-info {
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 8px 0;

        .info-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .info-value {
          font-size: 14px;
          color: #333;
          font-weight: 600;
          
          &.highlight {
            color: #667eea;
          }
          
          &.highlight-red {
            color: #ff4757;
            font-size: 16px;
          }
        }
      }
    }

    .condition-section {
      margin-top: 12px;

      .section-label {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
        display: block;
        
        .required {
          color: #ff4757;
        }
      }

      .condition-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .condition-btn {
          flex: 1;
          min-width: calc(50% - 4px);
          padding: 10px;
          background-color: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;

          &.active {
            background-color: #667eea;
            border-color: #667eea;

            .condition-text {
              color: #ffffff;
              font-weight: 600;
            }
          }

          .condition-text {
            font-size: 13px;
            color: #333;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
