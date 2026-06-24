import request from '../utils/request'

export function login(username, password) {
  return request.post('/login', { username, password })
}

export function getAdminInfo() {
  return request.get('/admin/info')
}
