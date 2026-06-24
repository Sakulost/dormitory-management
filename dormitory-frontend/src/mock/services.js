/**
 * Mock 服务层 — 所有 API 接口的本地实现
 * 每个函数接收 { method, url, params, data } 配置对象
 * 返回 { code, message, data } 统一响应格式
 */

import { loadData, saveData, generateId, now, today } from './data'

// ==================== 工具函数 ====================

function success(data, message = 'success') {
  return { code: 200, message, data }
}

function fail(message = '操作失败') {
  return { code: 500, message }
}

/**
 * 从 URL 中提取路径参数
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
 * 分页处理
 */
function paginate(list, params) {
  const pageNum = parseInt(params?.pageNum) || 1
  const pageSize = parseInt(params?.pageSize) || 10
  const total = list.length
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  return {
    records: list.slice(start, end),
    total,
    pageNum,
    pageSize
  }
}

// ==================== Auth ====================

export function login(config) {
  const { username, password } = config.data || {}
  const admins = loadData('admins') || []
  const admin = admins.find(a => a.username === username && a.password === password)
  if (!admin) {
    return fail('用户名或密码错误')
  }
  const token = 'mock-token-' + admin.id + '-' + Date.now()
  return success({ token })
}

export function getAdminInfo() {
  const admins = loadData('admins') || []
  const admin = admins[0]
  if (!admin) return fail('管理员不存在')
  // 不返回 password
  const { password, ...info } = admin
  return success(info)
}

// ==================== Dashboard ====================

export function getDashboard() {
  const students = loadData('students') || []
  const rooms = loadData('rooms') || []
  const repairs = loadData('repairs') || []
  const visitors = loadData('visitors') || []
  const todayStr = today()

  return success({
    totalStudents: students.length,
    checkedInStudents: students.filter(s => s.status === '入住').length,
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter(r => r.occupied > 0).length,
    pendingRepairs: repairs.filter(r => r.status === '待处理').length,
    todayVisitors: visitors.filter(v => v.visitTime && v.visitTime.startsWith(todayStr)).length
  })
}

// ==================== Students ====================

export function getStudents(config) {
  let list = loadData('students') || []
  const params = config.params || {}

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(s =>
      (s.name && s.name.toLowerCase().includes(kw)) ||
      (s.studentNo && s.studentNo.toLowerCase().includes(kw)) ||
      (s.major && s.major.toLowerCase().includes(kw))
    )
  }
  if (params.gender) {
    list = list.filter(s => s.gender === params.gender)
  }
  if (params.status) {
    list = list.filter(s => s.status === params.status)
  }

  return success(paginate(list, params))
}

export function getStudent(config) {
  const { id } = matchPath(config.url, '/student/:id') || {}
  const students = loadData('students') || []
  const student = students.find(s => s.id === parseInt(id))
  if (!student) return fail('学生不存在')
  return success(student)
}

export function addStudent(config) {
  const data = config.data || {}
  const students = loadData('students') || []

  if (!data.studentNo || !data.name) {
    return fail('学号和姓名不能为空')
  }
  if (students.some(s => s.studentNo === data.studentNo)) {
    return fail('该学号已存在')
  }

  const newStudent = {
    id: generateId('students'),
    studentNo: data.studentNo,
    name: data.name,
    gender: data.gender || '男',
    major: data.major || '',
    className: data.className || '',
    phone: data.phone || '',
    idCard: data.idCard || '',
    roomId: data.roomId || null,
    roomNo: data.roomNo || null,
    buildingId: data.buildingId || null,
    buildingName: data.buildingName || null,
    status: data.status || '未入住',
    createTime: now()
  }

  students.push(newStudent)
  saveData('students', students)
  return success(null, '添加成功')
}

export function updateStudent(config) {
  const data = config.data || {}
  const students = loadData('students') || []
  const index = students.findIndex(s => s.id === data.id)
  if (index === -1) return fail('学生不存在')

  // 检查学号唯一性（排除自身）
  if (data.studentNo && students.some(s => s.studentNo === data.studentNo && s.id !== data.id)) {
    return fail('该学号已存在')
  }

  students[index] = { ...students[index], ...data }
  saveData('students', students)
  return success(null, '更新成功')
}

