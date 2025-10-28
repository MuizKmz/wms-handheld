import {httpRequest} from '@/utils/util.request'

export default {
    getReceivingPage(params) {
        return httpRequest({method: 'GET', url: '/api/receiving', params})
    },
    getReceivingList(params) {
        return httpRequest({method: 'GET', url: '/api/receiving', params})
    },
    getReceivingById(id) {
        return httpRequest({method: 'GET', url: '/api/receiving/' + id})
    },
    saveReceiving(data) {
        return httpRequest({method: 'POST', url: '/api/receiving', data})
    },
    deleteReceiving(id) {
        return httpRequest({method: 'DELETE', url: '/api/receiving/' + id})
    },
}