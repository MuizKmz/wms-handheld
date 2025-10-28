<template>
  <view class="main-wrapper" @click="onWarehouse">
    <view class="form-item location-item" @click="ctrl.showWarehousePicker = true">
      <text class="label">Warehouse:</text>
      <up-input v-model="receivingForm.warehouseCode" border="none" class="input-field" clearable
                placeholder=" Optional" readonly>
        <template #suffix>
          <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
        </template>
      </up-input>
    </view>
    <view class="form-item location-item" @click="ctrl.showRackPicker = true">
      <text class="label">Rack:</text>
      <up-input v-model="receivingForm.rackCode" border="none" class="input-field" clearable placeholder=" Optional"
                readonly>
        <template #suffix>
          <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
        </template>
      </up-input>
    </view>
  </view>
  <!--    <up-picker :columns="columns" :show="show"></up-picker>-->
  <u-picker v-if="ctrl.pickerShow" ref="uPicker" :cancelText="'Cancel'" :closeOnClickOverlay="true"
            :columns="ctrl.pickerOptions" :confirmText="'Confirm'"
            :defaultIndex="ctrl.pickerDefaultIndex" :immediateChange="true"
            :show="ctrl.pickerShow" :title="ctrl.pickerTitle" :visibleItemCount="7"
            keyName="label"
            @cancel="pickerConfirm" @change="pickerChange" @close="pickerConfirm" @confirm="pickerConfirm"></u-picker>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  props: {},
  data() {
    return {
      columns: [],
      list: [],
      defaultIndex: [0, 0, 0],
      defaultOption: {
        label: 'Default',
        value: ''
      },
      ctrl: {
        pickerTitle: '',
        pickerOptions: [],
        pickerDefaultIndex: [],
        pickerShow: false
      }
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts'
    }),
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      this.getWarehouseList()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    async onWarehouse() {
      await this.getWarehouseList()
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = [...this.defaultIndex]
      this.ctrl.pickerTitle = 'Warehouse-Rack'
      this.ctrl.pickerShow = true
    },
    pickerChange(e) {
      const {
        columnIndex,
        value,
        picker = this.$refs.uPicker
      } = e
      let currentWarehouseCode = value[0].value
      let currentRackCode = columnIndex === 0 ? '' : value[1].value
      let columns = this.getColumns(currentWarehouseCode, currentRackCode)

      if (columnIndex === 0) {
        // Rack code list
        picker.setColumnValues(1, columns[1])
      }
    },
    /**
     * Get warehouse, rack code list
     * @param warehouseCode
     * @param rackCode
     * @returns {Array}
     */
    getColumns(warehouseCode, rackCode) {
      let warehouseCodeList = [this.defaultOption]
      let rackCodeList = [this.defaultOption]

      if (!this.list || this.list.length <= 0) {
        return [warehouseCodeList, rackCodeList]
      }

      // column 0
      warehouseCodeList = this.list.map((warehouse) => {
        return {
          id: warehouse.id,
          label: warehouse.name,
          value: warehouse.code,
        }
      })

      // column 1
      let rackList = []
      if (!warehouseCode) {
        warehouseCode = warehouseCodeList[0].value
      }
      this.list.forEach((warehouse) => {
        if (warehouse.code === warehouseCode) {
          rackList = warehouse.racks
        }
      })
      if (rackList.length > 0) {
        rackCodeList = rackList.map((rack) => {
          return {
            id: rack.id,
            label: rack.name,
            value: rack.code
          }
        })
      }

      // column 2
      if (!rackCode) {
        rackCode = rackCodeList[0].value
      }
      return [warehouseCodeList, rackCodeList]
    },
    pickerConfirm(e) {
      if (e) {
        console.log(e)
        this.defaultIndex = e.indexs
        this.receivingForm.warehouseId = e.value[0].id
        this.receivingForm.warehouseCode = e.value[0].value
        this.receivingForm.rackId = e.value[1].id
        this.receivingForm.rackCode = e.value[1].value
        // this.$emit('pickConfirm', this.receivingForm)
      }
      this.ctrl.pickerShow = false
    },
    async getWarehouseList() {
      let res = await this.$api.getWarehouseCodeNameList()
      if (res.success) {
        this.list = res.data
        this.columns = this.getColumns(this.receivingForm.warehouseCode, this.receivingForm.rackCode)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.main-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  //gap: 10px;

  .location-item {
    width: calc(49% - 5px);

    //&:last-child {
    //  width: 100%;
    //}
  }

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
      font-size: 12px;

      :deep(.input-right-icon) {
        .u-icon__icon {
          font-size: 12px !important;
        }

        margin-right: 4px !important;
      }
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 12px !important;
  margin-left: 6px !important;
}

:deep(.u-toolbar__title) {
  //font-size: 12px !important;
  padding: 0px !important;
}
</style>
  