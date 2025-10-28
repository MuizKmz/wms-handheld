import {httpRequest} from '@/utils/util.request'

export default {
    getReceivingPage(params) {
        return httpRequest({method: 'GET', url: '/v1/handheld/receiving/index', params})
    },
    getReceivingList(doNumber) {
        return httpRequest({method: 'GET', url: `/v1/handheld/receiving/list/${doNumber}`})
    },
    getReceivingAttributeList() {
        return httpRequest({method: 'GET', url: '/v1/handheld/receiving/attribute/list'})
    },
    saveReceiving(data) {
        return httpRequest({method: 'POST', url: '/v1/handheld/receiving/save', data})
    },
    deleteReceiving(id) {
        return httpRequest({method: 'DELETE', url: `/v1/handheld/receiving/delete/${id}`})
    },
}