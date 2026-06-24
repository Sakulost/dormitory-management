<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <h2>👋 欢迎回来，{{ userStore.userInfo?.name || '管理员' }}</h2>
        <p>以下是宿舍管理系统的数据概览</p>
      </div>
      <div class="banner-date">{{ today }}</div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="24">
      <el-col :span="8" v-for="card in cards" :key="card.label">
        <div class="stat-card" :class="card.theme" @click="$router.push(card.link)">
          <div class="card-top">
            <div class="card-info">
              <span class="card-label">{{ card.label }}</span>
              <span class="card-value">{{ card.value }}</span>
            </div>
            <div class="card-icon" :style="{ background: card.bg }">
              <el-icon :size="28" :color="card.color">
                <component :is="card.icon" />
              </el-icon>
            </div>
          </div>
          <div class="card-bottom">
            <span>{{ card.desc }}</span>
            <el-icon :size="14"><ArrowRight /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-row :gutter="24" style="margin-top:24px">
      <el-col :span="12">
        <el-card class="quick-card" shadow="hover">
          <template #header>
            <div class="quick-header">
              <span>🔧 快捷操作</span>
            </div>
          </template>
          <el-row :gutter="12">
            <el-col :span="8" v-for="action in quickActions" :key="action.label">
              <div class="quick-action" @click="$router.push(action.link)">
                <div class="action-icon" :style="{ background: action.bg }">
                  <el-icon :size="22" :color="action.color"><component :is="action.icon" /></el-icon>
                </div>
                <span>{{ action.label }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="quick-card" shadow="hover">
          <template #header>
            <div class="quick-header">
              <span>📊 住宿率概览</span>
            </div>
          </template>
          <div class="occupancy-bar">
            <div class="bar-item" v-for="b in occupancyData" :key="b.name">
              <div class="bar-label">
                <span>{{ b.name }}</span>
                <span>{{ b.percent }}%</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: b.percent + '%', background: b.color }"></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getDashboard } from '../api/dashboard'
import { User, House, Tools, Avatar, Plus, Search, Switch, ArrowRight } from '@element-plus/icons-vue'

const userStore = useUserStore()

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
})

const dashboardData = ref({})
const cards = computed(() => [
  { label: '学生总数', value: dashboardData.value.totalStudents || 0,
    icon: User, color: '#6366f1', bg: 'rgba(99,102,241,0.1)',
    desc: '系统注册学生', link: '/students', theme: 'purple' },
  { label: '已入住', value: dashboardData.value.checkedInStudents || 0,
    icon: House, color: '#10b981', bg: 'rgba(16,185,129,0.1)',
    desc: '已分配宿舍', link: '/check-records', theme: 'green' },
  { label: '房间总数', value: dashboardData.value.totalRooms || 0,
    icon: House, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
    desc: '可用/已满/维修中', link: '/rooms', theme: 'orange' },
  { label: '已占用房间', value: dashboardData.value.occupiedRooms || 0,
    icon: House, color: '#ef4444', bg: 'rgba(239,68,68,0.1)',
    desc: '有学生入住', link: '/rooms', theme: 'red' },
  { label: '待处理报修', value: dashboardData.value.pendingRepairs || 0,
    icon: Tools, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',
    desc: '需要处理', link: '/repairs', theme: 'violet' },
  { label: '今日访客', value: dashboardData.value.todayVisitors || 0,
    icon: Avatar, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',
    desc: '今日来访记录', link: '/visitors', theme: 'cyan' }
])

const quickActions = [
  { label: '新增学生', icon: Plus, link: '/students', bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  { label: '查询房间', icon: Search, link: '/rooms', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  { label: '办理入住', icon: Switch, link: '/check-records', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  { label: '提交报修', icon: Tools, link: '/repairs', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
  { label: '登记访客', icon: Avatar, link: '/visitors', bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  { label: '学生管理', icon: User, link: '/students', bg: 'rgba(6,182,212,0.1)', color: '#06b6d4' }
]

const occupancyData = computed(() => {
  const total = dashboardData.value.totalRooms || 1
  const occupied = dashboardData.value.occupiedRooms || 0
  const vacant = total - occupied
  return [
    { name: '已占用', percent: Math.round(occupied / total * 100), color: 'linear-gradient(90deg, #6366f1, #8b5cf6)' },
    { name: '空闲', percent: Math.round(vacant / total * 100), color: 'linear-gradient(90deg, #10b981, #34d399)' }
  ]
})

onMounted(async () => {
  try { const res = await getDashboard(); dashboardData.value = res.data } catch {}
})
</script>

<style scoped>
.dashboard { max-width: 1400px; }

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 20px rgba(99,102,241,0.3);
}
.banner-content h2 { margin: 0 0 6px; font-size: 22px; font-weight: 700; }
.banner-content p { margin: 0; opacity: 0.85; font-size: 14px; }
.banner-date {
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  backdrop-filter: blur(4px);
}

/* 统计卡片 */
.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  position: relative;
}
.stat-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  transition: height 0.3s;
}
.stat-card.purple::after { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
.stat-card.green::after { background: linear-gradient(90deg, #10b981, #34d399); }
.stat-card.orange::after { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.stat-card.red::after { background: linear-gradient(90deg, #ef4444, #f87171); }
.stat-card.violet::after { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
.stat-card.cyan::after { background: linear-gradient(90deg, #06b6d4, #22d3ee); }
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
.stat-card:hover::after { height: 4px; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.card-info { display: flex; flex-direction: column; }
.card-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.card-value { font-size: 36px; font-weight: 800; color: #1a1a2e; line-height: 1; }
.card-icon {
  width: 56px; height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-bottom {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

/* 快捷操作 */
.quick-card {
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  margin-bottom: 0;
}
.quick-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.quick-card :deep(.el-card__body) { padding: 16px 20px; }
.quick-header { font-size: 16px; font-weight: 600; color: #1a1a2e; }
.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}
.quick-action:hover { background: #f8f9ff; transform: translateY(-2px); }
.action-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.quick-action span { font-size: 13px; color: #606266; }

/* 住宿率 */
.occupancy-bar { display: flex; flex-direction: column; gap: 20px; padding: 8px 0; }
.bar-item { display: flex; flex-direction: column; gap: 8px; }
.bar-label { display: flex; justify-content: space-between; font-size: 14px; color: #606266; }
.bar-track {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
}
</style>
