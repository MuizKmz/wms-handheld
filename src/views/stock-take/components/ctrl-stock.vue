<template>
  <view class="action-section">
    <up-row class="action-buttons" gutter="10" justify="center">
      <up-col span="4">
        <up-button :text="inventoryText" :throttleTime="1000" icon="tags"
                   shape="circle" size="small"
                   type="success"
                   @click="inventoryTrigger"></up-button>
      </up-col>
      <up-col span="4">
        <up-button :throttleTime="1000" icon="scan" shape="circle" size="small"
                   text="SCAN QR"
                   type="warning"
                   @click="onScanCode"></up-button>
      </up-col>
      <up-col span="4">
        <up-button :throttleTime="1000" icon="home" shape="circle" size="small"
                   text="STOCK TAKE"
                   type="primary"
                   @click="confirmStockTake"></up-button>
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
      stockTakeForm: 'stockTakeForm',
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      inquiredTagCodes: 'inquiredTagCodes',
      tagStore: 'tagStore',
      receivingProducts: 'receivingProducts',
      stockTakeTags: 'stockTakeTags'
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

    async confirmStockTake() {
      if (this.stockTakeTags.length <= 0) {
        uni.showToast({
          title: 'No tags to stock take',
          icon: 'none'
        })
        return
      }

      let tags = []
      this.stockTakeTags.forEach(product => {
        tags.push({
          tagType: product.tagType,
          tagCode: product.tagCode,
          skuCode: product.skuCode,
          productCode: product.productCode,
        })
      })

      let stockTakeForm = {...this.stockTakeForm}
      stockTakeForm.tags = tags

      this.ctrl.isLoading = true
      let res
      try {
        res = await this.$api.stockTake(
            stockTakeForm
        )
      } catch (e) {
        console.error(e)
        this.ctrl.isLoading = false
        return
      }
      this.ctrl.isLoading = false
      if (res.success) {
        await this.reloadInventory()
        this.$msg('Stock take success')
      } else {
        this.$msg('Stock take failed: ' + res.msg)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.action-section {
  position: fixed;
  bottom: -1px;
  //bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: #f5e1c1;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  //margin-bottom: 6px;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  //margin-bottom: 10px;
  margin-bottom: 4px;
}

//.confirm-btn {
//  width: 100%;
//  font-size: 16px;
//  border-radius: 100px;
//  min-width: 150px;
//}
</style>
  