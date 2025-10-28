<template>
  <view class="products-section">
    <view class="wms-flex-row wms-justify-center wms-items-center product-title">
      <up-text :bold="true" prefixIcon="list-dot" size="12" text="Products To Stock Take"></up-text>
      <!--      <view class="wms-flex-row wms-justify-center wms-items-center" v-if="false">-->
      <!--        <view class="wms-flex-row wms-justify-between wms-items-center wms-gap-4 wms-ml-4">-->
      <!--          <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="reload" shape="circle" size="mini"-->
      <!--                     text="" type="info"-->
      <!--                     @click="onReload"></up-button>-->
      <!--        </view>-->
      <!--      </view>-->
    </view>
    <up-line></up-line>
    <up-row align="center" class="table-header" justify="start">
      <up-col align="center" justify="center" span="3" textAlign="center">
        <up-text align="left" class="header-text" line="3" text="Product Name"></up-text>
      </up-col>
      <up-col align="center" justify="center" span="3" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Product Code"></up-text>
      </up-col>
      <up-col align="center" justify="center" span="3" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Sku Code"></up-text>
      </up-col>
      <!--      <up-col align="center" justify="center" span="2" textAlign="center">-->
      <!--        <up-text align="center" class="header-text" line="3" text="Expected"></up-text>-->
      <!--      </up-col>-->
      <!--      <up-col align="center" justify="center" span="2" textAlign="center">-->
      <!--        <up-text align="center" class="header-text" line="3" text="Received"></up-text>-->
      <!--      </up-col>-->
      <up-col align="center" justify="center" span="3" textAlign="center">
        <up-text align="center" class="header-text" line="3" text="Scanned"></up-text>
      </up-col>
    </up-row>
    <up-line></up-line>
    <scroll-view class="table-content" scroll-y="true">
      <view v-for="(item, index) in productList" :key="index" class="table-row">
        <up-row align="center" justify="space-between">
          <up-col justify="center" span="3" textAlign="center">
            <up-text :text="getTableText(item.productName)" align="left" class="table-text" line="3"></up-text>
          </up-col>
          <up-col justify="center" span="3" textAlign="center">
            <up-text :text="getTableText(item.productCode)" align="center" class="table-text" line="3"></up-text>
          </up-col>
          <up-col justify="center" span="3" textAlign="center">
            <up-text :text="getTableText(item.skuCode)" align="center" class="table-text" line="3"></up-text>
          </up-col>
          <!--          <up-col justify="center" span="2" textAlign="center">-->
          <!--            <up-text :text="getTableText(item.expectedQuantity)" align="center" class="table-text" line="3"></up-text>-->
          <!--          </up-col>-->
          <!--          <up-col justify="center" span="2" textAlign="center">-->
          <!--            <up-text :class="getReceivedClass(item)" :text="getTableText(item.receivedQuantity)" align="center"-->
          <!--                     class="table-text" line="3"></up-text>-->
          <!--          </up-col>-->
          <up-col justify="center" span="3" textAlign="center">
            <up-text :text="calcScannedQuantity(item)" align="center" class="table-text" line="3"></up-text>
          </up-col>
        </up-row>
      </view>
      <view v-if="productList.length<=0" class="no-data-wrapper">No products scanned</view>
    </scroll-view>
  </view>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'
import _ from 'lodash'

export default {
  props: {},
  watch: {
    scannedTags: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal) {
          let productGroup = _.groupBy([...newVal].filter(item => item.skuCode), 'skuCode')

          let stockTakeProducts = []
          for (let skuCode in productGroup) {
            console.log(typeof skuCode)
            stockTakeProducts.push(
                {
                  skuCode: skuCode,
                  productName: productGroup[skuCode][0].productName,
                  productCode: productGroup[skuCode][0].productCode,
                  scannedQuantity: productGroup[skuCode].length
                }
            )
          }

          this.stockTakeProducts = stockTakeProducts
        }
      }
    }
  },
  data() {
    return {
      ctrl: {}
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      scannedTags: 'scannedTags',
      stockTakeProducts: 'stockTakeProducts'
    }),
    productList() {
      return [...this.stockTakeProducts]
    },
    quantityMap() {
      let quantityMap = new Map()
      this.scannedTags.forEach(tag => {
        let skuCode = tag.skuCode
        if (skuCode) {
          if (quantityMap.has(skuCode)) {
            quantityMap.set(skuCode, quantityMap.get(skuCode) + 1)
          } else {
            quantityMap.set(skuCode, 1)
          }
        }
      })
      return quantityMap
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
    // ...mapActions(useStockStore),
    async onReload() {
      this.$msg('Reloaded')
    },
    getReceivedClass(item) {
      if (item.receivedQuantity < item.expectedQuantity) {
        return 'text-danger'
      } else if (item.receivedQuantity > item.expectedQuantity) {
        return 'text-warning'
      } else {
        return 'text-success'
      }
    },
    getTableText(value) {
      if (value === null || value === undefined) {
        return '--'
      }
      return value
    },
    calcScannedQuantity(item) {
      return this.quantityMap.get(item.skuCode) || 0
    },
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

    .no-data-wrapper {
      text-align: center;
      font-size: 12px;
      color: #999;
      padding: 10px 0;
      //width: 100vw;
    }
  }
}
</style>
  