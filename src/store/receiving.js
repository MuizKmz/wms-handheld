import {defineStore} from 'pinia'
import api from '@/api'

export const useReceivingStore = defineStore('receiving', {
    // 状态
    state: () => ({
        receivingPage: {},
        receivingForm: {
            id: '',
            code: '',
            doNumber: '',
            stockPurposeId: '',
            stockPurposeCode: '',
            stockPurposeName: '',
            supplierId: '',
            supplierCode: '',
            warehouseId: '',
            warehouseCode: '',
            rackId: '',
            rackCode: '',
            source: '',
            receiverName: '',
        },
        attributeValues: [],
        receivingProducts: [],
        products: [],
        ctrl: {
            productPickerShow: false,
            saveConfirmShow: false,
            title: 'Confirmation',
            content: 'Are you sure you want to save this receiving entry?'
        }
    }),
    // 方法
    actions: {
        getProductListAction() {
            return new Promise(async (resolve) => {
                if (!this.receivingForm.supplierId) {
                    resolve({success: false, message: 'Please select a supplier first'})
                    return
                }
                let res = await api.getProductList({supplierId: this.receivingForm.supplierId})
                if (res.success) {
                    this.products = res.data
                }
                resolve(res)
            })
        },
        getReceivingPageAction(query) {
            return new Promise(async (resolve) => {
                let res = await api.getReceivingPage(query)
                if (res.success) {
                    this.receivingPage = res.data
                }
                resolve(res)
            })
        },
        resetReceivingFormAction() {
            this.receivingForm = {
                id: '',
                code: '',
                doNumber: '',
                stockPurposeId: '',
                stockPurposeCode: '',
                stockPurposeName: '',
                supplierId: '',
                supplierCode: '',
                warehouseId: '',
                warehouseCode: '',
                rackId: '',
                rackCode: '',
                source: '',
                receiverName: '',
            }
            this.attributeValues = []
            this.receivingProducts = []
        }
    },
    // 计算属性
    getters: {},
})
