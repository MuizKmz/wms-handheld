<template>
  <view v-if="scannedTags.length > 0" class="tags-section">
    <view class="tags-header">
      <view class="tags-title-wrapper">
        <up-icon name="tags" size="16" color="#667eea"></up-icon>
        <text class="tags-title-text">Scanned EPCs ({{ scannedTags.length }})</text>
      </view>
      <view class="tags-actions">
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
            <view class="table-cell header-cell epc-col">EPC Code</view>
            <view class="table-cell header-cell product-col">Product</view>
            <view class="table-cell header-cell sku-col">SKU</view>
            <view class="table-cell header-cell status-col">Status</view>
            <view class="table-cell header-cell condition-col">Condition</view>
          </view>
          
          <!-- Table Body -->
          <view v-for="(tag, index) in scannedTags" :key="index" class="table-row" :class="{ 'disabled-row': !isTagValid(tag) }">
            <view class="table-cell epc-col">
              <text class="epc-text">{{ tag.epcCode || tag.tagCode }}</text>
            </view>
            <view class="table-cell product-col">
              <text class="product-text">{{ tag.productName || '--' }}</text>
            </view>
            <view class="table-cell sku-col">
              <text class="sku-text">{{ tag.skuCode || '--' }}</text>
            </view>
            <view class="table-cell status-col">
              <view class="status-badge" :class="tag.status ? `status-${tag.status.toLowerCase()}` : 'status-unknown'">
                <text class="status-text">{{ tag.status || '--' }}</text>
              </view>
            </view>
            <view class="table-cell condition-col">
              <view class="condition-buttons">
                <view 
                  v-for="cond in conditions" 
                  :key="cond.value"
                  class="condition-btn"
                  :class="{ 'active': tag.condition === cond.value }"
                  @click="selectCondition(tag, cond.value)"
                >
                  <text class="condition-text">{{ cond.label }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <up-line color="#f0f2f5" margin="12px 0"></up-line>
    
    <view class="summary-section">
      <view class="summary-item">
        <text class="summary-label">Total EPCs:</text>
        <text class="summary-value">{{ scannedTags.length }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">Valid EPCs:</text>
        <text class="summary-value valid">{{ validTagsCount }}</text>
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
        if (newVal && newVal.length > 0) {
          // Set default condition for new tags
          newVal.forEach(tag => {
            if (!tag.condition) {
              tag.condition = this.stockReturnForm.defaultCondition || 'GOOD'
            }
          })
        }
      }
    }
  },
  data() {
    return {
      conditions: [
        { label: 'Good', value: 'GOOD' },
        { label: 'Defect', value: 'DEFECTIVE' },
        { label: 'Damage', value: 'DAMAGED' },
        { label: 'Wrong', value: 'WRONG_ITEM' }
      ]
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      stockReturnForm: 'stockReturnForm',
      selectedProduct: 'selectedProduct',
      selectedOrder: 'selectedOrder'
    }),
    validTagsCount() {
      return this.scannedTags.filter(tag => this.isTagValid(tag)).length
    }
  },
  async mounted() {
    console.log('card-tag-list mounted')
  },
  methods: {
    ...mapActions(useStockStore, {
      clear: 'clearReturnAction', 
      reloadInventory: 'reloadInventoryAction',
    }),
    onClear() {
      this.clear()
      this.$msg('Cleared all tags')
    },
    async onReload() {
      await this.reloadInventory()
      this.$msg('Reloaded')
    },
    selectCondition(tag, condition) {
      tag.condition = condition
      this.$msg(`Condition set to: ${condition}`)
    },
    isTagValid(tag) {
      // Validate based on return type
      const isCustomerReturn = this.stockReturnForm.returnType === 'CUSTOMER_RETURN'
      const isSupplierReturn = this.stockReturnForm.returnType === 'SUPPLIER_RETURN'
      
      if (isCustomerReturn && tag.status !== 'OUTBOUND') {
        return false
      }
      if (isSupplierReturn && tag.status !== 'INBOUND') {
        return false
      }
      
      // Check if tag belongs to selected product
      if (this.selectedProduct) {
        const productSku = this.selectedProduct.product?.skuCode || this.selectedProduct.skuCode
        if (tag.skuCode !== productSku) {
          return false
        }
      }
      
      return true
    },
    
    handleTagsUpdate() {
      let tagList = []
      let stockReturnTags = []
      let isAllChecked = this.ctrl.checkAll
      this.searchReturnTags.forEach(searchTag => {
        let targetTag = {...this.scannedTags.find(tag => tag.tagCode === searchTag.tagCode)}
        if (targetTag.tagCode) {
          targetTag.disabled = this.getDisableState(targetTag)

          if (targetTag.disabled) {
            targetTag.checked = false
          } else {
            if (targetTag.checked === undefined) {
              targetTag.checked = true
            }
          }
          
          // Initialize condition to GOOD if not set
          if (!targetTag.condition) {
            targetTag.condition = 'GOOD'
          }
        } else {
          targetTag = {...searchTag}
          targetTag.disabled = true
          targetTag.checked = false
          targetTag.condition = 'GOOD'
        }

        if (this.ctrl.showValid) {
          // status: 1:inbound 2:stocktake 3:outbound
          if (!targetTag.disabled || targetTag.status === 1 || targetTag.status === 2) {
            tagList.push(targetTag)
          }
        } else {
          tagList.push(targetTag)
        }

        // set stock in products
        if (targetTag.skuCode && !targetTag.disabled && targetTag.checked) {
          stockReturnTags.push(targetTag)
        }

        if (!targetTag.checked) {
          isAllChecked = false
        }
      })
      this.ctrl.checkAll = isAllChecked
      this.tagList = tagList
      this.stockReturnTags = stockReturnTags
    },
    onCheckAllChange(values) {
      let checkAll = values.length > 0
      this.tagList.forEach(tag => {
        if (tag.disabled) {
          tag.checked = false
        } else {
          tag.checked = checkAll
        }
      })
    },
    getStatusDesc(item) {
      // For returns, show status based on original status
      const statusMap = {
        'OUTBOUND': 'Shipped (Customer)',
        'INBOUND': 'In Warehouse',
        'QUARANTINE': 'Already Returned',
        'GENERATED': 'Not Received',
        'ALLOCATED': 'Allocated'
      }
      return statusMap[item.statusString] || item.statusString || 'Unknown'
    },
    getReason(item) {
      return item.inboundNote || item.notes || '--'
    },
    getRowClass(item) {
      if (item.disabled) {
        return 'text-disabled'
      }
      // For returns: OUTBOUND (customer) or INBOUND (supplier) should be enabled
      if (item.statusString === 'OUTBOUND' || item.statusString === 'INBOUND') {
        return 'text-primary'
      }
      return 'text-disabled'
    },
    getDisableState(item) {
      // For returns: 
      // - Customer Return: only OUTBOUND EPCs allowed
      // - Supplier Return: only INBOUND EPCs allowed
      const returnType = this.stockReturnForm?.returnType
      
      if (returnType === 'CUSTOMER_RETURN') {
        return item.statusString !== 'OUTBOUND'
      } else if (returnType === 'SUPPLIER_RETURN') {
        return item.statusString !== 'INBOUND'
      }
      
      // If no return type set, disable all
      return true
    },
    selectCondition(item, condition) {
      if (!item.disabled) {
        item.condition = condition
        // Update the scannedTags to persist the condition
        const tagIndex = this.scannedTags.findIndex(tag => tag.tagCode === item.tagCode)
        if (tagIndex !== -1) {
          this.scannedTags[tagIndex].condition = condition
        }
        // Trigger update
        this.handleTagsUpdate()
      }
    }
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
    }
  }

  .table-container {
      .table-wrapper {
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: visible;

      .table-scroll {
        width: 100%;
        height: 320px;
        overflow: auto;
        position: relative; /* containing block for sticky header */
        -webkit-overflow-scrolling: touch;
        background: #f8f9fa url('') no-repeat top left; /* full-width grey bar behind header */
        background-size: 100% 44px;
      }

      .table-header {
        display: inline-flex;
        background-color: transparent; /* let .table-scroll provide the grey bar so it doesn't get cut */
        border-bottom: 2px solid #dee2e6;
        position: sticky; /* sticky inside .table-scroll */
        top: 0;
        z-index: 40; /* above rows */
        box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        min-width: max-content; /* expand to full content width */
        width: fit-content; /* fit to inner cells so it scrolls horizontally with content */
        background-clip: padding-box;
        .header-cell {
          padding: 10px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #495057;
          text-align: center;
          border-right: 1px solid #dee2e6;

          &:last-child {
            border-right: none;
          }
        }
      }

      .table-row {
        display: flex;
        border-bottom: 1px solid #e9ecef;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f8f9fa;
        }

        &:last-child {
          border-bottom: none;
        }

        &.disabled-row {
          opacity: 0.5;
          background-color: #f8f9fa;
        }

        .table-cell {
          padding: 8px;
          font-size: 12px;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #e9ecef;
          text-align: center;
          overflow: hidden;
          white-space: normal; /* allow wrapping inside cells */

          &:last-child {
            border-right: none;
          }
        }
      }

      /* Condition column: allow buttons to wrap inside the cell instead of overflowing */
      .condition-col {
        overflow: hidden;
        align-items: center;
        justify-content: center;
        padding: 10px 8px;

        .condition-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
      }

      // Column widths
      .epc-col {
        flex: 0 0 220px;
        min-width: 160px;
      }

      .product-col {
        flex: 1 1 220px; /* allow product column to grow and wrap */
        min-width: 140px;
      }

      .sku-col {
        flex: 0 0 120px;
        min-width: 100px;
      }

      .status-col {
        flex: 0 0 100px;
        min-width: 100px;
      }

      .condition-col {
        flex: 0 0 220px;
        min-width: 160px;
        /* allow inner buttons to wrap and remain visible */
      }

      .epc-text {
        font-size: 11px;
        color: #667eea;
        font-weight: 500;
        word-break: break-word; /* allow long EPCs to wrap sensibly */
        white-space: normal;
        line-height: 1.3;
        max-width: 220px;
      }

      .product-text {
        font-size: 12px;
        color: #333;
        white-space: normal; /* allow product names to wrap */
        word-break: break-word;
      }

      .sku-text {
        font-size: 11px;
        color: #666;
        font-family: monospace;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100px;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;

        &.status-outbound {
          background-color: #d1ecf1;
          color: #0c5460;
        }

        &.status-inbound {
          background-color: #d4edda;
          color: #155724;
        }

        &.status-quarantine {
          background-color: #fff3cd;
          color: #856404;
        }

        &.status-generated {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .status-text {
          font-size: 10px;
        }
      }

      .condition-buttons {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: center;

        .condition-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;

          &.active {
            background-color: #667eea;
            border-color: #667eea;

            .condition-text {
              color: #ffffff;
              font-weight: 600;
            }
          }

          .condition-text {
            font-size: 11px;
            color: #495057;
            font-weight: 500;
            white-space: nowrap;
          }
        }
      }
    }
  }

  .summary-section {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-top: 12px;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;

      .summary-label {
        font-size: 13px;
        color: #666;
        font-weight: 500;
      }

      .summary-value {
        font-size: 16px;
        color: #667eea;
        font-weight: 700;

        &.valid {
          color: #28a745;
        }
      }
    }
  }
}
</style>

  