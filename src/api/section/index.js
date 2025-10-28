import {httpRequest} from '@/utils/util.request'

export default {
    getSectionListByRack(rackId) {
        return httpRequest({
            method: 'GET', 
            url: '/api/section?rackId=' + rackId
        })
    },
}
