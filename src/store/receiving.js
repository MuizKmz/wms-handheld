import {defineStore} from 'pinia'
import api from '@/api'

function generateReceivingCode() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `RCV-${year}${month}${day}-${time}-${random}`
}

export const useReceivingStore = defineStore('receiving', {
    // 状态
    state: () => ({
        receivingPage: {},
        receivingForm: {
            id: '',
            code: '',
            doNumber: '',
            poNumber: '',
            orderId: '',
            orderNo: '',
            receivingPurpose: '',
            stockPurposeId: '',
            stockPurposeCode: '',
            stockPurposeName: '',
            supplierId: '',
            supplierCode: '',
            supplierName: '',
            warehouseId: '',
            warehouseCode: '',
            rackId: '',
            rackCode: '',
            sectionId: '',
            sectionCode: '',
            locationId: '',
            locationCode: '',
            source: '',
            receiverName: '',
            dateReceived: '',
            receivedBy: '',
            remark: ''
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
                code: generateReceivingCode(),
                doNumber: '',
                poNumber: '',
                orderId: '',
                orderNo: '',
                receivingPurpose: '',
                stockPurposeId: '',
                stockPurposeCode: '',
                stockPurposeName: '',
                supplierId: '',
                supplierCode: '',
                supplierName: '',
                warehouseId: '',
                warehouseCode: '',
                rackId: '',
                rackCode: '',
                sectionId: '',
                sectionCode: '',
                locationId: '',
                locationCode: '',
                source: '',
                receiverName: '',
                dateReceived: '',
                receivedBy: '',
                remark: ''
            }
            this.attributeValues = []
            this.receivingProducts = []
        }
    },
    // 计算属性
    getters: {},
})
