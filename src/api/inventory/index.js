import {httpRequest} from '@/utils/util.request'

export default {
    getSearchList(params) {
        return httpRequest({method: 'GET', url: '/v1/handheld/inventory/search', params})
    },

    queryInventoryList(params) {
        // Updated to use EPC query endpoint with tagCodes
        return httpRequest({method: 'GET', url: '/api/epc/query-by-codes', params})
    },

    stockIn(data) {
        return httpRequest({method: 'POST', url: '/v1/handheld/inventory/stock-in', data})
    },

    stockTake(data) {
        return httpRequest({method: 'POST', url: '/v1/handheld/inventory/stock-take', data})
    },

    stockOut(data) {
        return httpRequest({method: 'POST', url: '/v1/handheld/inventory/stock-out', data})
    },

    stockReturn(data) {
        return httpRequest({method: 'POST', url: '/v1/handheld/inventory/stock-return', data})
    },

    testSession() {
        return httpRequest({method: 'GET', url: '/v1/handheld/inventory/info'})
    },

    bulkUpdateStatuses(ids, status) {
        return httpRequest({method: 'POST', url: '/api/epc/bulk-update-status', data: {ids, status}})
    },

    /**
     * Stock-out scan with order validation
     * @param {Object} data - { epcCodes: string[], orderNo: string, stockOutBy?: string }
     */
    stockOutScan(data) {
        return httpRequest({method: 'POST', url: '/api/epc/stock-out-scan', data})
    }
}