import { httpRequest } from '@/utils/util.request'

export default {
  getEpcByCode(epcCode) {
    return httpRequest({ method: 'GET', url: `/api/epc/code/${encodeURIComponent(epcCode)}` })
  },
  getEpcsByReceiving(receivingId, status) {
    const params = status ? { status } : {}
    return httpRequest({ 
      method: 'GET', 
      url: `/api/epc/by-receiving/${receivingId}`,
      params 
    })
  },
  updateEpcStatusByCode(epcCode, status) {
    return httpRequest({ method: 'PATCH', url: `/api/epc/code/${encodeURIComponent(epcCode)}/status`, data: { status } })
  },
  bulkUpdateStatuses(ids, status) {
    return httpRequest({ method: 'POST', url: '/api/epc/bulk-update-status', data: { ids, status } })
  },
  stockInScan(data) {
    return httpRequest({ 
      method: 'POST', 
      url: '/api/epc/stock-in-scan', 
      data 
    })
  },
  stockOutScan(data) {
    return httpRequest({ 
      method: 'POST', 
      url: '/api/epc/stock-out-scan', 
      data 
    })
  }
}
