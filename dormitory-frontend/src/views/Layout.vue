<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="aside">
      <div class="logo">
        <span class="logo-icon">🏫</span>
        <span class="logo-text">宿舍管理系统</span>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        class="side-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>系统首页</span>
        </el-menu-item>
        <el-menu-item index="/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/buildings">
          <el-icon><OfficeBuilding /></el-icon>
          <span>宿舍楼管理</span>
        </el-menu-item>
        <el-menu-item index="/rooms">
          <el-icon><House /></el-icon>
          <span>房间管理</span>
        </el-menu-item>
        <el-menu-item index="/check-records">
          <el-icon><Switch /></el-icon>
          <span>入退宿管理</span>
        </el-menu-item>
        <el-menu-item index="/repairs">
          <el-icon><Tools /></el-icon>
          <span>报修管理</span>
        </el-menu-item>
        <el-menu-item index="/visitors">
          <el-icon><Avatar /></el-icon>
          <span>访客管理</span>
        </el-menu-item>
      </el-menu>
      <div class="aside-footer">
        <span>v1.0.0</span>
      </div>
    </el-aside>

    <!-- 主体 -->
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <span class="breadcrumb-icon">📋</span>
          <span class="breadcrumb">{{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <span class="time">{{ currentTime }}</span>
          <el-divider direction="vertical" />
          <el-avatar :size="32" class="avatar">
            {{ (userStore.userInfo?.name || '管')[0] }}
          </el-avatar>
          <span class="admin-name">{{ userStore.userInfo?.name || '管理员' }}</span>
          <el-button type="danger" text @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const currentTime = ref('')

let timer = null
onMounted(() => {
  userStore.fetchUserInfo()
  updateTime()
  timer = setInterval(updateTime, 60000)
})
onUnmounted(() => clearInterval(timer))

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'long', hour: '2-digit', minute: '2-digit'
  })
}

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { min-height: 100vh; }

/* 侧边栏 */
.aside {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0,0,0,0.15);
  position: relative;
}
.aside::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}
.logo {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0 20px;
}
.logo-icon { font-size: 28px; }
.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #e0e7ff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.side-menu {
  border-right: none;
  background: transparent;
  flex: 1;
  padding: 8px 0;
}
.side-menu .el-menu-item {
  margin: 4px 12px;
  border-radius: 10px;
  height: 48px;
  line-height: 48px;
  color: #a8b2d1;
  font-size: 14px;
  transition: all 0.3s ease;
}
.side-menu .el-menu-item:hover {
  background: rgba(255,255,255,0.08);
  color: #e0e7ff;
  transform: translateX(4px);
}
.side-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3));
  color: #fff;
  box-shadow: 0 4px 15px rgba(99,102,241,0.3);
  font-weight: 600;
}
.aside-footer {
  padding: 12px;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

/* 头部 */
.main-container { background: #f0f2f5; }
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e8eaed;
  box-shadow: 0 1px 8px rgba(0,0,0,0.04);
  height: 60px;
  padding: 0 24px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.breadcrumb-icon { font-size: 18px; }
.breadcrumb {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.time { color: #909399; font-size: 13px; }
.avatar {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
}
.admin-name { color: #303133; font-size: 14px; font-weight: 500; }

/* 主体内容 */
.main-content {
  padding: 24px;
  min-height: calc(100vh - 60px);
}

/* 页面切换动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
