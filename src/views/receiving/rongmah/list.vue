<template>
  <!-- Header Component -->
  <HeaderComponent :pageTitle="pageTitle" :showBack="true" :showLogOut="true" :showNotification="true"/>

  <div class="image-wrapper">
    <div class="image-container">
      <image :src="topImg" alt="Receiving"/>
    </div>
  </div>

  <view v-if="!ctrl.isLoading" class="page">
    <!-- Details Section -->
    <scroll-view class="scroll-container" scroll-y="true">
      <!-- Products Table -->
      <receiving-list-card/>
    </scroll-view>

    <!-- Sticky Footer -->
    <view v-if="false" id="bottom" class="floating-footer">
      <FooterComponent/>
    </view>
  </view>
  <up-loading-page :loading="ctrl.isLoading" :loading-text="ctrl.loadingTxt" bg-color="#f5e1c1" color="#666"
                   font-size="16"
                   icon-size="36"></up-loading-page>
</template>

<script>
import {useReceivingStore} from '@/store/receiving'
import FooterComponent from '@/views/components/Footer.vue'
import HeaderComponent from '@/views/components/Header.vue'
import {mapActions, mapWritableState} from 'pinia'
import ReceivingListCard from './components/card-receiving-list.vue'

import ReceivingImg from '@/static/receiving.png'

export default {
  name: 'ReceivingList',
  components: {
    HeaderComponent,
    FooterComponent,
    ReceivingListCard,
  },
  data() {
    return {
      // 1:EPC 2:TID
      tagFlow: '1'
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
      attributeValues: 'attributeValues',
      receivingProducts: 'receivingProducts',
      ctrl: 'ctrl'
    }),
    pageTitle() {
      return 'Receiving List'
    },
    topImg() {
      return ReceivingImg
    },
  },
  watch: {},
  async onLoad(options) {
    setTimeout(() => {
      // #ifdef APP-PLUS
      this.initDevice()
      // #endif
      this.ctrl.isLoading = false
    }, 1500)

  },
  onUnload() {
    // #ifdef APP-PLUS
    this.stopInventory()
    // #endif
    clearInterval(this.ctrl.queryInterval)
  },
  onShow() {
    this.getReceivingPage({
      page: 1,
      limit: 1000
    })
    setTimeout(() => {
      uni.$emit('onShow')
    }, 500)
    // let pageWidth = uni.getSystemInfoSync().windowWidth
    // let pageHeight = uni.getSystemInfoSync().windowHeight
    // console.log(pageWidth, pageHeight)
  },
  methods: {
    ...mapActions(useReceivingStore, {getReceivingPage: 'getReceivingPageAction'}),


  }
}
</script>

<style lang="scss" scoped>
.image-wrapper {
  width: 100vw;
  /* Full width */
  height: 80px;
  /* Height relative to viewport */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5e1c1;
  border-radius: 0px 0px 20px 20px;
  //margin-top: 20px;
  /* Background color */
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
    margin-top: 18px;
  }

  .image-container image {
    width: 30px;
    /* Fixed width for the image */
    height: 30px;
    /* Fixed height for the image */
    max-width: 100%;
    /* Ensure it doesn't overflow */
    max-height: 100%;
    /* Keep it within the container */
    object-fit: contain;
    /* Prevents stretching */
  }
}

.page {
  padding: 10px;
  display: flex;
  flex-direction: column;
  //height: 100vh;
  box-sizing: border-box;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 130px;
}

.form-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px 12px 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .clear-btn {
    position: absolute;
    color: #3C9CFF;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: 22px;
    top: 6px;
    right: 12px
  }

  .form-item {
    margin-bottom: 8px;

    .label {
      font-weight: 600;
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .input-field,
    .select-field {
      background-color: #f5f5f5;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 12px;

      ::v-deep .input-right-icon {
        margin-right: 4px !important;
      }
    }
  }


  .location-fields {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    //gap: 10px;

    .location-item {
      width: calc(50% - 5px);

      &:last-child {
        width: 100%;
      }
    }
  }
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