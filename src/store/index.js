import {createPinia} from 'pinia'
import {createLocalStoragePlugin} from '../plugins/pinia/storage'
import {APP_KEY} from '@/config'

const pinia = createPinia()
pinia.use(createLocalStoragePlugin({key: `${APP_KEY}-pinia`, overwrite: true}))
export default pinia
