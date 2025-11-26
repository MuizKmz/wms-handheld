<template>
  <view class="action-section">
    <!-- DEBUG: Commented out for production -->
    <!-- <up-row v-if="true" class="debug-row" justify="center" style="margin-bottom: 10px;">
      <up-col span="6">
        <up-button 
          :type="debugModeEnabled ? 'error' : 'info'"
          :text="debugModeEnabled ? '🐛 DEBUG ON' : '🐛 DEBUG OFF'"
          size="mini"
          @click="toggleDebugMode"></up-button>
      </up-col>
    </up-row> -->
    
    <up-row class="action-buttons" gutter="10" justify="center">
      <up-col span="3">
        <up-button 
          :disabled="!stockInForm.receivingCode" 
          :type="isHardwareScanning ? 'error' : 'success'"
          :throttleTime="1000" 
          icon="scan" 
          shape="circle"
          size="small"
          :text="hardwareScanText"
          @click="toggleHardwareScan"></up-button>
      </up-col>
      <up-col span="3">
        <up-button 
          :disabled="!stockInForm.receivingCode || isHardwareScanning" 
          :throttleTime="1000" 
          icon="camera" 
          shape="circle"
          size="small"
          text="QR Scan"
          type="warning"
          @click="onScanCode"></up-button>
      </up-col>
      <up-col span="3">
        <up-button 
          :disabled="!stockInForm.receivingCode" 
          :throttleTime="1000" 
          icon="checkmark-circle" 
          shape="circle"
          size="small"
          text="Stock In"
          type="primary"
          @click="confirmStockIn"></up-button>
      </up-col>
      <up-col span="3">
        <up-button 
          :throttleTime="1000" 
          icon="trash" 
          shape="circle"
          size="small"
          text="Clear"
          type="info"
          @click="onClear"></up-button>
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
      debugModeEnabled: false,
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
        'AF01S0000002042500000005']
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
      stockInForm: 'stockInForm',
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      inquiredTagCodes: 'inquiredTagCodes',
      tagStore: 'tagStore',
      receivingProducts: 'receivingProducts',
      stockInTags: 'stockInTags'
    }),
    inventoryText() {
      return this.inventoryInProgress ? 'STOP SCAN' : 'START SCAN'
    },
    hardwareScanText() {
      return this.isHardwareScanning ? 'Stop HW' : 'Start HW'
    }
  },
  async mounted() {
    // console.log('ctrl-stock mounted')
    // Initialize hardware scanner
    // #ifdef APP-PLUS
    const initResult = hardwareScanner.init()
    if (initResult.success) {
      // console.log('✅ Hardware scanner ready')
    } else {
      console.warn('⚠️ Hardware scanner init failed:', initResult.message)
    }
    // #endif
  },
  beforeUnmount() {
    // console.log('ctrl-stock unmounted')
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
     * Toggle debug mode to discover broadcast actions
     * TEMPORARY - for testing only
     */
    toggleDebugMode() {
      if (this.debugModeEnabled) {
        hardwareScanner.disableDebugMode()
        this.debugModeEnabled = false
        this.$msg('🐛 Debug OFF')
      } else {
        const result = hardwareScanner.enableDebugMode()
        if (result.success) {
          this.debugModeEnabled = true
          uni.showModal({
            title: '🐛 Debug Mode ON',
            content: 'Now press the TRIGGER BUTTON on your device.\n\nWatch the console in HBuilder X to see what broadcast is received!',
            showCancel: false
          })
        }
      }
    },
    /**
     * Toggle hardware scanning on/off
     */
    toggleHardwareScan() {
      if (this.isHardwareScanning) {
        // Stop hardware scanning
        this.stopClipboardPolling()
        hardwareScanner.stopScan()
        this.isHardwareScanning = false
        this.$msg('⏹️ Hardware Scan Stopped')
      } else {
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
      // console.log('📋 Starting clipboard polling...')
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
              
              // console.log('📋 Clipboard detected:', clipboardText)
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
        // console.log('📋 Clipboard polling stopped')
      }
    },
    /**
     * Handle scanner input blur event
     */
    onScannerBlur() {
      // console.log('⚠️ Scanner input lost focus, re-focusing...')
      // Re-focus immediately by toggling the focus flag
      if (this.isHardwareScanning) {
        this.scannerInputFocus = false
        this.$nextTick(() => {
          this.scannerInputFocus = true
          // console.log('✅ Scanner input re-focused')
        })
      }
    },
    /**
     * Handle scanner input changes (keyboard wedge mode)
     */
    onScannerInput() {
      // console.log('⌨️ Scanner input:', this.scannerBuffer)
      
      // Clear existing timeout
      if (this.scannerTimeout) {
        clearTimeout(this.scannerTimeout)
      }
      
      // Wait 200ms after last keystroke to process (scanner types very fast)
      this.scannerTimeout = setTimeout(() => {
        if (this.scannerBuffer && this.scannerBuffer.length > 0) {
          // console.log('✅ Barcode complete:', this.scannerBuffer)
          this.onHardwareScanResult(this.scannerBuffer, 'keyboard')
          
          // Clear buffer and re-focus for next scan
          this.scannerBuffer = ''
          
          // Re-focus input immediately for continuous scanning
          this.$nextTick(() => {
            this.scannerInputFocus = false
            this.$nextTick(() => {
              this.scannerInputFocus = true
              // console.log('🔄 Ready for next scan')
            })
          })
        }
      }, 200)
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
     * Clear all scanned tags
     */
    onClear() {
      this.clear()
      this.$msg('🧹 Cleared all tags')
    },
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
    async confirmStockIn() {
      // Validate receiving is selected
      if (!this.stockInForm.receivingId) {
        uni.showModal({
          title: '⚠️ No Receiving Selected',
          content: 'Please select a receiving before stock-in.',
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
          content: 'Please scan EPCs that are registered in the system.\n\nScanned EPCs must have matching SKU codes.',
          showCancel: false
        })
        return
      }

      // Confirm before updating
      const confirmed = await new Promise((resolve) => {
        uni.showModal({
          title: '📦 Confirm Stock In',
          content: `Stock in ${epcCodes.length} EPC(s) to receiving ${this.stockInForm.receivingCode}?`,
          success: (res) => resolve(res.confirm)
        })
      })

      if (!confirmed) return

      this.ctrl.isLoading = true
      this.ctrl.loadingTxt = `Processing ${epcCodes.length} EPC(s)...`

      // Process each EPC through stock-in-scan endpoint for validation
      let successCount = 0
      let failedEpcs = []

      for (const epcCode of epcCodes) {
        try {
          const stockInData = {
            epcCode: epcCode,
            receivingId: this.stockInForm.receivingId,
            warehouseId: this.stockInForm.warehouseId,
            locationId: this.stockInForm.locationId,  // Use locationId instead of deprecated rack/section
            stockInBy: this.stockInForm.receivedBy || 'Operator'
          }
          
          console.log('Stock-in data:', stockInData)
          
          const res = await this.$api.stockInScan(stockInData)
          
          if (res.success) {
            successCount++
          } else {
            failedEpcs.push({ epcCode, error: res.msg || 'Unknown error' })
          }
        } catch (err) {
          console.error(`Stock-in failed for ${epcCode}:`, err)
          const errorMsg = err.data?.message || err.message || 'Unknown error'
          failedEpcs.push({ epcCode, error: errorMsg })
        }
      }

      this.ctrl.isLoading = false

      // Show results
      if (failedEpcs.length === 0) {
        // All successful
        uni.showModal({
          title: '✅ Stock In Success',
          content: `Successfully stocked in ${successCount} EPC(s).\n\nStatus updated to INBOUND.`,
          showCancel: false,
          success: () => {
            // Clear scanned tags and refresh
            this.clear()
          }
        })
      } else if (successCount === 0) {
        // All failed
        const errorDetails = failedEpcs.slice(0, 3).map(f => `• ${f.epcCode}: ${f.error}`).join('\n')
        const moreText = failedEpcs.length > 3 ? `\n...and ${failedEpcs.length - 3} more` : ''
        
        uni.showModal({
          title: '❌ Stock In Failed',
          content: `All ${failedEpcs.length} EPC(s) failed:\n\n${errorDetails}${moreText}`,
          showCancel: false
        })
      } else {
        // Partial success
        const errorDetails = failedEpcs.slice(0, 3).map(f => `• ${f.epcCode}: ${f.error}`).join('\n')
        const moreText = failedEpcs.length > 3 ? `\n...and ${failedEpcs.length - 3} more` : ''
        
        uni.showModal({
          title: '⚠️ Partial Success',
          content: `✅ ${successCount} succeeded\n❌ ${failedEpcs.length} failed:\n\n${errorDetails}${moreText}`,
          showCancel: false,
          success: () => {
            // Clear scanned tags and refresh
            this.clear()
          }
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
    font-size: 11px !important;
    padding: 14px 6px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.u-button__text) {
    font-size: 11px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  :deep(.u-button--success) {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
  }

  :deep(.u-button--error) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
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
  