import {httpRequest} from '@/utils/util.request'

export default {
    getLocationListByWarehouse(warehouseId) {
        return httpRequest({
            method: 'GET',
            url: '/api/location?warehouseId=' + warehouseId
        })
    },
}
