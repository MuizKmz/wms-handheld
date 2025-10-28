<template>
  <view v-if="receivingProducts.length > 0" class="products-section">
    <view class="wms-flex-row wms-justify-center wms-items-center product-title">
      <up-text :bold="true" prefixIcon="list-dot" size="12" text="List of Coil"></up-text>
    </view>
    <up-line></up-line>
    <up-row align="center" class="table-header" justify="start">
      <up-col align="center" justify="center" span="2" textAlign="center">
        <up-text align="left" class="header-text" line="3" text="TAG NO."></up-text>
      </up-col>
      <up-col align="center" justify="center" span="2" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="HEAT NO."></up-text>
      </up-col>
      <up-col align="center" justify="center" span="3" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="TAG WEIGHT(KG)"></up-text>
      </up-col>
      <up-col align="center" justify="center" span="3" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Expected"></up-text>
      </up-col>
      <up-col align="center" justify="center" span="2" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Opetate"></up-text>
      </up-col>
    </up-row>
    <up-line></up-line>
    <scroll-view class="table-content" scroll-y="true">
      <view v-for="(item, index) in receivingProducts" :key="index" class="table-row">
        <up-row align="center" justify="space-between">
          <up-col justify="center" span="2" textAlign="center">
            <up-text :text="getTableText(item,'TAG_NUMBER')" align="left" class="table-text" line="3"></up-text>
          </up-col>
          <up-col justify="center" span="2" textAlign="center">
            <up-text :text="getTableText(item,'HEAT_NUMBER')" align="center" class="table-text" line="3"></up-text>
          </up-col>
          <up-col justify="center" span="3" textAlign="center">
            <up-text :text="getTableText(item,'TAG_WEIGHT')" align="center" class="table-text" line="3"></up-text>
          </up-col>
          <up-col class="wms-flex-row wms-justify-center wms-items-center" justify="center" span="3">
            <up-number-box v-model="item.expectedQuantity">
              <template #minus>
                <view
                    class="minus"
                >
                  <up-icon
                      name="minus"
                      size="12"
                  ></up-icon>
                </view>
              </template>
              <template #input>
                <text
                    class="input"
                    style="width: 50px;text-align: center;font-size: 12px;"
                >{{ item.expectedQuantity }}
                </text>
              </template>
              <template #plus>
                <view
                    class="plus"
                >
                  <up-icon
                      name="plus"
                      size="12"
                  ></up-icon>
                </view>
              </template>
            </up-number-box>
          </up-col>
          <up-col justify="center" span="2" textAlign="center">
            <up-text align="center" class="table-text" prefixIcon="trash" text=""
                     @click="removeProduct(item,index)"></up-text>
          </up-col>
        </up-row>
      </view>
    </scroll-view>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  props: {},
  watch: {},
  data() {
    return {
      ctrl: {}
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
      receivingProducts: 'receivingProducts'
    }),
    productList() {
      if (this.receivingForm.tagFlow === 1) {
        return [...this.receivingProducts]
      } else {
        return [...this.receivingProducts].filter(item => {
          return item.skuCode === this.receivingForm.skuCode
        })
      }
    }
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useReceivingStore, {getReceivingList: 'getReceivingListAction'}),
    getTableText(item, key) {
      let value = null
      if (item.attributeValueVos) {
        item.attributeValueVos.forEach(item => {
          if (item.attributeCode === key) {
            value = item.value
          }
        })
      }
      if (value === null || value === undefined) {
        return '--'
      }
      return value
    },
    removeProduct(item, index) {
      this.receivingProducts.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.products-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 100px;

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
  