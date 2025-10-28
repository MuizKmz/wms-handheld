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
      <view class="form-section">
        <view class="clear-btn" @click="toReceivingList">
          Receiving list
          <!--          <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="trash-fill" shape="circle" size="mini"-->
          <!--                     text="" type="info"-->
          <!--                     @click="onCancel"></up-button>-->
        </view>
        <stock-purpose-picker ref="stockInPurpose"/>
        <input-do-order ref="doNumber" :type="0"/>
        <receiving-code-input ref="receivingCode"/>
        <supplier-list-picker ref="supplierCode"/>
        <warehouse-rack-picker ref="warehouseRackSection"/>
        <group-attribute-list ref="groupAttributeList" @onChange="onAttributeChange"/>
        <input-remark/>
      </view>
      <!-- Products Table -->
      <product-list-card/>

    </scroll-view>

    <receiving-ctrl @onSave="onSubmit"/>
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
import {mapWritableState} from 'pinia'
import WarehouseRackPicker from '../components/picker-warehouse-rack.vue'
import ReceivingCodeInput from '../components/input-receiving-code.vue'
import SupplierListPicker from '../components/picker-supplier-list.vue'
import StockPurposePicker from '../components/picker-stock-purpose.vue'
import GroupAttributeList from '../components/group-attribute-list.vue'
import InputDoOrder from '../components/input-do-order.vue'
import InputRemark from '../components/input-remarks.vue'
import ProductListCard from './components/card-product-list.vue'
import ReceivingCtrl from '../components/ctrl-receiving.vue'

import ReceivingImg from '@/static/receiving.png'
import dayjs from 'dayjs'

export default {
  name: 'Stock-in',
  components: {
    GroupAttributeList,
    HeaderComponent,
    FooterComponent,
    WarehouseRackPicker,
    ReceivingCodeInput,
    SupplierListPicker,
    StockPurposePicker,
    InputDoOrder,
    InputRemark,
    ProductListCard,
    ReceivingCtrl
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
      return 'New Receiving'
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

    setTimeout(() => {
      uni.$emit('onShow')
    }, 500)
    // let pageWidth = uni.getSystemInfoSync().windowWidth
    // let pageHeight = uni.getSystemInfoSync().windowHeight
    // console.log(pageWidth, pageHeight)
  },
  methods: {
    async toReceivingList() {
      this.$router.push('/views/receiving/rongmah/list')
    },
    async onAttributeChange(submitAttributes) {
      // this.attributeValues = submitAttributes
      // console.log(this.$refs['groupAttributeList'])
      // setTimeout(async () => {
      //
      // }, 1500)
      // this.$nextTick(async () => {
      //   await this.$refs['groupAttributeList'].validate()
      //   await this.$refs['stockInPurpose'].validate()
      //   await this.$refs['supplierCode'].validate()
      //
      // })

      // this.$refs['groupAttributeList'].validate()
      // console.log(submitAttributes)
    },
    async onSubmit() {
      if (await this.validateAll()) {
        let receivingForm = {...this.receivingForm}
        delete receivingForm.rackCode
        delete receivingForm.warehouseCode
        delete receivingForm.stockPurposeCode
        delete receivingForm.stockPurposeName
        delete receivingForm.supplierCode
        delete receivingForm.supplierName
        receivingForm.dateReceived = dayjs(new Date().getTime()).format('YYYY-MM-DD HH:mm:ss')

        let attributeValues = []
        this.attributeValues.forEach((item) => {
          let value = item.value
          if (item.elComponent === 'el-date-picker') {
            value = dayjs(value).format('YYYY-MM-DD')
          }
          attributeValues.push({
            targetId: item.targetId,
            attributeId: item.attributeId,
            value: value
          })
        })
        receivingForm.attributeValues = attributeValues

        let products = []
        this.receivingProducts.forEach((product) => {
          products.push({
            productId: product.id,
            expectedQuantity: product.expectedQuantity,
          })
        })
        receivingForm.products = products

        let res = await this.$api.saveReceiving(receivingForm)
        if (res.success) {
          uni.showToast({
            title: 'Receiving saved successfully',
            icon: 'success'
          })
          this.$router.push('/views/receiving/list')
        } else {
          uni.showToast({
            title: res.message || 'Failed to save receiving',
            icon: 'none'
          })
        }
      }
    },

    async validateAll() {
      let validateStockInPurpose = await this.$refs['stockInPurpose'].validate()
      let validateDoNumber = await this.$refs['doNumber'].validate()
      let validateReceivingCode = await this.$refs['receivingCode'].validate()
      let validateSupplierCode = await this.$refs['supplierCode'].validate()
      let validateGroupAttributelist = await this.$refs['groupAttributeList'].validate()
      let validateReceivingProducts = this.receivingProducts.length > 0
      if (!validateReceivingProducts) {
        uni.showToast({
          title: 'Please add at least one product',
          icon: 'none'
        })
      }

      return validateStockInPurpose && validateDoNumber && validateReceivingCode && validateSupplierCode && validateGroupAttributelist && validateReceivingProducts
    }

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