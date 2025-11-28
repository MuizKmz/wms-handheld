<template>
  <view class="action-section">
    <up-row class="action-buttons" gutter="10" justify="center">
      <up-col span="3">
        <up-button 
          :disabled="!selectedOrder" 
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
          :disabled="!selectedOrder || isHardwareScanning" 
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
          :disabled="!canSubmit" 
          :throttleTime="1000" 
          icon="checkmark-circle" 
          shape="circle"
          size="small"
          text="Return"
          type="primary"
          @click="confirmStockReturn"></up-button>
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
  props: {},
  data() {
    return {
      isHardwareScanning: false,
      scannerBuffer: '',
      scannerInputFocus: false,
      scannerTimeout: null,
      clipboardCheckInterval: null,
      lastClipboardContent: ''
    }
  },
  watch: {
    deviceInventoryList: {
      handler(newVal) {
        if (newVal) {
          newVal.forEach(tag => {
            this.tagStore[tag.epc] = 1
            this.removeFromInquiredTags(tag.epc)
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
      ctrl: 'ctrl',
      stockReturnForm: 'stockReturnForm',
      scannedTags: 'scannedTags',
      inquiredTagCodes: 'inquiredTagCodes',
      tagStore: 'tagStore',
      selectedProduct: 'selectedProduct',
      selectedOrder: 'selectedOrder'
    }),
    hardwareScanText() {
      return this.isHardwareScanning ? 'Stop HW' : 'Start HW'
    },
    canSubmit() {
      // Can submit if:
      // 1. Return type selected
      // 2. Reference order selected
      // 3. At least 1 EPC scanned (partial return allowed)
      // 4. Reason provided
      // Note: selectedProduct is optional - can scan EPCs from any product in the order
      return this.stockReturnForm.returnType && 
             this.stockReturnForm.referenceNumber && 
             this.scannedTags.length > 0 &&
             this.stockReturnForm.reason
    }
  },
  async mounted() {
    // Initialize hardware scanner
    // #ifdef APP-PLUS
    const initResult = hardwareScanner.init()
    if (initResult.success) {
      console.log('✅ Hardware scanner ready')
    } else {
      console.warn('⚠️ Hardware scanner init failed:', initResult.message)
    }
    // #endif
  },
  beforeUnmount() {
    // Stop hardware scanning if active
    if (this.isHardwareScanning) {
      this.stopClipboardPolling()
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
    toggleHardwareScan() {
      // #ifdef APP-PLUS
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
      // #endif
      // #ifdef H5
      this.$msg('Hardware scanner not available in browser')
      // #endif
    },
    startClipboardPolling() {
      // #ifdef APP-PLUS
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
    stopClipboardPolling() {
      if (this.clipboardCheckInterval) {
        clearInterval(this.clipboardCheckInterval)
        this.clipboardCheckInterval = null
      }
    },
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
          let tagType
          if (res.scanType === 'QR_CODE') {
            tagType = 2
          } else {
            tagType = 3
          }
          
          // Show feedback
          this.$msg(`Scanned: ${res.result}`, 'center', 1500)
          
          // Add to tagStore
          this.tagStore[res.result] = tagType
          this.removeFromInquiredTags(res.result)
          
          // Query inventory
          await this.queryInventory()
          
          // Continue scanning
          setTimeout(() => {
            this.onScanCode()
          }, 500)
        }
      })
      // #endif
    },
    onClear() {
      this.clear()
      this.$msg('Form cleared')
    },
    async confirmStockReturn() {
      // Validate return type
      if (!this.stockReturnForm.returnType) {
        this.$msg('Please select return type')
        return
      }
      
      // Validate reference order
      if (!this.stockReturnForm.referenceNumber) {
        this.$msg('Please select SO/PO reference')
        return
      }
      
      // Validate scanned tags (at least 1 EPC required for partial return)
      if (this.scannedTags.length <= 0) {
        this.$msg('No EPCs scanned')
        return
      }
      
      // Validate reason
      if (!this.stockReturnForm.reason || this.stockReturnForm.reason.trim() === '') {
        this.$msg('Please enter return reason')
        return
      }

      // Transform scanned tags to returnItems format
      const returnItems = this.scannedTags.map(tag => ({
        productId: tag.productId,
        epcCode: tag.epcCode || tag.tagCode,
        quantity: 1, // Each EPC represents 1 item
        condition: tag.condition || 'GOOD',
        conditionNotes: this.stockReturnForm.notes || null
      }))

      // Build return payload
      const returnPayload = {
        returnType: this.stockReturnForm.returnType,
        orderId: this.stockReturnForm.orderId,
        receivingId: this.stockReturnForm.receivingId,
        customerId: this.stockReturnForm.customerId,
        supplierId: this.stockReturnForm.supplierId,
        requestedDate: new Date().toISOString(),
        requestedBy: this.stockReturnForm.requestedBy || 1,
        reason: this.stockReturnForm.reason,
        notes: this.stockReturnForm.notes,
        source: 'handheld',
        returnItems: returnItems
      }

      console.log('Creating return:', returnPayload)

      this.ctrl.isLoading = true
      this.ctrl.loadingTxt = 'Creating return...'
      
      let res
      try {
        res = await this.$api.createReturn(returnPayload)
      } catch (e) {
        console.error('Return creation error:', e)
        this.ctrl.isLoading = false
        this.$msg('Failed to create return')
        return
      }
      this.ctrl.isLoading = false
      
      if (res.success) {
        await this.reloadInventory()
        this.$msg('Return created successfully!')
        
        // Navigate back or clear form
        setTimeout(() => {
          uni.navigateBack()
        }, 2000)
      } else {
        this.$msg(res.msg || 'Return creation failed')
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
  