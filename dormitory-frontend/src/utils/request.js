/**
 * Mock 请求层 — 拦截所有 API 调用，转发到本地 mock 服务
 * 保持与原 Axios 实例完全相同的调用接口（get/post/put/delete）
 */

import { ElMessage } from 'element-plus'
import { initData } from '../mock/data'
import * as services from '../mock/services'

// 首次加载时初始化种子数据
initData()

/**
 * 从 URL 提取路径参数
 * 例如: matchPath('/student/5', '/student/:id') → { id: '5' }
 */
function matchPath(url, pattern) {
  const urlParts = url.split('/')
  const patternParts = pattern.split('/')
  if (urlParts.length !== patternParts.length) return null
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = urlParts[i]
    } else if (patternParts[i] !== urlParts[i]) {
      return null
    }
  }
  return params
}

/**
 * 路由表 — [HTTP方法, URL模式, 处理函数]
 * 支持 :param 路径参数
 */
const routes = [
  // Auth
  ['POST', '/login',             services.login],
  ['GET',  '/admin/info',        services.getAdminInfo],

  // Dashboard
  ['GET',  '/dashboard',         services.getDashboard],

  // Students
  ['GET',    '/students',        services.getStudents],
  ['GET',    '/student/:id',     services.getStudent],
  ['POST',   '/student',         services.addStudent],
  ['PUT',    '/student',         services.updateStudent],
  ['DELETE', '/student/:id',     services.deleteStudent],

  // Buildings
  ['GET',    '/buildings',       services.getBuildings],
  ['GET',    '/buildings/all',   services.getAllBuildings],
  ['POST',   '/building',        services.addBuilding],
  ['PUT',    '/building',        services.updateBuilding],
  ['DELETE', '/building/:id',    services.deleteBuilding],

  // Rooms
  ['GET',    '/rooms',           services.getRooms],
  ['GET',    '/rooms/building/:buildingId', services.getRoomsByBuilding],
  ['GET',    '/room/:id',        services.getRoom],
  ['POST',   '/room',            services.addRoom],
  ['PUT',    '/room',            services.updateRoom],
  ['DELETE', '/room/:id',        services.deleteRoom],

  // Check Records
  ['GET',    '/check-records',   services.getCheckRecords],
  ['POST',   '/check-in',        services.checkIn],
  ['POST',   '/check-out',       services.checkOut],

  // Repairs
  ['GET',    '/repairs',         services.getRepairs],
  ['POST',   '/repair',          services.addRepair],
  ['PUT',    '/repair/:id/status', services.updateRepairStatus],

  // Visitors
  ['GET',    '/visitors',        services.getVisitors],
  ['POST',   '/visitor',         services.addVisitor],
  ['PUT',    '/visitor/:id',     services.updateVisitor],
  ['PUT',    '/visitor/:id/leave', services.visitorLeave],
]

/**
 * 根据 method + url 查找路由处理函数
 */
function findHandler(method, url) {
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue
    if (pattern.includes(':')) {
      if (matchPath(url, pattern)) return handler
    } else if (url === pattern) {
      return handler
    }
  }
  return null
}

/**
 * 核心请求函数 — 模拟 Axios 的请求流程
 */
function request(config) {
  const handler = findHandler(config.method, config.url)

  if (!handler) {
    ElMessage.error(`接口不存在: ${config.method} ${config.url}`)
    return Promise.reject(new Error('接口不存在'))
  }

  try {
    const result = handler(config)

    if (result.code !== 200) {
      // 模拟原 response 拦截器的错误处理
      ElMessage.error(result.message || '操作失败')
      return Promise.reject(new Error(result.message))
    }

    // 成功时返回完整响应对象 { code, message, data }
    return Promise.resolve(result)
  } catch (e) {
    ElMessage.error(e.message || '系统错误')
    return Promise.reject(e)
  }
}

/**
 * 导出与 Axios 实例兼容的接口
 */
export default {
  get(url, config) {
    const params = config?.params || config
    return request({ method: 'GET', url, params })
  },
  post(url, data) {
    return request({ method: 'POST', url, data })
  },
  put(url, data) {
    return request({ method: 'PUT', url, data })
  },
  delete(url, config) {
    const params = config?.params || config
    return request({ method: 'DELETE', url, params })
  }
}
