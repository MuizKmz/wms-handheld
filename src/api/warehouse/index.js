import {httpRequest} from '@/utils/util.request'

export default {
    getWarehouseCodeNameList() {
        return httpRequest({method: 'GET', url: '/api/warehouse'})
    },
}