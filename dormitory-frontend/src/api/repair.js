import request from '../utils/request'

export function getRepairs(params) {
  return request.get('/repairs', { params })
}

export function addRepair(data) {
  return request.post('/repair', data)
}

export function updateRepairStatus(id, status, remark) {
  return request.put(`/repair/${id}/status`, { status, remark })
}
