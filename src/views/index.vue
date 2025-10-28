<template>
  <!-- Header Component -->
  <HeaderComponent :showLogOut="true" :showNotification="true" pageTitle="Main Dashboard" titleAlign="left"/>
  <div class="dashboard">
    <!-- User Info Section -->
    <section class="user-info">
      <div class="user-avatar">
        <span>👤</span>
      </div>
      <div class="user-details">
        <p><strong>Name:</strong> {{ userInfo.realname }}</p>
        <p><strong>Staff ID:</strong> {{ userInfo.id }}</p>
        <p><strong>Department:</strong> Inventory</p>
      </div>
      <!--      <button class="edit-btn">✏️</button>-->
    </section>

    <!-- Stock Management Section -->
    <section class="stock-management">
      <h2 class="section-title">Stock Management</h2>
      <div class="module-grid">
        <div v-if="$hasPermission('handheld:search')" class="module" @click="goToSearch">
          <div class="module-icon">
            <image alt="Search" src="/static/search.png"/>
          </div>
          <p class="module-label">Search Product</p>
        </div>
        <div v-if="$hasPermission('handheld:receiving')" class="module" @click="gotToReceiving">
          <div class="module-icon">
            <image alt="Stock In Icon" src="/static/receiving.png"/>
          </div>
          <p class="module-label">Receiving</p>
        </div>
        <div v-if="$hasPermission('handheld:stock-in:epc')" class="module" @click="gotToStockIn(1,1)">
          <div class="module-icon">
            <image alt="Stock In Icon" src="/static/stock-in.png"/>
          </div>
          <p class="module-label">Stock In(EPC)</p>
        </div>
        <div v-if="$hasPermission('handheld:stock-in:tid')" class="module" @click="gotToStockIn(2,1)">
          <div class="module-icon">
            <image alt="Stock In Icon" src="/static/stock-in.png"/>
          </div>
          <p class="module-label">Stock In(TID)</p>
        </div>
        <div v-if="$hasPermission('handheld:stock-out')" class="module" @click="goToStockOut">
          <div class="module-icon">
            <image alt="Stock Out" src="/static/stock-out.png"/>
          </div>
          <p class="module-label">Stock Out</p>
        </div>
        <div v-if="$hasPermission('handheld:stock-take')" class="module" @click="goToStockTake">
          <div class="module-icon">
            <image alt="Stock Take" src="/static/stock-take.png"/>
          </div>
          <p class="module-label">Stock Take</p>
        </div>
        <div v-if="$hasPermission('handheld:stock-return')" class="module" @click="goToReturn()">
          <div class="module-icon">
            <image alt="Return" src="/static/return.png"/>
          </div>
          <p class="module-label">Return</p>
        </div>
        <template v-if="false">
          <div class="module" @click="goToLoan">
            <div class="module-icon">
              <image alt="Loan" src="/static/loan.png"/>
            </div>
            <p class="module-label">Loan</p>
          </div>
          <div class="module" @click="goToReturn">
            <div class="module-icon">
              <image alt="Return" src="/static/return.png"/>
            </div>
            <p class="module-label">Return</p>
          </div>
        </template>
      </div>
    </section>

    <FooterComponent/>
  </div>
</template>

<script>
import {mapActions, mapState, mapWritableState} from 'pinia'
import {useUserStore} from '@/store/user'
import {useStockStore} from '@/store/stock'
import {useReceivingStore} from '@/store/receiving'
import HeaderComponent from '@/views/components/Header.vue'
import FooterComponent from '@/views/components/Footer.vue'

export default {
  name: 'index-page',
  components: {
    HeaderComponent,
    FooterComponent
  },
  computed: {
    ...mapState(useUserStore, {userInfo: 'info'}),
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      ctrl: 'ctrl',
    }),
  },
  async onShow() {
    await this.getUserInfoAction()
  },
  methods: {
    ...mapActions(useReceivingStore, {
      resetReceivingFormAction: 'resetReceivingFormAction',
    }),
    ...mapActions(useUserStore, ['getUserInfoAction']),
    goToSearch() {
      uni.navigateTo({
        url: '/views/search/index'
      })
    },
    gotToReceiving() {
      this.resetReceivingFormAction()
      uni.navigateTo({
        url: '/views/receiving/rongmah/index'
      })
    },
    gotToStockIn(tagFlow, inboundType) {
      this.stockInForm.tagFlow = tagFlow
      this.stockInForm.inboundType = inboundType
      this.ctrl.isLoading = true
      this.ctrl.isLoading = 'Loading...'
      uni.navigateTo({
        url: '/views/stock-in/index'
      })
    },
    goToStockOut() {
      this.ctrl.isLoading = true
      this.ctrl.isLoading = 'Loading...'
      uni.navigateTo({
        url: '/views/stock-out/index'
      })
    },
    goToStockTake() {
      this.ctrl.isLoading = true
      this.ctrl.isLoading = 'Loading...'
      uni.navigateTo({
        url: '/views/stock-take/index'
      })
    },
    goToLoan() {
      uni.navigateTo({
        url: '/views/loan/index'
      })
    },
    goToReturn() {
      this.stockInForm.tagFlow = 1
      this.stockInForm.inboundType = 3
      uni.navigateTo({
        url: '/views/stock-return/index'
      })
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/views/public/login'
        })
      }
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.dashboard {
  background-color: #1f1f1f;
  color: white;
  min-height: 90vh;
  font-family: 'Segoe UI', Arial, sans-serif;
  padding-bottom: 60px;
  box-sizing: border-box;
}

/* Back Button */
.back-btn {
  background: #f5e1c1;
  color: #1f1f1f;
  border: none;
  padding: 8px 15px;
  margin: 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* User Info Section */
.user-info {
  background: #f5e1c1;
  color: #1f1f1f;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  margin: 30px 15px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar span {
  font-size: 36px;
  margin-right: 15px;
}

.user-details {
  flex: 1;
  text-align: left;
}

.user-details p {
  margin: 6px 0;
  font-size: 14px;
}

.edit-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #1f1f1f;
  margin-left: 10px;
}

/* Stock Management Section */
.section-title {
  text-align: center;
  margin: 20px 15px 15px;
  color: #f5e1c1;
  font-size: 18px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 0 15px;
  max-width: 500px;
  margin: 0 auto;
}

.module {
  background: #f5e1c1;
  padding: 20px 10px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.module:active {
  transform: scale(0.98);
}

.module-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-icon image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.module-label {
  font-weight: 600;
  margin: 0;
  color: #1f1f1f;
  font-size: 14px;
}

/* Responsive Adjustments */
@media (min-width: 768px) {
  .module-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 800px;
  }

  .user-details p {
    font-size: 16px;
  }

  .module-label {
    font-size: 16px;
  }
}

/* Footer will be fixed at bottom on mobile */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>