export function deleteStudent(config) {
  const { id } = matchPath(config.url, '/student/:id') || {}
  const students = loadData('students') || []
  const idx = students.findIndex(s => s.id === parseInt(id))
  if (idx === -1) return fail('学生不存在')
  students.splice(idx, 1)
  saveData('students', students)
  return success(null, '删除成功')
}

// ==================== Buildings ====================

export function getBuildings(config) {
  let list = loadData('buildings') || []
  const params = config.params || {}

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(b =>
      (b.name && b.name.toLowerCase().includes(kw)) ||
      (b.buildingNo && b.buildingNo.toLowerCase().includes(kw))
    )
  }

  return success(paginate(list, params))
}

export function getAllBuildings() {
  const list = loadData('buildings') || []
  return success(list)
}

export function addBuilding(config) {
  const data = config.data || {}
  const buildings = loadData('buildings') || []

  if (!data.name || !data.buildingNo) {
    return fail('楼栋名称和编号不能为空')
  }
  if (buildings.some(b => b.buildingNo === data.buildingNo)) {
    return fail('该楼栋编号已存在')
  }

  const newBuilding = {
    id: generateId('buildings'),
    buildingNo: data.buildingNo,
    name: data.name,
    floors: data.floors || 6,
    capacity: data.capacity || 0,
    manager: data.manager || '',
    description: data.description || '',
    createTime: now()
  }

  buildings.push(newBuilding)
  saveData('buildings', buildings)
  return success(null, '添加成功')
}

export function updateBuilding(config) {
  const data = config.data || {}
  const buildings = loadData('buildings') || []
  const index = buildings.findIndex(b => b.id === data.id)
  if (index === -1) return fail('楼栋不存在')

  const oldName = buildings[index].name
  buildings[index] = { ...buildings[index], ...data }

  // 同步更新关联房间的 buildingName
  if (data.name && data.name !== oldName) {
    const rooms = loadData('rooms') || []
    rooms.forEach(r => {
      if (r.buildingId === data.id) {
        r.buildingName = data.name
      }
    })
    saveData('rooms', rooms)
  }

  saveData('buildings', buildings)
  return success(null, '更新成功')
}

export function deleteBuilding(config) {
  const { id } = matchPath(config.url, '/building/:id') || {}
  const buildingId = parseInt(id)
  const buildings = loadData('buildings') || []
  const idx = buildings.findIndex(b => b.id === buildingId)
  if (idx === -1) return fail('楼栋不存在')

  // 级联删除关联房间
  let rooms = loadData('rooms') || []
  rooms = rooms.filter(r => r.buildingId !== buildingId)
  saveData('rooms', rooms)

  buildings.splice(idx, 1)
  saveData('buildings', buildings)
  return success(null, '删除成功')
}

// ==================== Rooms ====================

export function getRooms(config) {
  let list = loadData('rooms') || []
  const params = config.params || {}

  if (params.roomNo) {
    const kw = params.roomNo.toLowerCase()
    list = list.filter(r => r.roomNo && r.roomNo.toLowerCase().includes(kw))
  }
  if (params.buildingId) {
    list = list.filter(r => r.buildingId === parseInt(params.buildingId))
  }
  if (params.status) {
    list = list.filter(r => r.status === params.status)
  }

  return success(paginate(list, params))
}

export function getRoomsByBuilding(config) {
  const { buildingId } = matchPath(config.url, '/rooms/building/:buildingId') || {}
  const rooms = loadData('rooms') || []
  const list = rooms.filter(r => r.buildingId === parseInt(buildingId) && r.status === '可用')
  return success(list)
}

export function getRoom(config) {
  const { id } = matchPath(config.url, '/room/:id') || {}
  const rooms = loadData('rooms') || []
  const room = rooms.find(r => r.id === parseInt(id))
  if (!room) return fail('房间不存在')
  return success(room)
}

export function addRoom(config) {
  const data = config.data || {}
  const rooms = loadData('rooms') || []
  const buildings = loadData('buildings') || []

  if (!data.roomNo || !data.buildingId) {
    return fail('房间号和所属楼栋不能为空')
  }

  const building = buildings.find(b => b.id === data.buildingId)
  if (!building) return fail('所属楼栋不存在')

  const newRoom = {
    id: generateId('rooms'),
    roomNo: data.roomNo,
    buildingId: data.buildingId,
    buildingName: building.name,
    floor: data.floor || 1,
    capacity: data.capacity || 4,
    occupied: 0,
    type: data.type || '4人间',
    price: data.price || 1200,
    status: '可用',
    createTime: now()
  }

  rooms.push(newRoom)
  saveData('rooms', rooms)
  return success(null, '添加成功')
}

