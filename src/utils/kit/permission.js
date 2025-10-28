import {useUserStore} from '@/store/user'

const hasPermission = (perm) => {
    const userStore = useUserStore()
    let permissionSet = new Set(userStore.info?.permissionList || [])
    // console.log('permissionSet', permissionSet)
    // console.log('perm', perm)
    return permissionSet.has(perm)
}


export default {
    hasPermission
}