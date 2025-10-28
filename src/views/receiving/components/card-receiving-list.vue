<template>
  <view v-if="receivingList.length > 0" class="receiving-section">
    <view class="wms-flex-row wms-justify-center wms-items-center product-title">
      <up-text :bold="true" size="12" text=""></up-text>
    </view>
    <up-line></up-line>
    <up-row align="center" class="table-header" justify="start">
      <up-col align="center" justify="center" span="4" textAlign="center">
        <up-text align="left" class="header-text" line="3" text="Do No."></up-text>
      </up-col>
      <up-col align="center" justify="center" span="4" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Receiving No."></up-text>
      </up-col>
      <up-col align="center" justify="center" span="2" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Date"></up-text>
      </up-col>
      <up-col align="center" justify="center" span="2" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Supplier"></up-text>
      </up-col>
    </up-row>
    <up-line></up-line>
    <scroll-view class="table-content" scroll-y="true">
      <view v-for="(item, index) in receivingList" :key="index" class="table-row">
        <up-row align="center" justify="space-between">
          <up-col justify="center" span="4" textAlign="center">
            <up-text :text="getTableText(item.doNumber)" align="left" class="table-text" line="3"></up-text>
          </up-col>
          <!--          <up-col justify="center" span="3" textAlign="center">-->
          <!--            <up-text :text="getTableText(item.code)" align="center" class="table-text" line="3"></up-text>-->
          <!--          </up-col>-->
          <up-col justify="center" span="4" textAlign="center">
            <up-text :text="getTableText(item.code)" align="center" class="table-text" color="#3C9CFF"
                     decoration="underline"
                     line="3" @click="toReceivingDetail(item)"></up-text>
          </up-col>
          <up-col class="wms-flex-row wms-justify-center wms-items-center" justify="center" span="2">
            <up-text :text="getTableText(item.createTimeTxt)" align="center" class="table-text" line="3"></up-text>
          </up-col>
          <up-col justify="center" span="2" textAlign="center">
            <up-text :text="getTableText(item.supplierName)" align="center" class="table-text"></up-text>
          </up-col>
        </up-row>
      </view>
    </scroll-view>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'
import dayjs from 'dayjs'

export default {
  props: {},
  watch: {},
  data() {
    return {}
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
      receivingPage: 'receivingPage',
      receivingProducts: 'receivingProducts',
      attributeValues: 'attributeValues',
    }),
    receivingList() {
      this.receivingPage.records.forEach((receiving) => {
        // Format date to 'YYYY-MM-DD'
        if (receiving.createTime) {
          receiving.createTimeTxt = dayjs(receiving.createTime).format('YYYY-MM-DD')
        }
      })
      return this.receivingPage.records || []
    }
  },
  mounted() {
    this.getReceivingPage({
      page: 1,
      limit: 1000,
    })
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useReceivingStore, {getReceivingPage: 'getReceivingPageAction'}),
    getTableText(value) {
      if (value === null || value === undefined) {
        return '--'
      }
      return value
    },
    async toReceivingDetail(item) {
      console.log(item)
      let receivingForm = {...item}

      receivingForm.stockPurposeCode = receivingForm.purposeCode
      receivingForm.stockPurposeName = receivingForm.purposeName
      delete receivingForm.purposeCode
      delete receivingForm.purposeName

      this.receivingForm = receivingForm

      let attributeValues = []
      if (receivingForm.attributeValueVos) {
        receivingForm.attributeValueVos.forEach((attributeValue) => {
          attributeValues.push({
            targetId: receivingForm.id,
            attributeId: attributeValue.attributeId,
            elComponent: attributeValue.elComponent,
            sort: attributeValue.sort,
            value: attributeValue.value
          })
        })
      }
      this.attributeValues = attributeValues

      let receivingProducts = []
      receivingForm.products.forEach((product) => {
        receivingProducts.push({
          id: product.productId,
          name: product.productName,
          skuCode: product.skuCode,
          expectedQuantity: product.expectedQuantity,
        })
      })
      this.receivingProducts = receivingProducts

      delete receivingForm.products
      delete receivingForm.attributeValueVos
      this.$router.push('/views/receiving/index?id=' + item.id)
    },
  }
}
</script>
<style lang="scss" scoped>
.receiving-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 80vh;

  .product-title {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 4px;

    :deep(.u-text__value) {
      //font-size: 12px !important;
      //font-weight: 700 !important;
      //text-align: center !important;
      //width: 100px;
    }
  }

  .table-header .header-text {
    font-size: 10px;
    font-weight: bold;
    margin: 4px 0 !important;
    //text-align: center;

    :deep(.u-text__value) {
      font-size: 10px !important;
      font-weight: bold !important;
      //text-align: center !important;
      //width: 100px;
    }
  }


  .text-danger {
    color: $uni-color-error;

    :deep(.u-text__value) {
      color: $uni-color-error !important;
    }
  }

  .text-warning {
    color: $uni-color-warning;

    :deep(.u-text__value) {
      color: $uni-color-warning !important;
    }
  }

  .text-success {
    color: $uni-color-success;

    :deep(.u-text__value) {
      color: $uni-color-success !important;
    }
  }

  .table-content {
    max-height: 200px;
    overflow-y: auto;

    .table-row {
      border-bottom: 1px solid #f0f0f0;
      padding: 0;

      &:last-child {
        border-bottom: none;
      }
    }

    .table-text {
      font-size: 10px;
      padding: 4px 0;
      text-align: center;

      :deep(.u-text__value) {
        font-size: 10px !important;
        //text-align: center !important;
        //width: 80px;
      }
    }

    .epc {
      word-break: break-all;
      text-align: left;
      padding-left: 5px;
    }
  }
}
</style>
  