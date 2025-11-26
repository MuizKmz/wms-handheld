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
            receivingId: null,
            receivingPurpose: '',  // RAW_MATERIAL or FINISHED_GOODS from receiving
            skuCode: '',
            skuDesc: '',
            stockPurposeCode: '',
            stockPurposeName: '',
            warehouseCode: '',
            warehouseId: null,
            warehouseName: '',
            locationCode: '',
            locationId: null,
            locationName: '',
            supplierId: null,
            supplierCode: '',
            supplierName: '',
            orderId: null,
            orderNo: '',
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
            returnType: null, // 'CUSTOMER_RETURN' or 'SUPPLIER_RETURN'
            referenceNumber: '', // SO or PO number
            orderId: null, // For customer returns (Sales Order)
            receivingId: null, // For supplier returns (Purchase Order receiving)
            customerId: null,
            supplierId: null,
            reason: '', // Renamed from stockReturnNote
            notes: '', // Additional notes for return
            requestedBy: null, // User ID
            source: 'handheld',
            defaultCondition: 'GOOD' // Default return condition for scanned EPCs
        },
        // Selected order details (SO or PO)
        selectedOrder: null,
        // Selected product from the order
        selectedProduct: null,
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
                if (res.success && res.data) {
                    // Map orderItems to products with expected quantities
                    this.orderProducts = res.data.orderItems.map(item => ({
                        id: item.product.id,
                        productId: item.product.id,
                        productCode: item.product.productCode,
                        productName: item.product.name,
                        skuCode: item.product.skuCode,
                        expectedQuantity: item.quantity,
                        stockOutQuantity: 0,
                        scannedQuantity: 0
                    }))
                    console.log('📦 Order products loaded:', this.orderProducts)
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
                
                console.log('🔍 Query inventory - tagStore:', tagStore)
                console.log('🔍 Query inventory - toInquireTagCodes:', toInquireTagCodes)
                
                if (toInquireTagCodes.length <= 0) {
                    console.log('⚠️ No tags to inquire')
                    return
                }
                
                console.log('📤 Sending API request with tagCodes:', toInquireTagCodes)
                
                let res
                try {
                    res = await api.queryInventoryList({
                        tagCodes: toInquireTagCodes
                    })
                    console.log('📥 API Response:', JSON.stringify(res, null, 2))
                } catch (error) {
                    console.error('API Error:', error)
                    uni.showModal({
                        title: '❌ Network Error',
                        content: `Cannot connect to backend.\n\nError: ${error.message}\n\nMake sure backend is running.`,
                        showCancel: false
                    })
                    resolve({success: false, msg: error.message})
                    return
                }
                
                // Determine context BEFORE validation (needed for status conversion later)
                const hasReceivingData = this.receivingProducts && this.receivingProducts.length > 0
                const hasOrderData = this.orderProducts && this.orderProducts.length > 0
                const hasReceivingCode = this.stockInForm.receivingCode && this.stockInForm.receivingCode.length > 0
                const hasOrderCode = this.stockOutForm.orderCode && this.stockOutForm.orderCode.length > 0
                const hasReturnType = this.stockReturnForm.returnType && this.stockReturnForm.returnType.length > 0
                
                let isStockIn = false
                let isStockOut = false
                let isReturn = false
                let isCustomerReturn = false
                let isSupplierReturn = false
                
                if (hasReturnType) {
                    isReturn = true
                    isCustomerReturn = this.stockReturnForm.returnType === 'CUSTOMER_RETURN'
                    isSupplierReturn = this.stockReturnForm.returnType === 'SUPPLIER_RETURN'
                } else if (hasReceivingCode && hasOrderCode) {
                    // Both codes exist (stale data) - use products array as tiebreaker
                    if (hasReceivingData && !hasOrderData) {
                        isStockIn = true
                    } else if (hasOrderData && !hasReceivingData) {
                        isStockOut = true
                    } else if (hasReceivingData && hasOrderData) {
                        // Both products exist - last resort: prefer receivingCode (stock-in)
                        isStockIn = true
                    }
                } else if (hasReceivingCode) {
                    isStockIn = true
                } else if (hasOrderCode) {
                    isStockOut = true
                } else if (hasReceivingData) {
                    isStockIn = true
                } else if (hasOrderData) {
                    isStockOut = true
                }
                
                if (res.success && res.data && res.data.length > 0) {
                    console.log('✅ Found EPCs:', res.data)
                    
                    const invalidEpcs = []
                    const alreadyScannedEpcs = []
                    
                    console.log('🔍 Context Detection:', {
                        hasReceivingData,
                        hasOrderData,
                        hasReceivingCode,
                        hasOrderCode,
                        hasReturnType,
                        returnType: this.stockReturnForm.returnType,
                        isStockIn,
                        isStockOut,
                        isReturn,
                        isCustomerReturn,
                        isSupplierReturn
                    })
                    
                    // Validate EPCs based on context
                    res.data.forEach(epc => {
                        // Check if EPC is already in scannedTags (duplicate scan)
                        const isAlreadyScanned = scannedTags.some(t => 
                            t.epcCode === epc.epcCode || t.tagCode === epc.tagCode || t.epcCode === epc.tagCode
                        )
                        
                        // Get status - API returns status as string (GENERATED, INBOUND, etc)
                        const epcStatus = epc.status
                        console.log('🔍 EPC Validation:', {
                            epcCode: epc.epcCode,
                            status: epc.status,
                            statusType: typeof epc.status,
                            isStockIn,
                            isStockOut,
                            isReturn
                        })
                        
                        if (isAlreadyScanned) {
                            console.log('⚠️ EPC already scanned:', epc.epcCode)
                            alreadyScannedEpcs.push(epc)
                        } 
                        // Stock-in validation
                        else if (isStockIn) {
                            if (epcStatus !== 'GENERATED') {
                                console.log('❌ Stock-in REJECT:', epc.epcCode, 'Status:', epcStatus, 'Expected: GENERATED')
                                invalidEpcs.push({...epc, reason: 'status', expectedStatus: 'GENERATED'})
                            } else {
                                console.log('✅ Stock-in ACCEPT:', epc.epcCode, 'Status:', epcStatus)
                            }
                        }
                        // Stock-out validation
                        else if (isStockOut) {
                            if (epcStatus !== 'INBOUND') {
                                console.log('❌ Stock-out REJECT:', epc.epcCode, 'Status:', epcStatus, 'Expected: INBOUND')
                                invalidEpcs.push({...epc, reason: 'status', expectedStatus: 'INBOUND'})
                            } else {
                                console.log('✅ Stock-out ACCEPT:', epc.epcCode, 'Status:', epcStatus)
                            }
                        }
                        // Customer return validation
                        else if (isCustomerReturn) {
                            if (epcStatus !== 'OUTBOUND') {
                                console.log('❌ Customer return REJECT:', epc.epcCode, 'Status:', epcStatus, 'Expected: OUTBOUND')
                                invalidEpcs.push({...epc, reason: 'status', expectedStatus: 'OUTBOUND'})
                            } else {
                                console.log('✅ Customer return ACCEPT:', epc.epcCode, 'Status:', epcStatus)
                            }
                        }
                        // Supplier return validation
                        else if (isSupplierReturn) {
                            if (epcStatus !== 'INBOUND') {
                                console.log('❌ Supplier return REJECT:', epc.epcCode, 'Status:', epcStatus, 'Expected: INBOUND')
                                invalidEpcs.push({...epc, reason: 'status', expectedStatus: 'INBOUND'})
                            } else {
                                console.log('✅ Supplier return ACCEPT:', epc.epcCode, 'Status:', epcStatus)
                            }
                        }
                    })
                    
                    console.log('📊 Validation Summary:', {
                        totalEpcs: res.data.length,
                        invalidEpcs: invalidEpcs.length,
                        alreadyScanned: alreadyScannedEpcs.length,
                        invalidEpcsList: invalidEpcs.map(e => e.epcCode)
                    })
                    
                    // Handle already scanned EPCs (duplicates)
                    if (alreadyScannedEpcs.length > 0) {
                        alreadyScannedEpcs.forEach(epc => {
                            delete tagStore[epc.epcCode]
                            delete tagStore[epc.tagCode]
                        })
                        
                        uni.showModal({
                            title: '⚠️ Already Scanned',
                            content: `EPC ${alreadyScannedEpcs[0].epcCode} has already been scanned.\n\nPlease scan a different EPC.`,
                            showCancel: false
                        })
                    }
                    
                    // Handle EPCs with invalid status
                    if (invalidEpcs.length > 0) {
                        invalidEpcs.forEach(epc => {
                            delete tagStore[epc.epcCode]
                            delete tagStore[epc.tagCode]
                        })
                        
                        const epc = invalidEpcs[0]
                        let errorMsg = ''
                        
                        if (isStockIn) {
                            const statusMessages = {
                                'INBOUND': 'This EPC is already stocked in (INBOUND).',
                                'OUTBOUND': 'This EPC has already been shipped (OUTBOUND).',
                                'DELIVERED': 'This EPC has already been delivered (DELIVERED).',
                                'RECEIVED': 'This EPC has status RECEIVED. Only GENERATED EPCs can be scanned.'
                            }
                            errorMsg = statusMessages[epc.status] || `This EPC has status ${epc.status}.`
                            errorMsg += '\n\nOnly EPCs with GENERATED status can be scanned for stock-in.'
                        } else if (isStockOut) {
                            const statusMessages = {
                                'GENERATED': 'This EPC has not been stocked in yet (GENERATED).',
                                'OUTBOUND': 'This EPC has already been shipped (OUTBOUND).',
                                'DELIVERED': 'This EPC has already been delivered (DELIVERED).',
                                'RECEIVED': 'This EPC has status RECEIVED. Only INBOUND EPCs can be scanned.'
                            }
                            errorMsg = statusMessages[epc.status] || `This EPC has status ${epc.status}.`
                            errorMsg += '\n\nOnly EPCs with INBOUND status can be scanned for stock-out.'
                        } else if (isCustomerReturn) {
                            const statusMessages = {
                                'GENERATED': 'This EPC has not been shipped yet (GENERATED).',
                                'INBOUND': 'This EPC is in warehouse (INBOUND). Customer returns must be OUTBOUND.',
                                'QUARANTINE': 'This EPC is already in quarantine (QUARANTINE).',
                                'ALLOCATED': 'This EPC is allocated but not shipped (ALLOCATED).'
                            }
                            errorMsg = statusMessages[epc.status] || `This EPC has status ${epc.status}.`
                            errorMsg += '\n\nOnly EPCs with OUTBOUND status (shipped to customer) can be returned.'
                        } else if (isSupplierReturn) {
                            const statusMessages = {
                                'GENERATED': 'This EPC has not been received yet (GENERATED).',
                                'OUTBOUND': 'This EPC has been shipped out (OUTBOUND). Supplier returns must be INBOUND.',
                                'QUARANTINE': 'This EPC is already in quarantine (QUARANTINE).',
                                'ALLOCATED': 'This EPC is allocated for shipping (ALLOCATED).'
                            }
                            errorMsg = statusMessages[epc.status] || `This EPC has status ${epc.status}.`
                            errorMsg += '\n\nOnly EPCs with INBOUND status (in warehouse) can be returned to supplier.'
                        }
                        
                        uni.showModal({
                            title: '❌ Invalid EPC Status',
                            content: `EPC: ${epc.epcCode}\nStatus: ${epc.status}\n\n${errorMsg}`,
                            showCancel: false
                        })
                        
                        // Filter out invalid EPCs
                        res.data = res.data.filter(epc => !invalidEpcs.some(inv => inv.epcCode === epc.epcCode) && !alreadyScannedEpcs.includes(epc))
                        
                        if (res.data.length === 0) {
                            resolve({success: false, msg: 'Invalid EPC status'})
                            return
                        }
                    }
                    
                    // Validate EPCs against receiving products (stock-in) or order products (stock-out)
                    const productsToMatch = isStockIn ? this.receivingProducts : (isStockOut ? this.orderProducts : [])
                    
                    if (productsToMatch && productsToMatch.length > 0) {
                        const allowedSkuCodes = productsToMatch.map(p => p.product?.skuCode || p.skuCode).filter(Boolean)
                        console.log('🔍 Allowed SKU codes:', allowedSkuCodes)
                        
                        // Check each scanned EPC
                        const skuMismatchEpcs = []
                        res.data.forEach(epc => {
                            if (epc.skuCode && !allowedSkuCodes.includes(epc.skuCode)) {
                                skuMismatchEpcs.push(epc)
                            }
                        })
                        
                        if (skuMismatchEpcs.length > 0) {
                            // Remove invalid EPCs from tagStore
                            skuMismatchEpcs.forEach(epc => {
                                delete tagStore[epc.epcCode]
                                delete tagStore[epc.tagCode]
                            })
                            
                            // Show error popup
                            const invalidSkus = [...new Set(skuMismatchEpcs.map(e => e.skuCode))].join(', ')
                            const allowedSkusText = allowedSkuCodes.join(', ')
                            const contextText = isStockIn ? 'receiving' : 'order'
                            
                            uni.showModal({
                                title: '❌ SKU Mismatch',
                                content: `Scanned EPC does not match ${contextText}!\n\n` +
                                         `Scanned SKU: ${invalidSkus}\n` +
                                         `Expected SKU: ${allowedSkusText}\n\n` +
                                         `Only EPCs matching the ${contextText} products can be scanned.`,
                                showCancel: false
                            })
                            
                            // Filter out invalid EPCs from the response
                            res.data = res.data.filter(epc => !skuMismatchEpcs.includes(epc))
                            
                            // If all EPCs were invalid, return early
                            if (res.data.length === 0) {
                                resolve({success: false, msg: `Invalid EPC - SKU does not match ${contextText}`})
                                return
                            }
                        }
                    }
                    
                    if (res.data.length > 0) {
                        uni.showToast({
                            title: `✅ Found ${res.data.length} EPC(s)`,
                            icon: 'success',
                            duration: 2000
                        })
                    }
                } else if (res.success && (!res.data || res.data.length === 0)) {
                    console.log('⚠️ No EPCs found in response')
                    console.log('🔍 Searched for:', toInquireTagCodes)
                    uni.showModal({
                        title: '⚠️ EPC Not Found',
                        content: `The scanned EPC is not in the database.\n\nScanned: ${toInquireTagCodes[0]}\n\nPlease ensure the EPC was generated in the admin panel.`,
                        showCancel: false
                    })
                }
                
                toInquireTagCodes.forEach(tagCode => {
                    let tag
                    if (res.success && res.data && res.data.length > 0) {
                        // Find the matching EPC
                        tag = res.data.find(item => {
                            return item.tagCode === tagCode || item.epcCode === tagCode
                        })
                    }
                    
                    if (!tag) {
                        tag = {
                            tagCode: tagCode,
                            epcCode: tagCode,
                            skuCode: null,
                            productName: null
                        }
                    }
                    
                    // Convert status ONLY for stock-in/stock-out (not for returns)
                    // Returns need string status for validation and display
                    if (!isReturn && tag.status) {
                        // Backend: GENERATED, RECEIVED, INBOUND, DELIVERED
                        // UI: 0 (Not in stock), 1 (Inbound), 2 (Stock take), 3 (Outbound)
                        const statusMap = {
                            'GENERATED': 0,   // Not in stock yet
                            'RECEIVED': 0,    // Not in stock yet
                            'INBOUND': 1,     // In stock
                            'DELIVERED': 3    // Outbound/Delivered
                        }
                        tag.statusString = tag.status  // Keep original for debugging
                        tag.status = statusMap[tag.status] !== undefined ? statusMap[tag.status] : 0
                    }
                    
                    // Remove old record if exists
                    for (let i = 0; i < scannedTags.length; i++) {
                        let current = scannedTags[i]
                        if (current.tagCode === tagCode || current.epcCode === tagCode) {
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
            // Clear return form to prevent stale data
            this.stockReturnForm = {
                returnType: '',
                referenceNumber: '',
                orderId: null,
                receivingId: null,
                customerId: null,
                supplierId: null,
                reason: '',
                defaultCondition: 'GOOD'
            }
            this.selectedOrder = null
            this.selectedProduct = null
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
            this.stockInForm.receivingId = null
            this.stockInForm.receivingPurpose = ''
            this.stockInForm.skuCode = ''
            this.stockInForm.skuDesc = ''
            this.stockInForm.stockPurposeCode = ''
            this.stockInForm.stockPurposeName = ''
            this.stockInForm.warehouseCode = ''
            this.stockInForm.warehouseId = null
            this.stockInForm.warehouseName = ''
            this.stockInForm.locationCode = ''
            this.stockInForm.locationId = null
            this.stockInForm.locationName = ''
            this.stockInForm.supplierId = null
            this.stockInForm.supplierCode = ''
            this.stockInForm.supplierName = ''
            this.stockInForm.orderId = null
            this.stockInForm.orderNo = ''
            
            // Clear stock-out form to prevent cross-contamination
            this.stockOutForm.orderCode = ''
            this.orderProducts = []
            this.stockOutTags = []
        },
        cancelStockOutAction() {
            this.clearAction()
            this.orderProducts = []
            this.stockOutTags = []
            this.stockOutForm.orderCode = ''
            
            // Clear stock-in form to prevent cross-contamination
            this.stockInForm.receivingCode = ''
            this.receivingProducts = []
            this.stockInTags = []
        },
        cancelStockReturnAction() {
            this.clearReturnAction()
            this.stockReturnForm.keyword = ''
            this.stockReturnForm.returnType = null
            this.stockReturnForm.orderId = null
            this.stockReturnForm.receivingId = null
            this.stockReturnForm.customerId = null
            this.stockReturnForm.supplierId = null
            this.stockReturnForm.reason = ''
            this.stockReturnForm.notes = ''
            this.stockReturnForm.requestedBy = null
        },
        cancelStockSearchAction() {
            this.clearAction()
            this.searchForm.keyword = ''
        }
    },
    // 计算属性
    getters: {},
})
