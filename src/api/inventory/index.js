import {httpRequest} from '@/utils/util.request'

export default {
    getSearchList(params) {
        return httpRequest({method: 'GET', url: '/v1/handheld/inventory/search', params})
    },

    queryInventoryList(params) {
        return httpRequest({method: 'GET', url: '/v1/handheld/inventory/list', params})
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

}