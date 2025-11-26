import {httpRequest} from '@/utils/util.request'

export default {
    getOrderList(params) {
        return httpRequest({
            method: 'GET', 
            url: '/api/order',
            params
        })
    },
    
    getOrderByNo(orderNo) {
        return httpRequest({
            method: 'GET', 
            url: '/api/order/by-order-no/' + orderNo
        })
    },
    
    getOrderById(orderId) {
        return httpRequest({
            method: 'GET', 
            url: '/api/order/' + orderId
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
