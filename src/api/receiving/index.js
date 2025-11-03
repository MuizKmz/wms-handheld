import {httpRequest} from '@/utils/util.request'

export default {
    saveReceiving(data) {
        return httpRequest({
            method: 'POST', 
            url: '/api/receiving',
            data
        })
    },
    
    getReceivingList(params) {
        return httpRequest({
            method: 'GET', 
            url: '/api/receiving',
            params
        })
    },
    
    getReceivingById(id) {
        return httpRequest({
            method: 'GET', 
            url: '/api/receiving/' + id
        })
    },
    
    getReceivingByDoNumber(doNumber) {
        return httpRequest({
            method: 'GET', 
            url: '/api/receiving/do/' + encodeURIComponent(doNumber)
        })
    },
    
    getReceivingByOrderNo(orderNo) {
        return httpRequest({
            method: 'GET', 
            url: '/api/receiving/by-order-no/' + encodeURIComponent(orderNo)
        })
    }
}
