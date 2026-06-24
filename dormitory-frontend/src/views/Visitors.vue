<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <span class="title-icon">🪪</span>
        <span>访客管理</span>
      </div>
      <el-button type="primary" class="btn-gradient" @click="showAddDialog">
        <el-icon><Plus /></el-icon>登记访客
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="keyword" placeholder="访客姓名/身份证号" clearable :prefix-icon="Search"
            @keyup.enter="loadData" class="search-input" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData"><el-icon><Search /></el-icon>搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" stripe v-loading="loading" class="data-table">
        <el-table-column prop="name" label="访客姓名" width="100">
          <template #default="{ row }"><span class="visitor-name">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column label="被访学生" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.visitedStudentName" effect="light" type="primary">
              {{ row.visitedStudentName }}
            </el-tag>
            <span v-else style="color:#c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="事由" min-width="120" show-overflow-tooltip />
        <el-table-column prop="visitTime" label="来访时间" width="170" />
        <el-table-column label="离开时间" width="170">
          <template #default="{ row }">
            <span v-if="row.leaveTime">{{ row.leaveTime }}</span>
            <el-tag v-else type="warning" effect="dark" size="small">未离开</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.leaveTime" size="small" type="danger" link @click="handleLeave(row)">
              记录离开
            </el-button>
            <span v-else style="color:#c0c4cc">已离开</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData" @current-change="loadData" background />
      </div>
    </div>

    <!-- 登记访客 -->
    <el-dialog title="登记访客" v-model="dialogVisible" width="500px" @closed="resetForm" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="访客姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="被访学生">
          <el-select v-model="form.visitedStudentId" filterable placeholder="搜索学生" style="width:100%">
            <el-option v-for="s in students" :key="s.id" :label="`${s.name} (${s.studentNo})`" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="来访事由">
          <el-input v-model="form.reason" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="来访时间" prop="visitTime">
          <el-date-picker v-model="form.visitTime" type="datetime" placeholder="选择时间" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getVisitors, addVisitor, visitorLeave } from '../api/visitor'
import { getStudents } from '../api/student'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const loading = ref(false), tableData = ref([]), students = ref([]), keyword = ref('')
const pageNum = ref(1), pageSize = ref(10), total = ref(0)
const dialogVisible = ref(false), formRef = ref(null)
const form = reactive({ name: '', idCard: '', phone: '', visitedStudentId: null, reason: '', visitTime: new Date() })
const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  idCard: [{ required: true, message: '请输入身份证号' }],
  visitTime: [{ required: true, message: '请选择来访时间' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getVisitors({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value }); tableData.value = res.data.records; total.value = res.data.total } finally { loading.value = false }
}
async function loadStudents() { const res = await getStudents({ pageSize: 1000, pageNum: 1 }); students.value = res.data.records }
function showAddDialog() { form.visitTime = new Date(); dialogVisible.value = true }
function resetForm() { formRef.value?.resetFields(); Object.assign(form, { name: '', idCard: '', phone: '', visitedStudentId: null, reason: '', visitTime: new Date() }) }
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try { await addVisitor(form); ElMessage.success('登记成功'); dialogVisible.value = false; loadData() } catch {}
}
async function handleLeave(row) {
  try { await visitorLeave(row.id); ElMessage.success('已记录离开'); loadData() } catch {}
}
onMounted(() => { loadData(); loadStudents() })
</script>

<style scoped>
.page-container { max-width: 1400px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: #1a1a2e; }
.title-icon { font-size: 26px; }
.btn-gradient { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; padding: 10px 22px; font-weight: 600; transition: all 0.3s; }
.btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
.search-bar { background: #fff; border-radius: 14px; padding: 20px 24px 4px; margin-bottom: 16px; border: 1px solid #f0f0f0; }
.search-input { width: 220px; }
.search-input :deep(.el-input__wrapper) { border-radius: 8px; }
.table-card { background: #fff; border-radius: 14px; padding: 4px; border: 1px solid #f0f0f0; overflow: hidden; }
.data-table { --el-table-header-bg-color: #f8f9ff; }
.data-table :deep(th) { font-weight: 600; color: #1a1a2e; font-size: 13px; }
.data-table :deep(.el-table__row:hover) { background: #f8f9ff; }
.visitor-name { font-weight: 600; color: #1a1a2e; }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 20px; }
</style>
