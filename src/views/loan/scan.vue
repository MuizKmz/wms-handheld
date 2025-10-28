<template>
  <!-- Header Component -->
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="true" pageTitle="Loan"/>

  <div class="image-wrapper">
    <div class="image-container">
      <image alt="Search" src="/static/loan.png"/>
    </div>
  </div>

  <view class="scanner-container">

    <view class="scan-options">
      <button class="scan-option" type="default" @click="simulateScan('RFID')">
        <view class="icon">📡</view>
        <view>RFID</view>
      </button>

      <button class="scan-option" type="default" @click="simulateScan('QR')">
        <view class="icon">🔳</view>
        <view>QR</view>
      </button>

      <button class="scan-option" type="default" @click="simulateScan('Barcode')">
        <view class="icon">📊</view>
        <view>Barcode</view>
      </button>
    </view>

    <view v-if="isScanning" class="camera-preview">
      <view class="camera-mock">
        <view class="scan-animation"></view>
        <view class="scan-line"></view>
      </view>
    </view>

    <view v-if="scanResult" class="scan-result">
      <text class="result-title">Scan Successful!</text>
      <text class="result-text">Type: {{ scanResult.type }}</text>
      <text class="result-text">Data: {{ scanResult.data }}</text>
      <image :src="scanResult.image" class="scanned-image" mode="aspectFit"></image>
    </view>

    <button :disabled="!scanResult" class="confirm-button" type="primary" @click="confirmScan">
      CONFIRM
    </button>
  </view>

  <!-- Sticky Footer -->
  <div class="floating-footer">
    <FooterComponent/>
  </div>
</template>

<script>
import HeaderComponent from '@/views/components/Header.vue'
import FooterComponent from '@/views/components/Footer.vue'

export default {
  components: {
    HeaderComponent,
    FooterComponent
  },
  data() {
    return {
      isScanning: false,
      scanResult: null,
      mockProducts: [
        {type: 'RFID', data: 'EPC123456789', image: this.generateMockImage('RFID')},
        {type: 'QR', data: 'PROD-001-ABC', image: this.generateMockImage('QR')},
        {type: 'Barcode', data: 'SN-987654321', image: this.generateMockImage('Barcode')}
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    simulateScan(type) {
      this.isScanning = true
      this.scanResult = null

      // Mock scanning process
      setTimeout(() => {
        this.isScanning = false

        // Find a mock product of the selected type
        const product = this.mockProducts.find(p => p.type === type)
        if (product) {
          this.scanResult = {
            type: product.type,
            data: product.data,
            image: product.image
          }
        }
      }, 2000)
    },
    generateMockImage(type) {
      // In a real app, this would use the device camera
      // For demo, we'll generate a colored box with text
      const colors = {
        RFID: '#3F51B5',
        QR: '#009688',
        Barcode: '#795548'
      }

      // This is a simplified mock - in a real app you'd use actual images
      return `data:image/svg+xml;base64,${btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
            <rect width="100%" height="100%" fill="${colors[type] || '#607D8B'}"/>
            <text x="50%" y="50%" fill="white" font-family="Arial" font-size="20" text-anchor="middle" dominant-baseline="middle">${type}</text>
          </svg>
        `)}`
    },
    confirmScan() {
      if (!this.scanResult) return

      // Try to send data back via event channel
      const eventChannel = this.getOpenerEventChannel()
      if (eventChannel) {
        eventChannel.emit('acceptScanData', this.scanResult)
        uni.navigateBack()
        return
      }

      // Fallback to global storage
      uni.setStorageSync('lastScan', this.scanResult)
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.image-wrapper {
  width: 100vw;
  /* Full width */
  height: 20vh;
  /* Height relative to viewport */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5e1c1;
  border-radius: 0px 0px 20px 20px;
  /* Background color */
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(181, 180, 180);
  /* White background */
  border-radius: 12px;
  /* Rounded corners */
  padding: 10px;
  /* Padding for spacing */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* Optional shadow */
  max-width: 120px;
  /* Limit container width */
  max-height: 120px;
  /* Limit container height */
}

.image-container image {
  width: 80px;
  /* Fixed width for the image */
  height: 80px;
  /* Fixed height for the image */
  max-width: 100%;
  /* Ensure it doesn't overflow */
  max-height: 100%;
  /* Keep it within the container */
  object-fit: contain;
  /* Prevents stretching */
}

.scanner-container {
  font-family: 'Segoe UI', Arial, sans-serif;
}

.scan-options {
  display: flex;
  justify-content: space-around;
  margin: 10px 0;
}

.scan-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
  padding: 5px 0;
  background: white;
  border-radius: 8px;
}

.scan-option .icon {
  font-size: 30px;
  margin-bottom: 5px;
}

.camera-preview {
  width: 100%;
  height: 300px;
  background: #333;
  border-radius: 10px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
}

.camera-mock {
  width: 100%;
  height: 100%;
  position: relative;
}

.scan-animation {
  position: absolute;
  width: 80%;
  height: 2px;
  background: rgba(76, 175, 80, 0.7);
  top: 50%;
  left: 10%;
  animation: scan 2s linear infinite;
}

.scan-line {
  position: absolute;
  width: 80%;
  height: 100px;
  border: 2px solid rgba(76, 175, 80, 0.5);
  border-radius: 5px;
  top: calc(50% - 50px);
  left: 10%;
}

@keyframes scan {
  0% {
    top: 10%;
  }

  100% {
    top: 90%;
  }
}

.scan-result {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: center;
}

.result-title {
  color: #4CAF50;
  font-weight: bold;
  display: block;
  margin-bottom: 10px;
}

.result-text {
  display: block;
  margin-bottom: 5px;
}

.scanned-image {
  width: 200px;
  height: 200px;
  margin-top: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.confirm-button {
  margin: 20px;
  background-color: #4CAF50;
  color: white;
  border-radius: 999px;
}

.confirmbutton:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.floating-footer {
  width: 100%;
  padding: 10px 0;
  position: relative;
  bottom: 0;
  left: 0;
}
</style>