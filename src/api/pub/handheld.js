import {httpRequest} from '@/utils/util.request'

export default {
    getStockPurposeList() {
        return httpRequest({method: 'GET', url: '/v1/handheld/stock-purpose/selectList'})
    },
}