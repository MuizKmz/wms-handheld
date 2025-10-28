<template>
  <view class="action-section">
    <up-row class="action-buttons" gutter="10" justify="center">
      <up-col span="4">
        <up-button :disabled="!receivingForm.supplierCode" :throttleTime="1000" icon="plus" shape="circle"
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
    })
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
      this.ctrl.productPickerShow = true
      console.log(this.ctrl)
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
  bottom: -1px;
  //bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  background: #f5e1c1;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  //margin-bottom: 6px;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  //margin-bottom: 10px;
  margin-bottom: 4px;
}

//.confirm-btn {
//  width: 100%;
//  font-size: 16px;
//  border-radius: 100px;
//  min-width: 150px;
//}
</style>
  