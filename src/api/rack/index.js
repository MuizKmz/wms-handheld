import {httpRequest} from '@/utils/util.request'

export default {
    getRackListByWarehouse(warehouseId) {
        return httpRequest({
            method: 'GET', 
            url: '/api/rack?warehouseId=' + warehouseId
        })
    },
}
