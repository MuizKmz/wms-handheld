<template>
  <view class="action-section">
    <up-row class="action-buttons" gutter="10" justify="center">
      <up-col span="4">
        <up-button :disabled="!canAddProducts" :throttleTime="1000" icon="plus" shape="circle"
                   size="small" text="Add Product"
                   type="primary"
                   @click="onAddProduct"></up-button>
      </up-col>
      <up-col span="4">
        <up-button :throttleTime="1000" icon="checkmark" shape="circle" size="small"
                   text="Save"
                   type="warning"
                   @click="ctrl.saveConfirmShow = true"></up-button>
      </up-col>
      <up-col span="4">
        <up-button v-if="!receivingForm.id" :throttleTime="1000" icon="reload" shape="circle" size="small"
                   text="Cancel"
                   type="info"
                   @click="onCancel"></up-button>
        <up-button v-else :throttleTime="1000" icon="trash" shape="circle" size="small"
                   text="Remove"
                   type="error"
                   @click="onRemove"></up-button>
      </up-col>
    </up-row>

    <product-list-picker/>

  </view>
  <up-modal :content='ctrl.content' :show="ctrl.saveConfirmShow" :showCancelButton="true"
            :title="ctrl.title" cancelText="Cancel" confirmText="Confirm" @cancel="ctrl.saveConfirmShow = false"
            @confirm="onSave"></up-modal>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'
import ProductListPicker from './picker-product-list.vue'

export default {
  components: {ProductListPicker},
  props: {},
  data() {
    return {}
  },
  watch: {},
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
      ctrl: 'ctrl',
    }),
    canAddProducts() {
      // Check if required fields are filled
      return (
        this.receivingForm.code &&
        this.receivingForm.orderNo &&
        this.receivingForm.doNumber &&
        this.receivingForm.warehouseId &&
        this.receivingForm.supplierId &&
        this.receivingForm.stockPurposeName &&
        this.receivingForm.receivedBy
      )
    }
  },
  async mounted() {
    // console.log('ctrl-stock mounted')
    // uni.$on('onShow', () => {
    // })
  },
  beforeUnmount() {
    console.log('ctrl-stock unmounted')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useReceivingStore, {
      resetReceivingForm: 'resetReceivingFormAction'
    }),
    onAddProduct() {
      if (!this.receivingForm.orderId) {
        uni.showToast({
          title: 'Please scan PO first',
          icon: 'none'
        })
        return
      }
      
      // Navigate to product selection page
      uni.navigateTo({
        url: '/views/receiving/select-products?orderId=' + this.receivingForm.orderId
      })
    },
    onSave() {
      this.$emit('onSave')
      this.ctrl.saveConfirmShow = false
    },
    async onCancel() {
      this.resetReceivingForm()
    },
    async onRemove() {
      let res = await this.$api.deleteReceiving(this.receivingForm.id)
      if (res.success) {
        this.$msg('Receiving removed successfully')
        this.resetReceivingForm()
      } else {
        this.$msg('Failed to remove receiving: ' + res.message)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.action-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%);
  padding: 16px 20px 20px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  border-top: 1px solid #e8eaed;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0;

  :deep(.u-button) {
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    padding: 14px 0 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:active {
      transform: translateY(1px);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.u-button--primary) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  }

  :deep(.u-button--warning) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  }

  :deep(.u-button--info) {
    background: linear-gradient(135deg, #a8b8d8 0%, #7e8ba3 100%) !important;
  }

  :deep(.u-button--error) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%) !important;
  }
}
</style>
  