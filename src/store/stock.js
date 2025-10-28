import {defineStore} from 'pinia'
import api from '@/api'

export const useStockStore = defineStore('stock', {
    // 状态
    state: () => ({
        stockInForm: {
            // 1:EPC 2:TID
            tagFlow: 1,
            // 1: Sales, 2: Production Picking, 3: Return, 4: Transfer, 5: Gift, 6: Scrap, 7: Sample, 8:Borrowing, 9: Inventory Adjustment, 10: Other
            inboundType: 1,
            inboundNote: '',
            doNumber: '',
            receivingCode: '',
            skuCode: '',
            skuDesc: '',
            stockPurposeCode: '',
            stockPurposeName: '',
            warehouseCode: '',
            rackCode: '',
            sectionCode: '',
        },
        stockTakeForm: {
            stockTakeNote: ''
        },
        stockOutForm: {
            orderCode: '',
            outboundNote: '',
        },
        stockReturnForm: {
            keyword: '',
            stockReturnNote: ''
        },
        searchForm: {
            keyword: '',
        },
        // search inventory
        searchTags: [],
        // search inventory
        searchReturnTags: [],
        // scanned tags list(have got inventory detail)
        scannedTags: [],
        // Inquired tag code list
        inquiredTagCodes: [],
        // key:tagCode,value:tagType
        tagStore: {},
        // Stock-in zone
        stockInTags: [],
        // receiving
        receivingList: [],
        receivingProducts: [],
        // TIC Mode only
        tidProduct: {},
        // Stock take zone
        stockTakeProducts: [],
        stockTakeTags: [],
        // Stock out zone
        // orderInfo: {},
        orderProducts: [],
        stockOutProducts: [],
        stockOutTags: [],
        // Return zone
        stockReturnTags: [],
        ctrl: {
            showValid: false,
            queryInterval: null,
            isLoading: false,
            checkAll: false,
            loadingTxt: 'Loading...'
        }
    }),
    // 方法
    actions: {
        getSearchTagsAction() {
            return new Promise(async (resolve) => {
                let res = await api.getSearchList({
                    page: 1,
                    limit: 9999,
                    keyword: this.searchForm.keyword,
                })
                if (res.success) {
                    this.searchTags = res.data.records
                }
                resolve(res)
            })
        },
        getSearchReturnTagsAction() {
            return new Promise(async (resolve) => {
                let res = await api.getSearchList({
                    page: 1,
                    limit: 9999,
                    keyword: this.stockReturnForm.keyword,
                })
                if (res.success) {
                    this.searchReturnTags = res.data.records
                }
                resolve(res)
            })
        },
        getReceivingListAction() {
            return new Promise(async (resolve) => {
                if (!this.stockInForm.doNumber) {
                    resolve({success: false, message: 'Please enter the DO number'})
                    return
                }
                let res = await api.getReceivingList(this.stockInForm.doNumber)
                if (res.success) {
                    this.receivingList = res.data
                }
                resolve(res)
            })
        },
        getOrderAction() {
            return new Promise(async (resolve) => {
                if (!this.stockOutForm.orderCode) {
                    resolve({success: false, message: 'Please enter the order number'})
                    return
                }
                let res = await api.getOrderInfo(this.stockOutForm.orderCode)
                if (res.success) {
                    // this.orderInfo = res.data
                    this.orderProducts = res.data.products
                }
                resolve(res)
            })
        },
        queryInventoryAction() {
            return new Promise(async (resolve) => {
                let scannedTags = this.scannedTags
                let tagStore = this.tagStore
                let inquiredTagSet = new Set([...this.inquiredTagCodes])
                let toInquireTagCodes = Array.from(Object.keys(tagStore)).filter(tagCode => {
                    return !inquiredTagSet.has(tagCode)
                })
                if (toInquireTagCodes.length <= 0) {
                    return
                }
                let res = await api.queryInventoryList({
                    tagCodes: toInquireTagCodes
                })
                toInquireTagCodes.forEach(tagCode => {
                    let tag
                    if (res.success) {
                        // EPC mode
                        if (res.data.length > 0) {
                            tag = res.data.find(item => {
                                return item.tagCode === tagCode
                            })
                        }
                    }
                    if (!tag) {
                        tag = {tagCode: tagCode}
                    }
                    // remove old record
                    for (let i = 0; i < scannedTags.length; i++) {
                        let current = scannedTags[i]
                        if (current.tagCode === tagCode) {
                            // remove current and add to header
                            scannedTags.splice(i, 1)
                            break
                        }
                    }
                    tag.tagType = tagStore[tagCode]
                    scannedTags.splice(0, 0, tag)
                    inquiredTagSet.add(tagCode)
                })
                this.inquiredTagCodes = [...inquiredTagSet]
                resolve(res)
            })
        },
        async reloadInventoryAction() {
            this.inquiredTagCodes = []
            await this.queryInventoryAction()
        },
        clearAction() {
            this.scannedTags = []
            this.inquiredTagCodes = []
            this.tagStore = {}
        },
        clearReturnAction() {
            this.clearAction()
            this.stockReturnTags = []
        },
        cancelStockInAction() {
            this.clearAction()
            this.receivingList = []
            this.receivingProducts = []
            this.stockInTags = []
            this.stockInForm.doNumber = ''
            this.stockInForm.receivingCode = ''
            this.stockInForm.skuCode = ''
            this.stockInForm.skuDesc = ''
            this.stockInForm.stockPurposeCode = ''
            this.stockInForm.stockPurposeName = ''
            this.stockInForm.warehouseCode = ''
            this.stockInForm.rackCode = ''
            this.stockInForm.sectionCode = ''
        },
        cancelStockOutAction() {
            this.clearAction()
            this.orderProducts = []
            this.stockOutTags = []
            this.stockOutForm.orderCode = ''
        },
        cancelStockReturnAction() {
            this.clearReturnAction()
            this.stockReturnForm.keyword = ''
        },
        cancelStockSearchAction() {
            this.clearAction()
            this.searchForm.keyword = ''
        }
    },
    // 计算属性
    getters: {},
})
