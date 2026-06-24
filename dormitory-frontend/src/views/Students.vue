<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title">
        <span class="title-icon">👨‍🎓</span>
        <span>学生管理</span>
      </div>
      <el-button type="primary" class="btn-gradient" @click="showAddDialog">
        <el-icon><Plus /></el-icon>新增学生
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="姓名/学号/专业" clearable
            :prefix-icon="Search" class="search-input" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="searchForm.gender" placeholder="全部" clearable style="width:100px">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width:110px">
            <el-option label="入住" value="入住" />
            <el-option label="未入住" value="未入住" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="tableData" stripe v-loading="loading" style="width:100%" class="data-table">
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100">
          <template #default="{ row }">
            <span class="student-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="70">
          <template #default="{ row }">
            <el-tag :type="row.gender==='男'?'':'danger'" effect="light" size="small">
              {{ row.gender }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="major" label="专业" min-width="140" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column label="房间" min-width="150">
          <template #default="{ row }">
            <el-tag v-if="row.roomNo" type="success" effect="light">
              {{ row.buildingName }}-{{ row.roomNo }}
            </el-tag>
            <span v-else class="no-room">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <span class="status-dot" :class="row.status==='入住'?'in':'out'"></span>
            {{ row.status }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="showEditDialog(row)">编辑</el-button>
            <el-button v-if="row.status==='未入住'" size="small" type="success" link
              @click="showQuickCheckIn(row)">分配入住</el-button>
            <el-button v-if="row.status==='入住'" size="small" type="warning" link
              @click="showChangeRoom(row)">换宿舍</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          :page-sizes="[5, 10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData" @current-change="loadData" background
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" @closed="resetForm"
      class="custom-dialog" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="form.studentNo" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" style="width:100%">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="专业" prop="major">
          <el-input v-model="form.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="班级" prop="className">
          <el-input v-model="form.className" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配入住/换宿舍对话框 -->
    <el-dialog :title="roomDialogTitle" v-model="roomDialogVisible" width="480px"
      class="custom-dialog" :close-on-click-modal="false">
      <el-form label-width="90px">
        <el-form-item label="学生">
          <span class="highlight-text">{{ roomTarget?.name }}（{{ roomTarget?.studentNo }}）</span>
        </el-form-item>
        <el-form-item v-if="roomTarget?.status==='入住'" label="当前房间">
          <el-tag type="success" effect="light" size="large">
            {{ roomTarget?.buildingName }}-{{ roomTarget?.roomNo }}
          </el-tag>
        </el-form-item>
        <el-form-item :label="roomTarget?.status==='入住'?'新房间':'选择房间'">
          <el-select v-model="selectedRoomId" filterable placeholder="搜索可用房间" style="width:100%">
            <el-option v-for="r in availableRooms" :key="r.id"
              :label="`${r.buildingName}-${r.roomNo} (${r.type} ${r.occupied}/${r.capacity})`"
              :value="r.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roomDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoomAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getStudents, addStudent, updateStudent, deleteStudent } from '../api/student'
import { getRooms } from '../api/room'
import { checkIn, checkOut } from '../api/checkRecord'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const loading = ref(false), tableData = ref([]), pageNum = ref(1), pageSize = ref(10), total = ref(0)
const searchForm = reactive({ keyword: '', gender: '', status: '' })
const dialogVisible = ref(false), dialogTitle = ref(''), isEdit = ref(false), formRef = ref(null)
const form = reactive({ id: null, studentNo: '', name: '', gender: '男', major: '', className: '', phone: '', idCard: '' })

const roomDialogVisible = ref(false), roomDialogTitle = ref(''), roomTarget = ref(null)
const selectedRoomId = ref(null), availableRooms = ref([])

const rules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  className: [{ required: true, message: '请输入班级', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getStudents({ pageNum: pageNum.value, pageSize: pageSize.value, ...searchForm }); tableData.value = res.data.records; total.value = res.data.total } finally { loading.value = false }
}
async function loadAvailableRooms() { const res = await getRooms({ status: '可用', pageSize: 1000, pageNum: 1 }); availableRooms.value = res.data.records }
function handleSearch() { pageNum.value = 1; loadData() }
function resetSearch() { searchForm.keyword = ''; searchForm.gender = ''; searchForm.status = ''; handleSearch() }
function showAddDialog() { isEdit.value = false; dialogTitle.value = '新增学生'; dialogVisible.value = true }
function showEditDialog(row) { isEdit.value = true; dialogTitle.value = '编辑学生'; Object.assign(form, { ...row, status: undefined }); dialogVisible.value = true }
function resetForm() { formRef.value?.resetFields(); Object.assign(form, { id: null, studentNo: '', name: '', gender: '男', major: '', className: '', phone: '', idCard: '' }) }
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try { isEdit.value ? await updateStudent(form) : await addStudent(form); ElMessage.success(isEdit.value ? '修改成功' : '添加成功'); dialogVisible.value = false; loadData() } catch {}
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除学生「${row.name}」吗？`, '警告', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
  try { await deleteStudent(row.id); ElMessage.success('删除成功'); loadData() } catch {}
}
async function showQuickCheckIn(row) { roomTarget.value = row; roomDialogTitle.value = '🏠 分配入住'; selectedRoomId.value = null; roomDialogVisible.value = true; await loadAvailableRooms() }
async function showChangeRoom(row) { roomTarget.value = row; roomDialogTitle.value = '🔄 换宿舍'; selectedRoomId.value = null; roomDialogVisible.value = true; await loadAvailableRooms() }
async function handleRoomAssign() {
  if (!selectedRoomId.value) { ElMessage.warning('请选择房间'); return }
  const student = roomTarget.value
  try {
    if (student.status === '入住') { await checkOut(student.id, student.roomId); await checkIn(student.id, selectedRoomId.value); ElMessage.success(`${student.name} 已成功换到新宿舍`) }
    else { await checkIn(student.id, selectedRoomId.value); ElMessage.success(`${student.name} 入住办理成功`) }
    roomDialogVisible.value = false; loadData()
  } catch {}
}
onMounted(loadData)
</script>

<style scoped>
.page-container { max-width: 1400px; }
.page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.page-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: #1a1a2e; }
.title-icon { font-size: 26px; }

.btn-gradient {
  background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px;
  padding: 10px 22px; font-weight: 600; transition: all 0.3s;
}
.btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }

.search-bar {
  background: #fff; border-radius: 14px; padding: 20px 24px 4px; margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}
.search-input { width: 200px; }
.search-input :deep(.el-input__wrapper) { border-radius: 8px; }

.table-card {
  background: #fff; border-radius: 14px; padding: 4px; border: 1px solid #f0f0f0;
  overflow: hidden;
}
.data-table { --el-table-header-bg-color: #f8f9ff; }
.data-table :deep(th) { font-weight: 600; color: #1a1a2e; font-size: 13px; }
.data-table :deep(td) { font-size: 13px; }
.data-table :deep(.el-table__row:hover) { background: #f8f9ff; }
.student-name { font-weight: 600; color: #1a1a2e; }
.no-room { color: #c0c4cc; }
.status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 4px; }
.status-dot.in { background: #10b981; }
.status-dot.out { background: #c0c4cc; }

.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 20px; }

.highlight-text { font-size: 15px; font-weight: 600; color: #1a1a2e; }
</style>
