import request from '../utils/request'

export function getStudents(params) {
  return request.get('/students', { params })
}

export function getStudent(id) {
  return request.get(`/student/${id}`)
}

export function addStudent(data) {
  return request.post('/student', data)
}

export function updateStudent(data) {
  return request.put('/student', data)
}

export function deleteStudent(id) {
  return request.delete(`/student/${id}`)
}
