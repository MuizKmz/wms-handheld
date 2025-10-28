import {httpRequest} from '@/utils/util.request'

export default {
    /**
     * 获取配置
     */
    getConfig(groupId) {
        return httpRequest({method: 'GET', url: `/config/app/list/${groupId}`})
    },
    /**
     * 获取字典
     */
    getDicList(typeCode) {
        return httpRequest({method: 'GET', url: `/dic/app/list/${typeCode}`})
    },
    getUploadPresignedUrl(params) {
        return httpRequest({method: 'GET', url: '/upload/presigned-url', params})
    },
}