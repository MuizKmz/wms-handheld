<template>
  <view v-if="stockInForm.receivingCode" class="tags-section">
    <view class="tags-header">
      <view class="tags-title-wrapper">
        <up-icon name="tags" size="16" color="#667eea"></up-icon>
        <text class="tags-title-text">Scanned EPCs</text>
      </view>
      <view class="tags-actions">
        <view class="tags-count">
          <text class="count-badge">{{ scannedTags.length }}</text>
        </view>
        <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="trash-fill" shape="circle" size="mini"
                   text="" type="info"
                   @click="onClear"></up-button>
        <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="reload" shape="circle" size="mini"
                   text="" type="info"
                   @click="onReload"></up-button>
      </view>
    </view>
    
    <up-line color="#f0f2f5" margin="12px 0"></up-line>
    
    <view class="table-container">
      <view class="table-wrapper">
        <scroll-view 
          class="table-scroll" 
          scroll-x="true" 
          scroll-y="true"
          :scroll-with-animation="true"
        >
          <!-- Table Header -->
          <view class="table-header">
            <view class="table-cell header-cell index-col">#</view>
            <view class="table-cell header-cell epc-col">EPC Code</view>
            <view class="table-cell header-cell sku-col">SKU Code</view>
            <view class="table-cell header-cell product-col">Product</view>
          </view>
          
          <!-- Table Body -->
          <view v-for="(item, index) in tagList" :key="index" class="table-row" :class="getRowClass(item)">
            <view class="table-cell index-col">
              <text class="index-text">{{ index + 1 }}</text>
            </view>
            <view class="table-cell epc-col">
              <text class="epc-text">{{ item.epcCode || item.tagCode }}</text>
            </view>
            <view class="table-cell sku-col">
              <text class="sku-text">{{ item.skuCode || '--' }}</text>
            </view>
            <view class="table-cell product-col">
              <text class="product-text">{{ item.productName || '--' }}</text>
            </view>
          </view>
          
          <!-- No Data -->
          <view v-if="tagList.length <= 0" class="no-data-wrapper">
            <text class="no-data-text">No tags scanned</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <template v-if="scannedTags.length > 0">
      <up-line color="#f0f2f5" margin="12px 0"></up-line>
      <view class="tags-footer">
        <text class="footer-text">{{ scannedTags.length }} tags scanned, {{ tagList.length }} tags shown</text>
      </view>
    </template>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  props: {
    // stockInForm: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // },
    // tags: {
    //   type: Array,
    //   default: () => []
    // }
  },
  watch: {
    scannedTags: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.handleTagsUpdate()
        }
      }
    },
    tidProduct: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.handleTagsUpdate()
        }
      }
    }
  },
  data() {
    return {
      tagList: [],
      // ctrl: {
      //   showValid: false
      // }
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts',
      stockInTags: 'stockInTags',
      tidProduct: 'tidProduct'
    }),
  },
  async mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
    })
    await this.reloadInventory()
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useStockStore, {clear: 'clearAction', reloadInventory: 'reloadInventoryAction',}),
    onClear() {
      this.clear()
      this.$msg('Cleared all tags')
    },
    async onReload() {
      await this.reloadInventory()
      this.$msg('Reloaded')
    },
    handleTagsUpdate() {
      let tagList = []
      let stockInTags = []
      
      this.scannedTags.forEach(tag => {
        // Add all scanned tags to the list
        tagList.push(tag)
        
        // EPC mode - add tags with SKU code to stock-in list
        if (this.stockInForm.tagFlow === 1) {
          if (tag.skuCode) {
            stockInTags.push(tag)
          }
        } else {
          // TID mode - use tidProduct
          if (this.tidProduct) {
            tag.skuCode = this.tidProduct.skuCode
            tag.productCode = this.tidProduct.productCode
            tag.productName = this.tidProduct.name
            stockInTags.push(tag)
          }
        }
      })
      
      this.tagList = tagList
      this.stockInTags = stockInTags
    },
    getRowClass(item) {
      // Show scanned items with SKU in success color
      if (item.skuCode) {
        return 'text-success'
      }
      // Show items without SKU in warning color
      return 'text-warning'
    },
  }
}
</script>
<style lang="scss" scoped>
.tags-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .tags-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .tags-title-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .tags-title-text {
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
    }

    .tags-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .tags-count {
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
        max-height: 400px;
        width: 100%;

        .table-header,
        .table-row {
          display: flex;
          min-width: 700px;
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

          &.text-success {
            background-color: rgba(40, 167, 69, 0.05);
          }

          &.text-warning {
            background-color: rgba(255, 193, 7, 0.05);
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

          &.index-col {
            width: 50px;

            .index-text {
              font-weight: 500;
              color: #5f6368;
            }
          }

          &.epc-col {
            width: 240px;
            justify-content: flex-start;

            .epc-text {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              color: #333;
              word-break: break-all;
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

          &.product-col {
            width: 180px;
            justify-content: flex-start;

            .product-text {
              text-align: left;
              line-height: 1.4;
              font-size: 12px;
              width: 100%;
            }
          }
        }

        .no-data-wrapper {
          padding: 40px 20px;
          text-align: center;
          width: 100%;

          .no-data-text {
            color: #999;
            font-size: 14px;
          }
        }
      }
    }
  }

  .tags-footer {
    text-align: center;
    padding: 8px 0;

    .footer-text {
      font-size: 12px;
      color: #999;
    }
  }

  .text-success {
    background-color: rgba(40, 167, 69, 0.05);
  }

  .text-warning {
    background-color: rgba(255, 193, 7, 0.05);
  }
}
</style>
  