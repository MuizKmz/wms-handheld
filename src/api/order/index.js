import {httpRequest} from '@/utils/util.request'

export default {
    getOrderByNo(orderNo) {
        return httpRequest({
            method: 'GET', 
            url: '/api/order/by-order-no/' + orderNo
        })
    },
    
    getOrderInfo(orderNo) {
        return httpRequest({
            method: 'GET', 
            url: '/api/order/by-order-no/' + orderNo
        })
    },
    
    getOrderProducts(orderId) {
        return httpRequest({
            method: 'GET', 
            url: '/api/order/' + orderId + '/products'
        })
    },
}
