import request from '../utils/request'

export function getCheckRecords(params) {
  return request.get('/check-records', { params })
}

export function checkIn(studentId, roomId) {
  return request.post('/check-in', { studentId, roomId })
}

export function checkOut(studentId, roomId) {
  return request.post('/check-out', { studentId, roomId })
}
