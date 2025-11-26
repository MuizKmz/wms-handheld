<template>
  <view class="tags-section">
    <view class="tags-header">
      <view class="wms-flex-row wms-justify-center wms-items-center inventory-title">
        <up-text :bold="true" prefixIcon="tags" size="12" text="Tags to return"></up-text>
        <view class="wms-flex-row wms-justify-center wms-items-center">
          <view class="wms-flex-row wms-justify-center wms-items-center">
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
        <up-col span="1">
          <up-checkbox-group
              v-model="checkedValues"
              placement="column"
              @change="onCheckAllChange"
          >
            <up-checkbox
                v-model:checked="ctrl.checkAll"
                label=""
                name="checkAll"
            />
          </up-checkbox-group>

          <!--          <up-text align="center" class="header-text" line="3" text="Select"></up-text>-->
        </up-col>
        <up-col span="2" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Tag Code"></up-text>
        </up-col>
        <up-col span="1.8" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Product Name"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="SKU"></up-text>
        </up-col>
        <up-col span="2" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Condition"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Warehouse"></up-text>
        </up-col>
        <up-col span="1.5" textAlign="center">
          <up-text align="center" class="header-text" line="3" text="Rack"></up-text>
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
              <up-text :text="item.productName || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.skuCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="2">
              <view class="condition-select">
                <up-button 
                  v-for="cond in conditions" 
                  :key="cond.value"
                  :type="item.condition === cond.value ? 'primary' : 'info'"
                  :plain="item.condition !== cond.value"
                  :disabled="item.disabled"
                  size="mini"
                  :text="cond.label"
                  @click="selectCondition(item, cond.value)"
                  class="condition-btn"
                ></up-button>
              </view>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.warehouseCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
            <up-col span="1.5">
              <up-text :text="item.rackCode || '--'" align="center" class="table-text"
                       line="3"></up-text>
            </up-col>
          </up-row>
        </view>
        <view v-if="tagList.length<=0" class="no-data-wrapper">No tags scanned</view>
      </scroll-view>
    </scroll-view>
    <template v-if="searchReturnTags.length > 0">
      <up-line></up-line>
      <view class="total-tags wms-flex-row wms-justify-center wms-items-center">
        {{ searchReturnTags.length }} tags scanned, {{ tagList.length }} tags shown
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
    searchReturnTags: {
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
      checkedValues: [],
      conditions: [
        { label: 'Good', value: 'GOOD' },
        { label: 'Defect', value: 'DEFECTIVE' },
        { label: 'Damage', value: 'DAMAGED' },
        { label: 'Wrong', value: 'WRONG_ITEM' }
      ]
      // ctrl: {
      //   showValid: false
      // }
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      searchReturnTags: 'searchReturnTags',
      stockReturnTags: 'stockReturnTags',
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
    ...mapActions(useStockStore, {clear: 'clearReturnAction', reloadInventory: 'reloadInventoryAction',}),
    onClear() {
      this.clear()
      this.searchReturnTags = []
      this.handleTagsUpdate()
      this.$msg('Cleared all tags')
    },
    async onReload() {
      await this.reloadInventory()
      this.$msg('Reloaded')
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
      if (item.status !== 3 && item.inboundType === 3) {
        return 'Returned'
      } else {
        return 'Not Return'
      }
    },
    getReason(item) {
      if (item.status !== 3 && item.inboundType === 3) {
        return item.inboundNote || '--'
      } else {
        return '--'
      }
    },
    getRowClass(item) {
      if (item.disabled) {
        return 'text-disabled'
      }
      switch (item.status) {
        case 1:
        case 2:
          return 'text-disabled'
        case 3:
          return 'text-primary'
        default:
          return 'text-disabled'
      }
    },
    getDisableState(item) {
      switch (item.status) {
        case 1:
        case 2:
          return true
        case 3:
          return false
        default:
          return true
      }
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
      
      .condition-select {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        justify-content: center;
        padding: 2px 0;
        
        .condition-btn {
          font-size: 9px;
          padding: 2px 6px;
          margin: 0;
        }
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
  