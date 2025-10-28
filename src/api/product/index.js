import {httpRequest} from '@/utils/util.request'

export default {
    getProductList(params) {
        return httpRequest({method: 'GET', url: '/v1/handheld/product/list', params})
    },
}