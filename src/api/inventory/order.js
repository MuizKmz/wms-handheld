import {httpRequest} from '@/utils/util.request'

export default {
    getOrderInfo(orderCode) {
        return httpRequest({method: 'GET', url: `/v1/handheld/order/info/${orderCode}`})
    },
}