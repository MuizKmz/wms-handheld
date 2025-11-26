<template>
  <view class="form-item">
    <text class="label">{{ title }}<text v-if="status === 4" class="required">*</text></text>
    <up-textarea v-if="status === 1" v-model="stockInForm.inboundNote" :placeholder="placeHolder"
              border="none" class="input-field" count maxlength="200"/>
    <up-textarea v-if="status === 2" v-model="stockTakeForm.stockTakeNote" :placeholder="placeHolder" border="none"
              class="input-field" count maxlength="200"/>
    <up-textarea v-if="status === 3" v-model="stockOutForm.outboundNote" :placeholder="placeHolder" border="none"
              class="input-field" count maxlength="200"/>
    <up-textarea v-if="status === 4" v-model="stockReturnForm.reason" :placeholder="placeHolder" border="none"
              class="input-field" count maxlength="200"/>
    <text v-if="status === 4" class="label" style="margin-top: 12px;">Additional Notes</text>
    <up-textarea v-if="status === 4" v-model="stockReturnForm.notes" placeholder="Additional notes (optional)" border="none"
              class="input-field" count maxlength="200"/>
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
  margin-bottom: 16px;
  width: 100%;

  .label {
    font-weight: 600;
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #333;
    
    .required {
      color: #f56c6c;
      margin-left: 2px;
    }
  }

  .input-field {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    border: 1px solid #e8eaed;
    transition: all 0.2s ease;

    &:focus-within {
      background-color: #fff;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

:deep(.u-textarea__count) {
  background-color: transparent;
  font-size: 12px;
  color: #909399;
}
</style>
  