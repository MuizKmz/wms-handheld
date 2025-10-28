import {httpRequest} from '@/utils/util.request'

export default {
    getSupplierList() {
        return httpRequest({method: 'GET', url: '/api/supplier'})
    },
}