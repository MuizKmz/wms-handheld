<template>
  <!-- Header Component -->
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="true" pageTitle="Stock Out"/>

  <div class="image-wrapper">
    <div class="image-container">
      <image alt="Search" src="/static/stock-out.png"/>
    </div>
  </div>

  <view class="details-container">
    <view class="header-info">
      <view class="header-row">
        <text class="header-label">DO/ORDER NO.:</text>
        <text class="header-value">{{ stockInData.doNumber || '-' }}</text>
      </view>
      <view class="header-row">
        <text class="header-label">DATE:</text>
        <text class="header-value">{{ formatDate(stockInData.date) }}</text>
      </view>
    </view>

    <scroll-view class="table-container" scroll-y="true">
      <view class="table-header">
        <text class="header-cell">SN</text>
        <text class="header-cell">EPC CODE</text>
        <text class="header-cell">RSIS</text>
        <text class="header-cell repeat-count">REPEAT COUNT</text>
      </view>

      <view v-for="(item, index) in stockInData.items" :key="index" class="table-row">
        <text class="table-cell">{{ index + 1 }}</text>
        <text class="table-cell epc">{{ item.epc || '-' }}</text>
        <text class="table-cell">{{ item.rssi || '-' }}</text>
        <text class="table-cell">{{ item.count || '-' }}</text>
      </view>
    </scroll-view>
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
      stockInData: null
    }
  },
  onLoad(options) {
    if (options.data) {
      this.stockInData = JSON.parse(decodeURIComponent(options.data))
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
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

.details-container {
  padding: 10px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.header-info {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
}

.header-row {
  display: flex;
  margin-bottom: 5px;
}

.header-label {
  font-weight: bold;
  width: 120px;
}

.header-value {
  flex: 1;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  border-radius: 5px;
}

.table-header {
  display: flex;
  background-color: #f0f0f0;
  padding: 8px 5px;
  border-bottom: 1px solid #ddd;
}

.table-row {
  display: flex;
  padding: 8px 5px;
  border-bottom: 1px solid #eee;
}

.header-cell, .table-cell {
  flex: 1;
  text-align: center;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 2px;
}

.header-cell {
  font-weight: bold;
}

.header-cell.repeat-count {
  white-space: normal;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.epc {
  font-family: monospace;
  word-break: break-all;
  white-space: normal;
}

.floating-footer {
  width: 100%;
  padding: 10px 0;
  position: relative;
  bottom: 0;
  left: 0;
}
</style>