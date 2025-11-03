<template>
  <view class="action-section">
    <up-row class="action-buttons" gutter="10" justify="center">
      <up-col span="4">
        <up-button 
          :disabled="!stockOutForm.orderCode"
          :text="hardwareScanText" 
          :type="isHardwareScanning ? 'error' : 'success'"
          :throttleTime="1000" 
          icon="scan"
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
import hardwareScanner from '@/utils/hardware-scanner'

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
      isHardwareScanning: false,
      clipboardCheckInterval: null, // Interval for clipboard polling
      lastClipboardContent: '', // Track last clipboard content to detect new scans
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
    hardwareScanText() {
      return this.isHardwareScanning ? 'Stop HW' : 'Start HW'
    }
  },
  async mounted() {
    console.log('ctrl-stock mounted')
    // Initialize hardware scanner
    // #ifdef APP-PLUS
    const initResult = hardwareScanner.init()
    if (initResult.success) {
      console.log('✅ Hardware scanner ready')
    } else {
      console.warn('⚠️ Hardware scanner init failed:', initResult.message)
    }
    // #endif
    // #ifdef APP-PLUS
    await this.initDevice()
    // #endif
    // uni.$on('onShow', () => {
    // })
  },
  beforeUnmount() {
    console.log('ctrl-stock unmounted')
    // Stop hardware scanning if active
    if (this.isHardwareScanning) {
      hardwareScanner.stopScan()
      this.isHardwareScanning = false
    }
    // Cleanup hardware scanner
    hardwareScanner.destroy()
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
    /**
     * Toggle hardware scanning on/off (clipboard mode for barcode scanner)
     */
    inventoryTrigger() {
      if (this.isHardwareScanning) {
        // Stop hardware scanning
        this.stopClipboardPolling()
        hardwareScanner.stopScan()
        this.isHardwareScanning = false
        this.$msg('⏹️ Hardware Scan Stopped')
      } else {
        // Validate order is scanned first
        if (!this.stockOutForm.orderCode) {
          this.$msg('⚠️ Please scan order number first')
          return
        }
        
        // Start hardware scanning
        const result = hardwareScanner.startScan((barcode, barcodeType) => {
          this.onHardwareScanResult(barcode, barcodeType)
        })
        
        if (result.success) {
          this.isHardwareScanning = true
          this.startClipboardPolling()
          this.$msg('🔍 Hardware Scan Active - Use Trigger', 'center', 2000)
        } else {
          uni.showModal({
            title: '❌ Scanner Error',
            content: `Failed to start hardware scanner.\n\n${result.message}`,
            showCancel: false
          })
        }
      }
    },
    /**
     * Start polling clipboard for scanner input (clipboard mode)
     */
    startClipboardPolling() {
      // #ifdef APP-PLUS
      console.log('📋 Starting clipboard polling...')
      this.lastClipboardContent = ''
      
      // Poll clipboard every 300ms
      this.clipboardCheckInterval = setInterval(() => {
        uni.getClipboardData({
          success: (res) => {
            let clipboardText = res.data
            
            // Trim whitespace and newlines
            if (clipboardText) {
              clipboardText = clipboardText.trim()
            }
            
            // Check if clipboard content changed and is not empty
            if (clipboardText && 
                clipboardText.length > 0 && 
                clipboardText !== this.lastClipboardContent) {
              
              console.log('📋 Clipboard detected:', clipboardText)
              this.lastClipboardContent = clipboardText
              
              // Process as scanned barcode
              this.onHardwareScanResult(clipboardText, 'clipboard')
              
              // Clear clipboard after processing
              setTimeout(() => {
                uni.setClipboardData({
                  data: '',
                  showToast: false
                })
              }, 100)
            }
          }
        })
      }, 300)
      // #endif
    },
    /**
     * Stop clipboard polling
     */
    stopClipboardPolling() {
      if (this.clipboardCheckInterval) {
        clearInterval(this.clipboardCheckInterval)
        this.clipboardCheckInterval = null
        console.log('📋 Clipboard polling stopped')
      }
    },
    /**
     * Handle hardware scan result
     * @param {String} barcode - Scanned barcode
     * @param {String} barcodeType - Type of barcode
     */
    async onHardwareScanResult(barcode, barcodeType) {
      // Trim any whitespace or newlines
      barcode = barcode ? barcode.trim() : ''
      
      if (!barcode || barcode.length === 0) {
        console.log('⚠️ Empty barcode after trim, ignoring')
        return
      }
      
      console.log('📦 Hardware scanned:', barcode, 'Type:', barcodeType)
      
      // Show toast feedback
      this.$msg(`Scanned: ${barcode}`, 'center', 1500)
      
      // Determine tag type based on barcode type
      // 1: EPC/RFID, 2: QR Code, 3: Barcode
      let tagType = 3 // Default to barcode
      if (barcodeType && barcodeType.includes('QR')) {
        tagType = 2
      }
      
      // Add to tag store
      this.tagStore[barcode] = tagType
      this.removeFromInquiredTags(barcode)
      
      // Query inventory to get product details
      await this.queryInventory()
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
      // Validate order number exists
      if (!this.stockOutForm.orderCode) {
        uni.showModal({
          title: '⚠️ No Order Selected',
          content: 'Please scan order number first.',
          showCancel: false
        })
        return
      }

      // Collect EPC codes from scanned tags that have both id and skuCode
      let epcCodes = []
      this.scannedTags.forEach(tag => {
        // Only include EPCs that were found in database (have id and skuCode)
        if (tag.id && tag.skuCode && tag.epcCode) {
          epcCodes.push(tag.epcCode)
        }
      })

      if (epcCodes.length === 0) {
        uni.showModal({
          title: '⚠️ No Valid EPCs',
          content: 'Please scan EPCs that are registered in the system.\n\nScanned EPCs must:\n• Be in INBOUND status\n• Match order products\n• Have matching SKU codes',
          showCancel: false
        })
        return
      }

      // Confirm before processing
      const confirmed = await new Promise((resolve) => {
        uni.showModal({
          title: '📦 Confirm Stock Out',
          content: `Stock out ${epcCodes.length} EPC(s) for order ${this.stockOutForm.orderCode}?`,
          success: (res) => resolve(res.confirm)
        })
      })

      if (!confirmed) return

      this.ctrl.isLoading = true
      this.ctrl.loadingTxt = `Processing ${epcCodes.length} EPC(s)...`

      try {
        // Call stock-out scan API with order validation
        const res = await this.$api.stockOutScan({
          epcCodes: epcCodes,
          orderNo: this.stockOutForm.orderCode,
          stockOutBy: 'Handheld User'
        })

        this.ctrl.isLoading = false

        if (res.success && res.scanned && res.scanned.length > 0) {
          if (res.errors && res.errors.length > 0) {
            // Partial success
            const errorDetails = res.errors.slice(0, 3).join('\n• ')
            const moreText = res.errors.length > 3 ? `\n...and ${res.errors.length - 3} more` : ''
            
            uni.showModal({
              title: '⚠️ Partial Success',
              content: `✅ ${res.scanned.length} succeeded\n❌ ${res.errors.length} failed:\n\n• ${errorDetails}${moreText}`,
              showCancel: false,
              success: () => {
                this.clear()
              }
            })
          } else {
            // All successful
            uni.showModal({
              title: '✅ Stock Out Success',
              content: `Successfully stocked out ${res.scanned.length} EPC(s).\n\nStatus updated to DELIVERED.`,
              showCancel: false,
              success: () => {
                this.clear()
              }
            })
          }
        } else {
          // All failed
          const errorMsg = res.errors && res.errors.length > 0 
            ? res.errors.slice(0, 3).join('\n• ')
            : 'Stock out failed'
          
          uni.showModal({
            title: '❌ Stock Out Failed',
            content: `Failed to stock out EPCs:\n\n• ${errorMsg}`,
            showCancel: false
          })
        }
      } catch (e) {
        console.error('Stock out error:', e)
        this.ctrl.isLoading = false
        
        const errorMsg = e.data?.message || e.message || 'Unknown error'
        uni.showModal({
          title: '❌ Stock Out Failed',
          content: `Error: ${errorMsg}\n\nPlease try again or contact support.`,
          showCancel: false
        })
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
  