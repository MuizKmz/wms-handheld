<template>
  <!-- Header Component -->
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="true" pageTitle="Loan"/>

  <div class="image-wrapper">
    <div class="image-container">
      <image alt="Search" src="/static/loan.png"/>
    </div>
  </div>

  <view class="new-loan-container">

    <div class="new-form-label">New Loan</div>

    <form class="loan-form" @submit.prevent="submitLoan">
      <view class="form-group">
        <text class="label">Loan ID:</text>
        <input v-model="loan.loanId" class="disabled-input" disabled type="text"/>
      </view>

      <view class="form-group">
        <text class="label">Product Name:</text>
        <picker :range="products" :value="productIndex" range-key="name" @change="updateSku">
          <view class="picker">{{ loan.productName || 'Select Product' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">SKU Code:</text>
        <input v-model="loan.sku" class="disabled-input" disabled type="text"/>
      </view>

      <view class="form-group">
        <text class="label">Borrower:</text>
        <input v-model="loan.borrower" placeholder="Enter borrower name" type="text"/>
      </view>

      <view class="form-group">
        <text class="label">Loan Date:</text>
        <picker mode="date" @change="bindDateChange('loanDate', $event)">
          <view class="picker">{{ loan.loanDate || 'Select loan date' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">Return Date:</text>
        <picker mode="date" @change="bindDateChange('returnDate', $event)">
          <view class="picker">{{ loan.returnDate || 'Select return date' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="label">Status:</text>
        <picker :range="statusOptions" :value="statusIndex" @change="bindPickerChange('status', $event)">
          <view class="picker">{{ loan.status }}</view>
        </picker>
      </view>

      <view class="scan-section">
        <button class="scan-button" type="default" @click="openScanner">
          SCAN PRODUCT
        </button>
        <image v-if="loan.scannedImage" :src="loan.scannedImage" class="scanned-preview" mode="aspectFit"></image>
      </view>

      <button class="submit-button" form-type="submit" type="primary">CONFIRM LOAN</button>
    </form>
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
      loan: {
        loanId: 'LN-' + Math.floor(1000 + Math.random() * 9000),
        productName: '',
        sku: '',
        borrower: '',
        loanDate: this.formatDate(new Date()),
        returnDate: '',
        status: 'Active',
        scannedData: null,
        scannedImage: null
      },
      products: [
        {name: 'Power Drill', sku: 'SN-12345'},
        {name: 'Welding Torch', sku: 'SN-67890'},
        {name: 'Safety Helmet', sku: 'SN-24680'},
        {name: 'Work Gloves', sku: 'SN-13579'}
      ],
      statusOptions: ['Active', 'Pending', 'Completed'],
      productIndex: 0,
      statusIndex: 0
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    bindDateChange(field, e) {
      this.loan[field] = e.detail.value
    },
    bindPickerChange(field, e) {
      const index = e.detail.value
      if (field === 'status') {
        this.statusIndex = index
        this.loan.status = this.statusOptions[index]
      }
    },
    updateSku(e) {
      this.productIndex = e.detail.value
      this.loan.productName = this.products[this.productIndex].name
      this.loan.sku = this.products[this.productIndex].sku
    },
    openScanner() {
      // Store current loan data temporarily
      uni.setStorageSync('currentLoan', this.loan)

      uni.navigateTo({
        url: '/views/loan-scan',
        success: () => {
          console.log('Navigated to scanner')
        }
      })
    },
    submitLoan() {
      // Create JSON payload
      const loanData = {
        ...this.loan,
        timestamp: new Date().toISOString()
      }

      // Mock API call
      console.log('Submitting loan:', JSON.stringify(loanData, null, 2))

      // Save to local storage (mock)
      const loans = uni.getStorageSync('loans') || []
      loans.push(loanData)
      uni.setStorageSync('loans', JSON.stringify(loans))

      // Show confirmation
      uni.showToast({
        title: 'Loan created successfully!',
        icon: 'success'
      })

      // Reset form
      this.resetForm()
    },
    resetForm() {
      this.loan = {
        loanId: 'LN-' + Math.floor(1000 + Math.random() * 9000),
        productName: '',
        sku: '',
        borrower: '',
        loanDate: this.formatDate(new Date()),
        returnDate: '',
        status: 'Active',
        scannedData: null,
        scannedImage: null
      }
      this.productIndex = 0
      this.statusIndex = 0
    }
  },
  onShow() {
    // Check for scanned data when returning from scanner
    const eventChannel = this.getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.on('acceptScanData', (data) => {
        this.loan.scannedData = data.data
        this.loan.scannedImage = data.image
      })
    }

    // Or check global data
    const scanData = uni.getStorageSync('lastScan')
    if (scanData) {
      this.loan.scannedData = scanData.data
      this.loan.scannedImage = scanData.image
      uni.removeStorageSync('lastScan')
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

.new-loan-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  margin: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Arial, sans-serif;
}

.new-form-label {
  font-weight: bold;
  text-align: center;
}

.loan-form {
  padding: 20px;
  border-radius: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

input,
.picker {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.disabled-input {
  background-color: #f5f5f5;
  color: #666;
}

.scan-section {
  margin: 10px 0;
  text-align: center;
}

.scan-button {
  background-color: #2196F3;
  color: white;
  margin-bottom: 10px;
  border-radius: 999px;
}

.scanned-preview {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
  border-radius: 999px;
}

.floating-footer {
  width: 100%;
  padding: 10px 0;
  position: relative;
  bottom: 0;
  left: 0;
}

</style>