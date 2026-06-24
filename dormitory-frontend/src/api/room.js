import request from '../utils/request'

export function getRooms(params) {
  return request.get('/rooms', { params })
}

export function getRoomsByBuilding(buildingId) {
  return request.get(`/rooms/building/${buildingId}`)
}

export function getRoom(id) {
  return request.get(`/room/${id}`)
}

export function addRoom(data) {
  return request.post('/room', data)
}

export function updateRoom(data) {
  return request.put('/room', data)
}

export function deleteRoom(id) {
  return request.delete(`/room/${id}`)
}
