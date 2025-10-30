<template>
  <view class="action-section">
    <up-row class="action-buttons" gutter="10" justify="center">
      <up-col span="4">
        <up-button 
          :text="inventoryText" 
          :type="inventoryInProgress ? 'error' : 'success'"
          :throttleTime="1000" 
          icon="tags"
          shape="circle" 
          size="small"
          @click="inventoryTrigger"></up-button>
      </up-col>
      <up-col span="4">
        <up-button 
          :throttleTime="1000" 
          icon="scan" 
          shape="circle" 
          size="small"
          text="Scan"
          type="warning"
          @click="onScanCode"></up-button>
      </up-col>
      <up-col span="4">
        <up-button 
          :throttleTime="1000" 
          icon="arrow-upward" 
          shape="circle" 
          size="small"
          text="Stock Out"
          type="primary"
          @click="confirmStockOut"></up-button>
      </up-col>
    </up-row>
  </view>
</template>
<script>
import {useInventoryStore} from '@/store/inventory'
import {mapActions, mapState, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  props: {
    // submitForm: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // }
  },
  data() {
    return {
      mockEpcCodeList: ['AF01S0000001042500000001',
        'AF01S0000001042500000002',
        'AF01S0000001042500000003',
        'AF01S0000001042500000004',
        'AF01S0000001042500000005',
        'AF01S0000001042500000006',
        'AF01S0000001042500000007',
        'AF01S0000001042500000008',
        'AF01S0000001042500000009',
        'AF01S0000001042500000010',
        'AF01S0000002042500000001',
        'AF01S0000002042500000002',
        'AF01S0000002042500000003',
        'AF01S0000002042500000004',
        'AF01S0000002042500000005',
        'AF01S0000002042500000006']
      // key:tagCode, value: tagType
      // scannedMap: new Map(),
    }
  },
  watch: {
    // tagMap: {
    //   handler(newVal) {
    //   },
    //   deep: true
    // },
    deviceInventoryList: {
      handler(newVal) {
        // this.scannedMap.set(tag.tagCode, tag.tagType)
        if (newVal) {
          newVal.forEach(tag => {
            this.tagStore[tag.epc] = 1
            this.removeFromInquiredTags(tag.epc)
            // this.scannedMap.set(tag.epc, 1)
          })
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapState(useInventoryStore, {
      deviceInfo: 'deviceInfo',
      inventoryInProgress: 'inventoryInProgress',
    }),
    ...mapWritableState(useInventoryStore, {deviceInventoryList: 'deviceInventoryList'}),
    ...mapWritableState(useStockStore, {
      stockOutForm: 'stockOutForm',
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      inquiredTagCodes: 'inquiredTagCodes',
      tagStore: 'tagStore',
      stockOutTags: 'stockOutTags'
    }),
    inventoryText() {
      return this.inventoryInProgress ? 'STOP SCAN' : 'START SCAN'
    },
  },
  async mounted() {
    console.log('ctrl-stock mounted')
    // #ifdef APP-PLUS
    await this.initDevice()
    // #endif
    // uni.$on('onShow', () => {
    // })
  },
  beforeUnmount() {
    console.log('ctrl-stock unmounted')
    uni.$off('onShow')
    // #ifdef APP-PLUS
    this.stopInventory()
    // #endif
  },
  methods: {
    ...mapActions(useInventoryStore, {
      initDevice: 'initDeviceAction',
      startInventory: 'startInventoryAction',
      stopInventory: 'stopInventoryAction',
      getDeviceInfo: 'getDeviceInfoAction',
    }),
    ...mapActions(useStockStore, {
      clear: 'clearAction',
      queryInventory: 'queryInventoryAction',
      reloadInventory: 'reloadInventoryAction'
    }),
    inventoryTrigger() {
      // this.$emit('onScanUpdate', {})
      // #ifdef APP-PLUS
      if (this.inventoryInProgress) {
        this.stopInventory()
        clearInterval(this.ctrl.queryInterval)
      } else {
        this.startInventory()
        this.ctrl.queryInterval = setInterval(() => {
          this.queryInventory()
        }, 1000)
      }
      // #endif
    },
    /**
     * Remove tag from inquired tags
     * @param tagCode
     */
    removeFromInquiredTags(tagCode) {
      let inquiredTagCodeSet = new Set([...this.inquiredTagCodes])
      inquiredTagCodeSet.delete(tagCode)
      this.inquiredTagCodes = [...inquiredTagCodeSet]
    },
    onScanCode() {
      // #ifdef APP-PLUS
      uni.scanCode({
        autoZoom: false,
        success: async (res) => {
          // console.log('条码类型：' + res.scanType)
          // console.log('条码内容：' + res.result)
          // 1:RFID 2:QRCode 3:BarCode 4:Excel
          let tagType
          if (res.scanType === 'QR_CODE') {
            tagType = 2
          } else {
            tagType = 3
          }
          // this.scannedMap.set(res.result, tagType)
          this.tagStore[res.result] = tagType
          this.removeFromInquiredTags(res.result)
          await this.queryInventory()
          setTimeout(() => {
            this.onScanCode()
          }, 500)
        }
      })
      // #endif
      // #ifdef H5
      this.mockEpcCodeList.forEach(epcCode => {
        this.tagStore[epcCode] = 2
        this.removeFromInquiredTags(epcCode)
      })
      this.queryInventory()
      // #endif
    },

    async confirmStockOut() {
      if (this.stockOutTags.length <= 0) {
        this.$msg('No tags to stock out')
        return
      }

      let tags = []
      let epcIds = [] // Collect EPC IDs for bulk status update
      this.stockOutTags.forEach(product => {
        tags.push({
          tagType: product.tagType,
          tagCode: product.tagCode,
          skuCode: product.skuCode,
          productCode: product.productCode,
        })
        // If product has EPC id, add for bulk update
        if (product.id && product.tagType === 1) {
          epcIds.push(product.id)
        }
      })

      let stockOutForm = {...this.stockOutForm}
      stockOutForm.tags = tags

      this.ctrl.isLoading = true
      let res
      try {
        res = await this.$api.stockOut(
            stockOutForm
        )
      } catch (e) {
        console.error(e)
        this.ctrl.isLoading = false
        return
      }

      // Update EPC statuses to DELIVERED after successful stock-out
      if (res.success && epcIds.length > 0) {
        try {
          await this.$api.bulkUpdateStatuses(epcIds, 'DELIVERED')
        } catch (err) {
          console.warn('EPC status update failed', err)
        }
      }

      this.ctrl.isLoading = false
      if (res.success) {
        await this.reloadInventory()
        this.$msg('Stock out success')
      } else {
        this.$msg('Stock out failed: ' + res.msg)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.action-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%);
  padding: 16px 20px 20px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  border-top: 1px solid #e8eaed;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0;

  :deep(.u-button) {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 12px !important;
    padding: 14px 8px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.u-button__text) {
    font-size: 12px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  :deep(.u-button--success) {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
  }

  :deep(.u-button--warning) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  }

  :deep(.u-button--primary) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  }

  :deep(.u-button--info) {
    background: linear-gradient(135deg, #a8b8d8 0%, #7e8ba3 100%) !important;
  }
}
</style>
  