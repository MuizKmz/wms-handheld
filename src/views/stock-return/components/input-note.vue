<template>
  <view class="form-item">
    <text class="label">{{ title }}:</text>
    <up-input v-if="status === 1" v-model="stockInForm.inboundNote" :placeholder="placeHolder"
              border="none" class="input-field"/>
    <up-input v-if="status === 2" v-model="stockTakeForm.stockTakeNote" :placeholder="placeHolder" border="none"
              class="input-field"/>
    <up-input v-if="status === 3" v-model="stockOutForm.outboundNote" :placeholder="placeHolder" border="none"
              class="input-field"/>
    <up-input v-if="status === 4" v-model="stockReturnForm.stockReturnNote" :placeholder="placeHolder" border="none"
              class="input-field"/>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  props: {
    /**
     * status: 1:inbound 2:stocktake 3:outbound 4:return
     */
    status: {
      type: Number,
      default: 1
    }
    // doNumber: {
    //   type: String,
    //   default: ''
    // }
  },
  watch: {},
  data() {
    return {
      // note: '',
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      stockTakeForm: 'stockTakeForm',
      stockOutForm: 'stockOutForm',
      stockReturnForm: 'stockReturnForm',
      scannedTags: 'scannedTags',
    }),
    title() {
      switch (this.status) {
        case 1:
          return 'Inbound Note'
        case 2:
          return 'Stocktake Note'
        case 3:
          return 'Outbound Note'
        case 4:
          return 'Return Reason'
        default:
          return 'Note'
      }
    },
    placeHolder() {
      switch (this.status) {
        case 1:
          return 'Key in inbound note'
        case 2:
          return 'Key in stock take note'
        case 3:
          return 'Key in outbound note'
        case 4:
          return 'Key in return reason'
        default:
          return 'note'
      }
    }
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      // this.getReceivingList()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useStockStore, {getSearchTags: 'getSearchTagsAction'}),

    resetForm() {
    }
  }
}
</script>
<style lang="scss" scoped>
.form-item {
  margin-bottom: 4px;

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
    font-size: 13px;

    :deep(.input-right-icon) {
      .u-icon__icon {
        font-size: 12px !important;
      }

      margin-right: 4px !important;
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 12px !important;
  margin-left: 6px !important;
}
</style>
  