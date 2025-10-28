import {httpRequest} from '@/utils/util.request'

export default {
    getWarehouseCodeNameList() {
        return httpRequest({method: 'GET', url: '/v1/handheld/warehouse/code-name-list'})
    },
}