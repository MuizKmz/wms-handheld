import auth from './auth'
import pub from './pub'
import handheld from './pub/handheld'
import inventory from './inventory'
import product from './product'
import receiving from './inventory/receiving'
import order from './inventory/order'
import supplier from './supplier'
import warehouse from './warehouse'
import epc from './epc'

export default {
    ...auth,
    ...pub,
    ...handheld,
    ...inventory,
    ...product,
    ...receiving,
    ...order,
    ...supplier,
    ...warehouse,
    ...epc
}