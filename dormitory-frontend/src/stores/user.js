import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getAdminInfo } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  async function doLogin(username, password) {
    const res = await login(username, password)
    token.value = res.data.token
    localStorage.setItem('token', token.value)
    await fetchUserInfo()
  }

  async function fetchUserInfo() {
    const res = await getAdminInfo()
    userInfo.value = res.data
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return { token, userInfo, doLogin, fetchUserInfo, logout }
})
