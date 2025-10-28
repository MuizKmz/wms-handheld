<template>
  <!-- Header Component -->
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="true" pageTitle="Return"/>


  <div class="image-wrapper">
    <div class="image-container">
      <image alt="Search" src="/static/return.png"/>
    </div>
  </div>

  <view class="page">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-label">Search :</div>
      <input v-model="searchQuery" class="search-input" placeholder="Product Name / SKU Code "
             type="text"/>
      <button class="search-button" @click="performSearch">SEARCH</button>
    </div>

    <!-- Details Section -->
    <scroll-view class="scroll-container" scroll-y="true">
      <div class="results-table">
        <table>
          <thead>
          <tr>
            <th>Return ID</th>
            <th>Product Name</th>
            <th>SKU Code</th>
            <th>Quantity</th>
            <th>Reason</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in filteredResults" :key="index">
            <td>{{ item.returnID }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ item.sku }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.reason }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </scroll-view>

    <!-- Action Section -->
    <view class="action-section">
      <!-- First Row: Scan & Clean Buttons (3-Column Layout) -->
      <up-row class="action-buttons" gutter="10" justify="center">
        <up-col span="4">
          <up-button shape="circle" size="mini" type="warning" @click="toggleScan">
            <span class="green-dot"></span> SCAN
          </up-button>
        </up-col>
        <up-col span="4">
          <up-button shape="circle" size="mini" type="error" @click="clearScan">🗑️ CLEAN</up-button>
        </up-col>
      </up-row>

      <!-- Second Row: Quantity & Reason Fields (2-Column Layout) -->
      <up-row class="action-buttons" gutter="10" justify="center">
        <up-col span="4">
          <label>Quantity:</label>
        </up-col>
        <up-col span="8">
          <up-button block shape="circle" size="mini" type="primary">
            AUTO CALCULATE
          </up-button>
        </up-col>
      </up-row>

      <up-row class="action-buttons" gutter="10" justify="center">
        <up-col span="4">
          <label>Reason:</label>
        </up-col>
        <up-col span="8">
          <up-button block shape="circle" size="mini" type="primary">RETURN REASON</up-button>
        </up-col>
      </up-row>

      <!-- Third Row: Confirm Button (Full Width) -->
      <up-row justify="center">
        <up-col span="12">
          <up-button block class="confirm-btn" type="success" @click="confirmScan">CONFIRM</up-button>
        </up-col>
      </up-row>
    </view>


    <div class="floating-footer">
      <FooterComponent/>
    </div>
  </view>
</template>

<script>
import HeaderComponent from '@/views/components/Header.vue'
import FooterComponent from '@/views/components/Footer.vue'

const mockReturn = [
  {returnID: 'LP001', productName: 'Power Drill', sku: 'SN-12345', quantity: '2', reason: 'Product Damage',},
  {returnID: 'LP002', productName: 'Welding Torch', sku: 'SN-67890', quantity: '5', reason: 'Wrong Item',},
  {returnID: 'LP003', productName: 'Safety Helmet', sku: 'SN-24680', quantity: '6', reason: 'Quality Issues',},

]
export default {
  components: {
    HeaderComponent,
    FooterComponent
  },
  data() {
    return {
      searchQuery: '',
      returns: [...mockReturn], // Initialize with mock data
      filteredResults: [...mockReturn] // Initialize with all loans
    }
  },
  methods: {
    performSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredResults = [...this.returns]
        return
      }

      const query = this.searchQuery.toLowerCase()
      this.filteredResults = this.returns.filter(item =>
              // item.returnID.toLowerCase().includes(query) ||
              item.productName.toLowerCase().includes(query) ||
              item.sku.toLowerCase().includes(query)
          // item.reason.toLowerCase().includes(query) ||
          // String(item.quantity).includes(query) // Convert quantity to string before searching
      )

    },
    goToNewLoan() {
      uni.navigateTo({
        url: '/views/loan-new'
      })
    },
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

.page {
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}

.search-section {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-label {
  font-weight: bold;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  max-width: 290px;
}

.search-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
  width: 70% !important;
  /* Set button width to 70% */
  min-width: 100px;
  /* Optional: Ensures it doesn't get too small */
  text-align: center;
}

.results-table {
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
  font-size: 12px;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.no-data {
  text-align: center;
  color: #777;
  padding: 20px;
}

.active {
  color: #4CAF50;
  font-weight: bold;
}

.overdue {
  color: #f44336;
  font-weight: bold;
}

.returned {
  color: #2196F3;
  font-weight: bold;
}

.new-loan-btn,
.return-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.new-loan-btn {
  background-color: #2196F3;
  color: white;
}

.return-btn {
  background-color: #FF9800;
  color: white;
}

@media (max-width: 600px) {

  th,
  td {
    padding: 8px 5px;
    font-size: 11px;
  }

  .search-section {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
    margin: 5px 0;
  }

  .search-button {
    width: 100%;
  }
}

.action-section {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: #f5e1c1;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6px;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-radius: 999px;
}

.confirm-btn {
  width: 70%;
  font-size: 14px;
  border-radius: 100px;
  min-width: 150px;
}

.floating-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 0;
  text-align: center;
  z-index: 1000;
}
</style>