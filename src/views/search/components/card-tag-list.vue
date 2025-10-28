<template>
  <view class="tags-section">
    <view class="tags-header">
      <view class="wms-flex-row wms-justify-center wms-items-center inventory-title">
        <up-text :bold="true" prefixIcon="tags" size="12" text="Inventory List"></up-text>
      </view>
    </view>
    <up-line></up-line>
    <scroll-view class="table-wrapper" scroll-x="true">
      <up-row align="center" class="table-header" justify="start">
        <up-col span="2" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Tag Code"></up-text>
        </up-col>
        <up-col span="1.8" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Product Name"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="SKU"></up-text>
        </up-col>
        <up-col span="2.2" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Status"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Warehouse"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Rack"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Section"></up-text>
        </up-col>
      </up-row>
      <up-line class="separator-line"></up-line>
      <scroll-view class="table-content" scroll-y="true">
        <view v-for="(item, index) in tagList" :key="index" class="table-row">
          <up-row :class="getRowClass(item)" align="center" justify="start">
            <up-col span="2">
              <up-text :text="item.tagCode" align="center" class="table-text text-width-limit"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.8">
              <up-text :text="item.productName || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.skuCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="2.2">
              <up-text :text="getStatusDesc(item)" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.warehouseCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.rackCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.sectionCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
          </up-row>
        </view>
        <view v-if="tagList.length<=0" class="no-data-wrapper">No tags scanned</view>
      </scroll-view>
    </scroll-view>
    <template v-if="searchTags.length > 0">
      <up-line></up-line>
      <view class="total-tags wms-flex-row wms-justify-center wms-items-center">
        {{ searchTags.length }} tags scanned, {{ tagList.length }} tags shown
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
  //flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 6px 6px 0 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 100px;
  //width: 100vw;
  overflow-x: auto;

  .total-tags {
    font-size: 10px;
    color: #999;
    padding: 10px 0;
    //width: 100vw;
    text-align: center;
  }

  .tags-header {

    :deep(.u-line) {
      width: 130vw !important;
    }

    .inventory-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 4px;

      .valid-switch {
        margin-right: 4px !important;
      }

      :deep(.u-text__value) {
        //font-size: 12px !important;
        //font-weight: 700 !important;
        //text-align: center !important;
        //width: 100px;
      }
    }
  }


  .table-wrapper {
    overflow-x: auto;
    white-space: nowrap;
  }

  .table-header {
    width: 130vw;

    .header-text {

      font-size: 12px;
      font-weight: bold;
      //text-align: center;
      margin: 4px 0px !important;

      :deep(.u-text__value) {
        font-size: 10px !important;
        font-weight: bold !important;
        //text-align: center !important;
        //width: 80px;
      }
    }

    :deep(.u-checkbox-label--left) {
      justify-content: center !important;
    }
  }

  .separator-line {
    width: 130vw !important;
    margin: 0px !important;
    background-color: #f0f0f0 !important;
  }

  //.table-text {
  //  font-size: 11px;
  //  word-wrap: break-word;
  //  overflow-wrap: break-word;
  //  word-break: break-word;
  //  /* Smaller font for more columns */
  //}

  .text-danger {
    color: $uni-color-error;

    :deep(.u-text__value) {
      color: $uni-color-error !important;
    }
  }

  .text-warning {
    color: $uni-color-warning;

    :deep(.u-text__value) {
      color: $uni-color-warning !important;
    }
  }

  .text-success {
    color: $uni-color-success;

    :deep(.u-text__value) {
      color: $uni-color-success !important;
    }
  }

  .text-primary {
    color: $uni-color-primary;

    :deep(.u-text__value) {
      color: $uni-color-primary !important;
    }
  }

  .text-disabled {
    color: $uni-text-color-disable;

    :deep(.u-text__value) {
      color: $uni-text-color-disable !important;
    }
  }

  .table-content {
    //min-height: 100px;
    overflow-y: auto;
    width: 130vw;

    .table-row {
      width: 130vw;
      border-bottom: 1px solid #f0f0f0;
      padding: 2px 0;

      &:last-child {
        border-bottom: none;
      }

      :deep(.u-checkbox-label--left) {
        justify-content: center !important;
      }
    }

    .table-text {
      font-size: 10px;
      //padding: 4px 0;
      //text-align: center;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      //width: 50px;

      :deep(.u-text__value) {
        font-size: 10px !important;
        //text-align: center !important;
        //width: 80px;
      }
    }

    .text-width-limit {
      :deep(.u-text__value) {
        width: 70px !important;
      }
    }

    .epc {
      word-break: break-all;
      text-align: left;
      padding-left: 5px;
    }

    .no-data-wrapper {
      text-align: center;
      font-size: 12px;
      color: #999;
      padding: 10px 0;
      width: 100vw;
    }
  }
}
</style>
  