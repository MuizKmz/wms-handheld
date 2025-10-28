<template>
  <view v-if="stockInForm.receivingCode" class="tags-section">
    <view class="tags-header">
      <view class="wms-flex-row wms-justify-center wms-items-center inventory-title">
        <up-text :bold="true" prefixIcon="tags" size="12" text="Tags Scanned"></up-text>
        <view class="wms-flex-row wms-justify-center wms-items-center">
          <view v-if="stockInForm.tagFlow === 1" class="wms-flex-row wms-justify-center wms-items-center">
            <up-text :bold="false" class="valid-switch" size="12" text="Valid Only"></up-text>
            <up-switch v-model="ctrl.showValid" size="20" @change="handleTagsUpdate"></up-switch>
          </view>
          <view class="wms-flex-row wms-justify-between wms-items-center wms-gap-4 wms-ml-4">
            <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="trash-fill" shape="circle" size="mini"
                       text="" type="info"
                       @click="onClear"></up-button>
            <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="reload" shape="circle" size="mini"
                       text="" type="info"
                       @click="onReload"></up-button>
          </view>
        </view>
      </view>
    </view>
    <up-line></up-line>
    <scroll-view class="table-wrapper" scroll-x="true">
      <up-row align="center" class="table-header" justify="start">
        <up-col span="1" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Select"></up-text>
        </up-col>
        <up-col span="2" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Tag Code"></up-text>
        </up-col>
        <up-col span="1.8" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Order Code"></up-text>
        </up-col>
        <up-col span="1.2" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Status"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Sku Code"></up-text>
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
            <up-col span="1">
              <up-checkbox
                  v-model:checked="item.checked"
                  :disabled="item.disabled"
                  label=""
                  usedAlone
              >
              </up-checkbox>
            </up-col>
            <up-col span="2">
              <up-text :text="item.tagCode" align="center" class="table-text text-width-limit"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.8">
              <up-text :text="item.orderCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.2">
              <up-text :text="getStatusDesc(item.status)" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.skuCode || '--'" align="center" class="table-text"
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
    <template v-if="scannedTags.length > 0">
      <up-line></up-line>
      <view class="total-tags wms-flex-row wms-justify-center wms-items-center">
        {{ scannedTags.length }} tags scanned, {{ tagList.length }} tags shown
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
      stockOutTags: 'stockOutTags',
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
      let stockOutTags = []
      this.scannedTags.forEach(tag => {
        tag.disabled = this.getDisableState(tag)
        if (tag.checked === undefined) {
          if (tag.disabled) {
            tag.checked = false
          } else {
            tag.checked = true
          }
        }
        if (this.ctrl.showValid) {
          if (!tag.disabled || tag.status === 1 || tag.status === 2) {
            tagList.push(tag)
          }
        } else {
          tagList.push(tag)
        }
        // EPC mode
        if (this.stockInForm.tagFlow === 1) {
          // set stock in products
          if (tag.skuCode && !tag.disabled && tag.checked) {
            stockOutTags.push(tag)
          }
        } else {
          // set stock in products
          if (this.tidProduct && !tag.disabled && tag.checked) {
            tag.skuCode = this.tidProduct.skuCode
            tag.productCode = this.tidProduct.productCode
            stockOutTags.push(tag)
          }
        }

      })
      this.tagList = tagList
      this.stockOutTags = stockOutTags
    },
    getStatusDesc(status) {
      let inventoryStatus = this.$getInventoryStatus(status)
      return inventoryStatus ? inventoryStatus.name : '--'
    },
    getRowClass(item) {
      switch (item.status) {
        case 1:
          return 'text-success'
        case 2:
          return 'text-warning'
        case 3:
          return 'text-danger'
        default:
          return 'text-disabled'
      }
    },
    getDisableState(item) {
      switch (item.status) {
        case 1:
        case 2:
          return false
        case 3:
          return true
        default:
          return true
      }
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
  