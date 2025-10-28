import {httpRequest} from '@/utils/util.request'

export default {
    /**
     * Login against new NestJS backend ( /api/auth/login )
     * Accepts payload with either { username, password } or { email, password }.
     * Backend expects 'email'; we map username -> email if provided.
     */
    login(payload) {
        const data = {
            email: payload.email || payload.username || '',
            password: payload.password
        }
        return httpRequest({method: 'POST', url: '/api/auth/login', data})
    },
    /**
     * Stateless JWT logout: just resolve success client-side.
     */
    logout() {
        return Promise.resolve({success: true})
    },
    /**
     * Fetch user by id (requires id). If no id provided, resolves gracefully.
     */
    getUserInfo(id) {
        if (!id) return Promise.resolve({success: false, msg: 'Missing user id'})
        return httpRequest({method: 'GET', url: `/api/auth/users/${id}`})
    },
}