export function updateRoom(config) {
  const data = config.data || {}
  const rooms = loadData('rooms') || []
  const index = rooms.findIndex(r => r.id === data.id)
  if (index === -1) return fail('房间不存在')

  // 如果 buildingId 变更，更新 buildingName
  if (data.buildingId && data.buildingId !== rooms[index].buildingId) {
    const buildings = loadData('buildings') || []
    const building = buildings.find(b => b.id === data.buildingId)
    if (building) {
      data.buildingName = building.name
    }
  }

  rooms[index] = { ...rooms[index], ...data }
  saveData('rooms', rooms)
  return success(null, '更新成功')
}

export function deleteRoom(config) {
  const { id } = matchPath(config.url, '/room/:id') || {}
  const rooms = loadData('rooms') || []
  const idx = rooms.findIndex(r => r.id === parseInt(id))
  if (idx === -1) return fail('房间不存在')
  rooms.splice(idx, 1)
  saveData('rooms', rooms)
  return success(null, '删除成功')
}

// ==================== Check Records ====================

export function getCheckRecords(config) {
  let list = loadData('checkRecords') || []
  const params = config.params || {}

  if (params.type) {
    list = list.filter(r => r.type === params.type)
  }

  // 按时间倒序
  list = [...list].sort((a, b) => {
    if (a.checkDate > b.checkDate) return -1
    if (a.checkDate < b.checkDate) return 1
    return 0
  })

  return success(paginate(list, params))
}

export function checkIn(config) {
  const { studentId, roomId } = config.data || {}
  const students = loadData('students') || []
  const rooms = loadData('rooms') || []
  const records = loadData('checkRecords') || []

  const student = students.find(s => s.id === studentId)
  if (!student) return fail('学生不存在')

  const room = rooms.find(r => r.id === roomId)
  if (!room) return fail('房间不存在')
  if (room.status === '已满') return fail('该房间已满')
  if (room.status === '维修中') return fail('该房间维修中，无法入住')

  // 更新学生
  student.roomId = room.id
  student.roomNo = room.roomNo
  student.buildingId = room.buildingId
  student.buildingName = room.buildingName
  student.status = '入住'
  saveData('students', students)

  // 更新房间
  room.occupied += 1
  if (room.occupied >= room.capacity) {
    room.status = '已满'
  }
  saveData('rooms', rooms)

  // 创建记录
  const record = {
    id: generateId('checkRecords'),
    studentId: student.id,
    studentName: student.name,
    studentNo: student.studentNo,
    roomId: room.id,
    buildingName: room.buildingName,
    roomNo: room.roomNo,
    type: '入住',
    checkDate: now(),
    remark: ''
  }
  records.push(record)
  saveData('checkRecords', records)

  return success(null, '入住成功')
}

export function checkOut(config) {
  const { studentId, roomId } = config.data || {}
  const students = loadData('students') || []
  const rooms = loadData('rooms') || []
  const records = loadData('checkRecords') || []

  const student = students.find(s => s.id === studentId)
  if (!student) return fail('学生不存在')
  if (student.status !== '入住') return fail('该学生未入住')

  const room = rooms.find(r => r.id === roomId)
  if (!room) return fail('房间不存在')

  // 更新学生
  student.roomId = null
  student.roomNo = null
  student.buildingId = null
  student.buildingName = null
  student.status = '未入住'
  saveData('students', students)

  // 更新房间
  room.occupied = Math.max(0, room.occupied - 1)
  if (room.status === '已满' && room.occupied < room.capacity) {
    room.status = '可用'
  }
  saveData('rooms', rooms)

  // 创建记录
  const record = {
    id: generateId('checkRecords'),
    studentId: student.id,
    studentName: student.name,
    studentNo: student.studentNo,
    roomId: room.id,
    buildingName: room.buildingName,
    roomNo: room.roomNo,
    type: '退宿',
    checkDate: now(),
    remark: ''
  }
  records.push(record)
  saveData('checkRecords', records)

  return success(null, '退宿成功')
}

// ==================== Repairs ====================

