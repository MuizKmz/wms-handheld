<template>
  <view class="tags-section">
    <view class="tags-header">
      <view class="tags-title-wrapper">
        <up-icon name="list" size="16" color="#667eea"></up-icon>
        <text class="tags-title-text">Inventory List</text>
      </view>
      <view class="tags-count">
        <text class="count-badge">{{ searchTags.length }}</text>
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
            <view class="table-cell header-cell tag-col">Tag Code</view>
            <view class="table-cell header-cell product-col">Product</view>
            <view class="table-cell header-cell sku-col">SKU</view>
            <view class="table-cell header-cell status-col">Status</view>
            <view class="table-cell header-cell location-col">Warehouse</view>
            <view class="table-cell header-cell location-col">Rack</view>
            <view class="table-cell header-cell location-col">Section</view>
          </view>
          
          <!-- Table Body -->
          <view v-for="(item, index) in tagList" :key="index" class="table-row" :class="getRowClass(item)">
            <view class="table-cell tag-col">
              <text class="tag-text">{{ item.tagCode }}</text>
            </view>
            <view class="table-cell product-col">
              <text class="product-text">{{ item.productName || '--' }}</text>
            </view>
            <view class="table-cell sku-col">
              <text class="sku-text">{{ item.skuCode || '--' }}</text>
            </view>
            <view class="table-cell status-col">
              <text class="status-text">{{ getStatusDesc(item) }}</text>
            </view>
            <view class="table-cell location-col">
              <text class="location-text">{{ item.warehouseCode || '--' }}</text>
            </view>
            <view class="table-cell location-col">
              <text class="location-text">{{ item.rackCode || '--' }}</text>
            </view>
            <view class="table-cell location-col">
              <text class="location-text">{{ item.sectionCode || '--' }}</text>
            </view>
          </view>
          
          <!-- No Data -->
          <view v-if="tagList.length <= 0" class="no-data-wrapper">
            <text class="no-data-text">No tags scanned</text>
          </view>
        </scroll-view>
      </view>
    </view>
    <template v-if="searchTags.length > 0">
      <up-line color="#f0f2f5" margin="12px 0"></up-line>
      <view class="tags-footer">
        <text class="footer-text">{{ searchTags.length }} tags scanned, {{ tagList.length }} tags shown</text>
      </view>
    </template>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  props: {},
  watch: {
    searchTags: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.handleTagsUpdate()
        }
      }
    },
    scannedTags: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.handleTagsUpdate()
        }
      }
    },
    tagList: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.ctrl.checkAll = newVal.every(tag => !tag.disabled && tag.checked)
        }
      }
    }
  },
  data() {
    return {
      tagList: [],
      checkedValues: []
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      searchTags: 'searchTags',
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
    ...mapActions(useStockStore, {reloadInventory: 'reloadInventoryAction',}),
    handleTagsUpdate() {
      let tagList = []
      this.searchTags.forEach(searchTag => {
        let targetTag = {...this.scannedTags.find(tag => tag.tagCode === searchTag.tagCode)}
        if (targetTag.tagCode) {
          targetTag.matched = true
          targetTag.disabled = this.getDisableState(targetTag)

          if (targetTag.disabled) {
            targetTag.checked = false
          } else {
            if (targetTag.checked === undefined) {
              targetTag.checked = true
            }
          }
        } else {
          targetTag = {...searchTag}
          targetTag.matched = false
          targetTag.disabled = true
          targetTag.checked = false
        }

        tagList.push(targetTag)

      })
      this.tagList = tagList
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
      let statusDesc = this.$getInventoryStatus(item.status)?.name
      let desc = ''
      switch (item.status) {
        case 1:
          desc = this.$getInboundType(item.inboundType)?.name
          break
        case 2:
          break
        case 3:
          desc = this.$getOutboundType(item.outboundType)?.name
          break
        default:
      }
      return statusDesc + (desc ? `(${desc})` : '')
    },
    getReason(item) {
      if (item.status !== 3 && item.inboundType === 3) {
        return item.inboundNote || '--'
      } else {
        return '--'
      }
    },
    getRowClass(item) {
      return ''
    },
    getDisableState(item) {
      return false
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
          min-width: 900px;
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

          &.tag-col {
            width: 180px;
            justify-content: flex-start;

            .tag-text {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              color: #333;
              word-break: break-all;
              text-align: left;
              line-height: 1.4;
              width: 100%;
            }
          }

          &.product-col {
            width: 160px;
            justify-content: flex-start;

            .product-text {
              text-align: left;
              line-height: 1.4;
              font-size: 12px;
              width: 100%;
            }
          }

          &.sku-col {
            width: 120px;

            .sku-text {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #5f6368;
            }
          }

          &.status-col {
            width: 140px;

            .status-text {
              font-size: 12px;
              font-weight: 500;
            }
          }

          &.location-col {
            width: 100px;

            .location-text {
              font-size: 12px;
              color: #5f6368;
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
}
</style>
  