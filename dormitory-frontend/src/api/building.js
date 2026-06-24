import request from '../utils/request'

export function getBuildings(params) {
  return request.get('/buildings', { params })
}

export function getAllBuildings() {
  return request.get('/buildings/all')
}

export function addBuilding(data) {
  return request.post('/building', data)
}

export function updateBuilding(data) {
  return request.put('/building', data)
}

export function deleteBuilding(id) {
  return request.delete(`/building/${id}`)
}
