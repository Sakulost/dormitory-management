/**
 * Mock 数据层 — 种子数据 + localStorage 工具函数
 */

// ==================== 种子数据 ====================

const SEED_ADMINS = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    name: '系统管理员',
    phone: '13800000000',
    role: 'admin',
    createTime: '2024-01-01 00:00:00'
  }
]

const SEED_BUILDINGS = [
  {
    id: 1,
    buildingNo: 'A',
    name: '学生公寓A栋',
    floors: 6,
    capacity: 720,
    manager: '张阿姨',
    description: '男生宿舍楼',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    buildingNo: 'B',
    name: '学生公寓B栋',
    floors: 6,
    capacity: 720,
    manager: '李阿姨',
    description: '女生宿舍楼',
    createTime: '2024-01-01 00:00:00'
  },
  {
    id: 3,
    buildingNo: 'C',
    name: '学生公寓C栋',
    floors: 6,
    capacity: 480,
    manager: '王大叔',
    description: '研究生宿舍楼',
    createTime: '2024-01-01 00:00:00'
  }
]

const SEED_ROOMS = [
  { id: 1,  roomNo: 'A-101', buildingId: 1, buildingName: '学生公寓A栋', floor: 1, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 2,  roomNo: 'A-102', buildingId: 1, buildingName: '学生公寓A栋', floor: 1, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 3,  roomNo: 'A-103', buildingId: 1, buildingName: '学生公寓A栋', floor: 1, capacity: 6, occupied: 0, type: '6人间', price: 1000.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 4,  roomNo: 'A-201', buildingId: 1, buildingName: '学生公寓A栋', floor: 2, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 5,  roomNo: 'A-202', buildingId: 1, buildingName: '学生公寓A栋', floor: 2, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 6,  roomNo: 'A-301', buildingId: 1, buildingName: '学生公寓A栋', floor: 3, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 7,  roomNo: 'B-101', buildingId: 2, buildingName: '学生公寓B栋', floor: 1, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 8,  roomNo: 'B-102', buildingId: 2, buildingName: '学生公寓B栋', floor: 1, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 9,  roomNo: 'B-201', buildingId: 2, buildingName: '学生公寓B栋', floor: 2, capacity: 6, occupied: 0, type: '6人间', price: 1000.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 10, roomNo: 'B-202', buildingId: 2, buildingName: '学生公寓B栋', floor: 2, capacity: 4, occupied: 0, type: '4人间', price: 1200.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 11, roomNo: 'C-101', buildingId: 3, buildingName: '学生公寓C栋', floor: 1, capacity: 2, occupied: 0, type: '2人间', price: 2000.00, status: '可用', createTime: '2024-01-01 00:00:00' },
  { id: 12, roomNo: 'C-102', buildingId: 3, buildingName: '学生公寓C栋', floor: 1, capacity: 2, occupied: 0, type: '2人间', price: 2000.00, status: '可用', createTime: '2024-01-01 00:00:00' }
]

const SEED_STUDENTS = [
  { id: 1, studentNo: '2024001', name: '张三', gender: '男', major: '计算机科学与技术', className: '计科2401', phone: '13800001001', idCard: '320100200001010001', roomId: null, roomNo: null, buildingId: null, buildingName: null, status: '未入住', createTime: '2024-01-01 00:00:00' },
  { id: 2, studentNo: '2024002', name: '李四', gender: '男', major: '计算机科学与技术', className: '计科2401', phone: '13800001002', idCard: '320100200001010002', roomId: null, roomNo: null, buildingId: null, buildingName: null, status: '未入住', createTime: '2024-01-01 00:00:00' },
  { id: 3, studentNo: '2024003', name: '王五', gender: '男', major: '软件工程',       className: '软工2401', phone: '13800001003', idCard: '320100200001010003', roomId: null, roomNo: null, buildingId: null, buildingName: null, status: '未入住', createTime: '2024-01-01 00:00:00' },
  { id: 4, studentNo: '2024004', name: '赵六', gender: '女', major: '信息管理',       className: '信管2401', phone: '13800001004', idCard: '320100200001010004', roomId: null, roomNo: null, buildingId: null, buildingName: null, status: '未入住', createTime: '2024-01-01 00:00:00' },
  { id: 5, studentNo: '2024005', name: '孙七', gender: '女', major: '数据科学',       className: '数据2401', phone: '13800001005', idCard: '320100200001010005', roomId: null, roomNo: null, buildingId: null, buildingName: null, status: '未入住', createTime: '2024-01-01 00:00:00' },
  { id: 6, studentNo: '2024006', name: '周八', gender: '男', major: '网络工程',       className: '网工2401', phone: '13800001006', idCard: '320100200001010006', roomId: null, roomNo: null, buildingId: null, buildingName: null, status: '未入住', createTime: '2024-01-01 00:00:00' }
]

const SEED_CHECK_RECORDS = []

const SEED_REPAIRS = [
  {
    id: 1,
    roomId: 1,
    buildingName: '学生公寓A栋',
    roomNo: 'A-101',
    studentId: 1,
    studentName: '张三',
    title: '水龙头漏水',
    description: 'A-101房间卫生间水龙头关不紧，持续滴水',
    status: '待处理',
    reportTime: '2024-03-15 09:00:00',
    finishTime: null,
    remark: null
  },
  {
    id: 2,
    roomId: 2,
    buildingName: '学生公寓A栋',
    roomNo: 'A-102',
    studentId: 2,
    studentName: '李四',
    title: '空调不制冷',
    description: 'A-102房间空调开启后不制冷，夏天无法正常使用',
    status: '处理中',
    reportTime: '2024-03-20 14:30:00',
    finishTime: null,
    remark: '已联系维修师傅'
  }
]

const SEED_VISITORS = [
  {
    id: 1,
    name: '张父',
    idCard: '320100197001010001',
    phone: '13900000001',
    visitedStudentId: 1,
    visitedStudentName: '张三',
    reason: '探望儿子',
    visitTime: '2026-06-15 14:00:00',
    leaveTime: null
  }
]

// ==================== localStorage 工具函数 ====================

const STORAGE_PREFIX = 'dormitory_'

/**
 * 从 localStorage 加载数据
 */
export function loadData(key) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 保存数据到 localStorage
 */
export function saveData(key, data) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data))
}

/**
 * 生成自增 ID（基于当前数组最大 ID + 1）
 */
export function generateId(key) {
  const data = loadData(key)
  if (!data || data.length === 0) return 1
  const maxId = data.reduce((max, item) => Math.max(max, item.id || 0), 0)
  return maxId + 1
}

/**
 * 获取当前时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
export function now() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/**
 * 获取当前日期字符串 (YYYY-MM-DD)
 */
export function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// ==================== 初始化 ====================

const SEED_DATA = {
  admins: SEED_ADMINS,
  buildings: SEED_BUILDINGS,
  rooms: SEED_ROOMS,
  students: SEED_STUDENTS,
  checkRecords: SEED_CHECK_RECORDS,
  repairs: SEED_REPAIRS,
  visitors: SEED_VISITORS
}

/**
 * 首次加载时初始化种子数据
 * 如果 localStorage 为空，则写入种子数据
 */
export function initData() {
  // 检查是否已初始化（以 admins 为标志）
  if (!loadData('admins')) {
    for (const [key, data] of Object.entries(SEED_DATA)) {
      saveData(key, data)
    }
  }
}
