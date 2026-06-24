<template>
  <div class="login-container">
    <div class="login-bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
    <div class="login-card">
      <div class="card-header">
        <div class="icon-circle">🏫</div>
        <h2>学生宿舍管理系统</h2>
        <p>Dormitory Management System</p>
      </div>
      <el-form :model="form" :rules="rules" ref="formRef" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"
            :prefix-icon="User" class="custom-input" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码"
            :prefix-icon="Lock" show-password class="custom-input"
            @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            登 录 系 统
          </el-button>
        </el-form-item>
      </el-form>
      <div class="card-footer">
        <span>默认账号: admin / 123456</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({ username: 'admin', password: '123456' })

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.doLogin(form.username, form.password)
    ElMessage.success('登录成功，欢迎回来！')
    router.push('/dashboard')
  } catch { /* handled */ }
  finally { loading.value = false }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  position: relative;
  overflow: hidden;
}

/* 背景动画形状 */
.login-bg-shapes { position: absolute; inset: 0; }
.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}
.shape-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #6366f1, transparent);
  top: -200px; right: -100px;
  animation-delay: 0s;
}
.shape-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #8b5cf6, transparent);
  bottom: -100px; left: -50px;
  animation-delay: -7s;
}
.shape-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #a78bfa, transparent);
  top: 50%; left: 60%;
  animation-delay: -14s;
}
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

/* 登录卡片 */
.login-card {
  width: 420px;
  padding: 48px 40px 36px;
  background: rgba(255,255,255,0.97);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.4);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}
.card-header { text-align: center; margin-bottom: 36px; }
.icon-circle {
  width: 70px; height: 70px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(99,102,241,0.35);
}
.card-header h2 {
  font-size: 24px;
  color: #1a1a2e;
  margin: 0 0 6px;
  font-weight: 700;
  letter-spacing: 2px;
}
.card-header p {
  color: #909399;
  font-size: 13px;
  margin: 0;
  letter-spacing: 1px;
}

/* 输入框 */
.custom-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e4e7ed inset;
  transition: all 0.3s;
  padding: 2px 12px;
}
.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}
.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1 inset !important;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  transition: all 0.3s ease;
}
.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99,102,241,0.45);
}
.login-btn:active { transform: translateY(0); }

.card-footer {
  text-align: center;
  margin-top: 20px;
}
.card-footer span {
  color: #c0c4cc;
  font-size: 13px;
}
</style>