export function getRepairs(config) {
  let list = loadData('repairs') || []
  const params = config.params || {}

  if (params.status) {
    list = list.filter(r => r.status === params.status)
  }

  // 按时间倒序
  list = [...list].sort((a, b) => {
    if (a.reportTime > b.reportTime) return -1
    if (a.reportTime < b.reportTime) return 1
    return 0
  })

  return success(paginate(list, params))
}

export function addRepair(config) {
  const data = config.data || {}
  const rooms = loadData('rooms') || []
  const repairs = loadData('repairs') || []

  if (!data.title || !data.roomId) {
    return fail('房间和报修标题不能为空')
  }

  const room = rooms.find(r => r.id === data.roomId)
  if (!room) return fail('房间不存在')

  // 查找该房间内的学生（若有已入住的学生则关联第一个）
  const students = loadData('students') || []
  const occupant = students.find(s => s.roomId === room.id && s.status === '入住')

  const newRepair = {
    id: generateId('repairs'),
    roomId: room.id,
    buildingName: room.buildingName,
    roomNo: room.roomNo,
    studentId: occupant ? occupant.id : null,
    studentName: occupant ? occupant.name : '',
    title: data.title,
    description: data.description || '',
    status: '待处理',
    reportTime: now(),
    finishTime: null,
    remark: null
  }

  repairs.push(newRepair)
  saveData('repairs', repairs)
  return success(null, '报修提交成功')
}

export function updateRepairStatus(config) {
  const { id } = matchPath(config.url, '/repair/:id/status') || {}
  const { status, remark } = config.data || {}
  const repairs = loadData('repairs') || []
  const repair = repairs.find(r => r.id === parseInt(id))
  if (!repair) return fail('报修记录不存在')

  repair.status = status
  repair.remark = remark || ''
  if (status === '已完成') {
    repair.finishTime = now()
  }

  saveData('repairs', repairs)
  return success(null, '更新成功')
}

// ==================== Visitors ====================

export function getVisitors(config) {
  let list = loadData('visitors') || []
  const params = config.params || {}

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(v =>
      (v.name && v.name.toLowerCase().includes(kw)) ||
      (v.idCard && v.idCard.toLowerCase().includes(kw))
    )
  }

  // 按时间倒序
  list = [...list].sort((a, b) => {
    if (a.visitTime > b.visitTime) return -1
    if (a.visitTime < b.visitTime) return 1
    return 0
  })

  return success(paginate(list, params))
}

export function addVisitor(config) {
  const data = config.data || {}
  const visitors = loadData('visitors') || []

  if (!data.name || !data.idCard) {
    return fail('访客姓名和身份证号不能为空')
  }

  let visitedStudentName = ''
  if (data.visitedStudentId) {
    const students = loadData('students') || []
    const student = students.find(s => s.id === data.visitedStudentId)
    if (student) {
      visitedStudentName = student.name
    }
  }

  const newVisitor = {
    id: generateId('visitors'),
    name: data.name,
    idCard: data.idCard,
    phone: data.phone || '',
    visitedStudentId: data.visitedStudentId || null,
    visitedStudentName,
    reason: data.reason || '',
    visitTime: data.visitTime || now(),
    leaveTime: null
  }

  visitors.push(newVisitor)
  saveData('visitors', visitors)
  return success(null, '登记成功')
}

export function updateVisitor(config) {
  const { id } = matchPath(config.url, '/visitor/:id') || {}
  const data = config.data || {}
  const visitors = loadData('visitors') || []
  const index = visitors.findIndex(v => v.id === parseInt(id))
  if (index === -1) return fail('访客记录不存在')

  // 更新被访学生姓名
  if (data.visitedStudentId && data.visitedStudentId !== visitors[index].visitedStudentId) {
    const students = loadData('students') || []
    const student = students.find(s => s.id === data.visitedStudentId)
    if (student) {
      data.visitedStudentName = student.name
    }
  }

  visitors[index] = { ...visitors[index], ...data }
  saveData('visitors', visitors)
  return success(null, '更新成功')
}

export function visitorLeave(config) {
  const { id } = matchPath(config.url, '/visitor/:id/leave') || {}
  const visitors = loadData('visitors') || []
  const visitor = visitors.find(v => v.id === parseInt(id))
  if (!visitor) return fail('访客记录不存在')
  if (visitor.leaveTime) return fail('该访客已离开')

  visitor.leaveTime = now()
  saveData('visitors', visitors)
  return success(null, '已记录离开')
}
