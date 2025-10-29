import { httpRequest } from '@/utils/util.request'
import receivingApi from '../receiving'
import epcApi from '../epc'
import inventoryApi from '../inventory'

export default {
  // Get receiving data by DO number
  getReceivingByDO(doNumber) {
    return receivingApi.getReceivingByDoNumber(doNumber)
  },

  // Scan EPC during stock-in
  scanEpc(data) {
    return epcApi.stockInScan(data)
  },

  // Update inventory after stock-in complete
  updateInventory(data) {
    return inventoryApi.updateFromStockIn(data)
  },

  // Batch update inventory for multiple products
  batchUpdateInventory(items) {
    return inventoryApi.batchUpdateFromStockIn(items)
  },

  // Get EPC details
  getEpcByCode(epcCode) {
    return epcApi.getEpcByCode(epcCode)
  }
}
