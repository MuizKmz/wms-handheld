<template>
  <view class="page">
    <HeaderComponent pageTitle="Select Products" :showBack="true"/>
    
    <view class="product-list">
      <view 
        v-for="product in orderProducts" 
        :key="product.id" 
        class="product-item"
        :class="{ selected: isSelected(product.id) }"
        @click="toggleProduct(product)"
      >
        <view class="product-info">
          <view class="product-checkbox">
            <up-checkbox 
              :checked="isSelected(product.id)"
              @change="toggleProduct(product)"
            ></up-checkbox>
          </view>
          <view class="product-details">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-sku">SKU: {{ product.skuCode }}</text>
            <text class="product-ordered">Ordered: {{ product.orderedQuantity }}</text>
          </view>
        </view>
        
        <view v-if="isSelected(product.id)" class="quantity-input">
          <text class="label">Receiving Quantity:</text>
          <up-number-box 
            v-model="selectedProducts[product.id].receivingQuantity"
            :min="1"
            :max="product.orderedQuantity"
          ></up-number-box>
        </view>
      </view>
    </view>
    
    <view class="footer-actions">
      <up-button 
        type="primary" 
        text="Confirm Selection" 
        @click="confirmSelection"
        :disabled="Object.keys(selectedProducts).length === 0"
        size="large"
      ></up-button>
    </view>
  </view>
</template>

<script>
import { useReceivingStore } from '@/store/receiving'
import { mapWritableState } from 'pinia'
import HeaderComponent from '@/views/components/Header.vue'
import orderApi from '@/api/order'

export default {
  components: {
    HeaderComponent
  },
  data() {
    return {
      orderId: '',
      orderProducts: [],
      selectedProducts: {} // { productId: { ...product, receivingQuantity: number } }
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingProducts: 'receivingProducts'
    })
  },
  onLoad(options) {
    this.orderId = options.orderId
    this.loadOrderProducts()
  },
  methods: {
    async loadOrderProducts() {
      try {
        uni.showLoading({ title: 'Loading products...' })
        const res = await orderApi.getOrderProducts(this.orderId)
        uni.hideLoading()
        
        if (res && res.data) {
          // Backend returns: { product: {...}, quantity: X, allocatedEpcs: [...] }
          // Transform to flat structure for easier access
          this.orderProducts = res.data.map(item => ({
            id: item.product.id,
            productId: item.product.id,
            name: item.product.name,
            productCode: item.product.productCode,
            skuCode: item.product.skuCode,
            orderedQuantity: item.quantity,
            status: item.status,
            remarks: item.remarks,
            allocatedEpcs: item.allocatedEpcs || []
          }))
          
          // Pre-select previously added products and preserve expectedQuantity
          this.receivingProducts.forEach(product => {
            this.selectedProducts[product.id] = {
              ...product,
              receivingQuantity: product.receivingQuantity || product.orderedQuantity,
              expectedQuantity: product.expectedQuantity || product.orderedQuantity
            }
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to load products:', error)
        this.$msg('Failed to load products')
      }
    },
    
    isSelected(productId) {
      return !!this.selectedProducts[productId]
    },
    
    toggleProduct(product) {
      if (this.isSelected(product.id)) {
        delete this.selectedProducts[product.id]
      } else {
        this.selectedProducts[product.id] = {
          ...product,
          receivingQuantity: product.orderedQuantity, // Default to ordered quantity
          expectedQuantity: product.orderedQuantity // set expectedQuantity from ordered
        }
      }
      this.$forceUpdate()
    },
    
    confirmSelection() {
      const products = Object.values(this.selectedProducts)
      
      if (products.length === 0) {
        this.$msg('Please select at least one product')
        return
      }
      
      // Ensure expectedQuantity exists on each product and update receiving products in store
      const normalized = products.map(p => ({
        ...p,
        expectedQuantity: p.expectedQuantity || p.orderedQuantity || null,
        receivingQuantity: p.receivingQuantity || p.orderedQuantity || 0
      }))

      this.receivingProducts = normalized
      
      this.$msg(`${products.length} product(s) added`)
      
      // Go back to receiving form
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  margin-top: 60px;
  padding-top: 24px;
}

.product-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  margin-bottom: 80px;
}

.product-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  transition: all 0.3s;
  
  &.selected {
    border-color: #3C9CFF;
    background-color: #f0f7ff;
  }
  
  .product-info {
    display: flex;
    align-items: flex-start;
    
    .product-checkbox {
      margin-right: 12px;
    }
    
    .product-details {
      flex: 1;
      
      .product-name {
        display: block;
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
      }
      
      .product-sku,
      .product-ordered {
        display: block;
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
      }
    }
  }
  
  .quantity-input {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 12px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
}
</style>
