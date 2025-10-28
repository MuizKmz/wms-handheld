<template>
  <!-- Header Component -->
  <HeaderComponent :showBack="true" :showLogOut="true" :showNotification="true" pageTitle="Loan"/>

  <div class="image-wrapper">
    <div class="image-container">
      <image alt="Search" src="/static/loan.png"/>
    </div>
  </div>

  <view class="page">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-label">Search :</div>
      <input
          v-model="searchQuery"
          class="search-input"
          placeholder="Product Name / SKU Code "
          type="text"
      />
      <button class="search-button" @click="performSearch">SEARCH</button>
    </div>

    <!-- Details Section -->
    <scroll-view class="scroll-container" scroll-y="true">
      <div class="results-table">
        <table>
          <thead>
          <tr>
            <th>Loan ID</th>
            <th>Product Name</th>
            <th>SKU Code</th>
            <th>Borrower</th>
            <th>Loan Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in filteredResults" :key="index">
            <td>{{ item.loanID }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ item.sku }}</td>
            <td>{{ item.borrower }}</td>
            <td>{{ item.loanDate }}</td>
            <td>{{ item.returnDate }}</td>
            <td :class="item.status.toLowerCase()">{{ item.status }}</td>
          </tr>
          <tr v-if="filteredResults.length === 0">
            <td class="no-data" colspan="7">No matching loans found</td>
          </tr>
          </tbody>
        </table>
      </div>
    </scroll-view>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="new-loan-btn" @click="goToNewLoan">NEW LOAN</button>
      <button class="return-btn">RETURN</button>
    </div>

  </view>
  <!-- Sticky Footer -->
  <div class="floating-footer">
    <FooterComponent/>
  </div>
</template>

<script>
import HeaderComponent from '@/views/components/Header.vue'
import FooterComponent from '@/views/components/Footer.vue'

const mockLoans = [
  {
    loanID: 'LP001',
    productName: 'Power Drill',
    sku: 'SN-12345',
    borrower: 'John Doe',
    loanDate: '2025-02-20',
    returnDate: '2025-03-01',
    status: 'Active'
  },
  {
    loanID: 'LP002',
    productName: 'Welding Torch',
    sku: 'SN-67890',
    borrower: 'Jane Smith',
    loanDate: '2025-02-18',
    returnDate: '2025-02-28',
    status: 'Overdue'
  },
  {
    loanID: 'LP003',
    productName: 'Safety Helmet',
    sku: 'SN-24680',
    borrower: 'Alex Wong',
    loanDate: '2025-02-25',
    returnDate: '2025-03-05',
    status: 'Active'
  },
  {
    loanID: 'LP004',
    productName: 'Work Gloves',
    sku: 'SN-13579',
    borrower: 'Lisa Tan',
    loanDate: '2025-02-15',
    returnDate: '2025-02-25',
    status: 'Returned'
  },
  {
    loanID: 'LP005',
    productName: 'Power Drill',
    sku: 'SN-12345',
    borrower: 'John Doe',
    loanDate: '2025-02-20',
    returnDate: '2025-03-01',
    status: 'Active'
  },
  {
    loanID: 'LP006',
    productName: 'Welding Torch',
    sku: 'SN-67890',
    borrower: 'Jane Smith',
    loanDate: '2025-02-18',
    returnDate: '2025-02-28',
    status: 'Overdue'
  },
  {
    loanID: 'LP007',
    productName: 'Safety Helmet',
    sku: 'SN-24680',
    borrower: 'Alex Wong',
    loanDate: '2025-02-25',
    returnDate: '2025-03-05',
    status: 'Active'
  },
  {
    loanID: 'LP008',
    productName: 'Power Drill',
    sku: 'SN-12345',
    borrower: 'John Doe',
    loanDate: '2025-02-20',
    returnDate: '2025-03-01',
    status: 'Active'
  },
  {
    loanID: 'LP009',
    productName: 'Welding Torch',
    sku: 'SN-67890',
    borrower: 'Jane Smith',
    loanDate: '2025-02-18',
    returnDate: '2025-02-28',
    status: 'Overdue'
  },
  {
    loanID: 'LP010',
    productName: 'Safety Helmet',
    sku: 'SN-24680',
    borrower: 'Alex Wong',
    loanDate: '2025-02-25',
    returnDate: '2025-03-05',
    status: 'Active'
  },
  {
    loanID: 'LP011',
    productName: 'Work Gloves',
    sku: 'SN-13579',
    borrower: 'Lisa Tan',
    loanDate: '2025-02-15',
    returnDate: '2025-02-25',
    status: 'Returned'
  },
  {
    loanID: 'LP012',
    productName: 'Power Drill',
    sku: 'SN-12345',
    borrower: 'John Doe',
    loanDate: '2025-02-20',
    returnDate: '2025-03-01',
    status: 'Active'
  }
]

export default {
  components: {
    HeaderComponent,
    FooterComponent
  },
  data() {
    return {
      searchQuery: '',
      loans: [...mockLoans], // Initialize with mock data
      filteredResults: [...mockLoans] // Initialize with all loans
    }
  },
  methods: {
    performSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredResults = [...this.loans]
        return
      }

      const query = this.searchQuery.toLowerCase()
      this.filteredResults = this.loans.filter(loan =>
          loan.productName.toLowerCase().includes(query) ||
          loan.sku.toLowerCase().includes(query)
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
  min-height: 100vh;
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
  width: 70% !important; /* Set button width to 70% */
  min-width: 100px; /* Optional: Ensures it doesn't get too small */
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

th, td {
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

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 2px;
}

.new-loan-btn, .return-btn {
  flex: 1;
  padding: 0px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.new-loan-btn {
  background-color: #2196F3;
  color: white;
  font-size: 14px;
  border-radius: 999px;
}

.return-btn {
  background-color: #FF9800;
  color: white;
  font-size: 14px;
  border-radius: 999px;
}

@media (max-width: 600px) {
  th, td {
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

.floating-footer {
  width: 100%;
  padding: 10px 0;
  position: relative;
  bottom: 0;
  left: 0;
}

</style>