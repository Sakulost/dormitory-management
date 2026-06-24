import request from '../utils/request'

export function getVisitors(params) {
  return request.get('/visitors', { params })
}

export function addVisitor(data) {
  return request.post('/visitor', data)
}

export function updateVisitor(id, data) {
  return request.put(`/visitor/${id}`, data)
}

export function visitorLeave(id) {
  return request.put(`/visitor/${id}/leave`)
}
