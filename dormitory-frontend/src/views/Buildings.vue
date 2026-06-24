<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <span class="title-icon">🏗️</span>
        <span>宿舍楼管理</span>
      </div>
      <el-button type="primary" class="btn-gradient" @click="showAddDialog">
        <el-icon><Plus /></el-icon>新增楼栋
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="keyword" placeholder="楼栋名称/编号" clearable :prefix-icon="Search"
            @keyup.enter="loadData" class="search-input" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData"><el-icon><Search /></el-icon>搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" stripe v-loading="loading" class="data-table">
        <el-table-column prop="buildingNo" label="编号" width="80">
          <template #default="{ row }">
            <el-tag effect="dark" type="primary">{{ row.buildingNo }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="楼栋名称" min-width="150">
          <template #default="{ row }">
            <span class="building-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="floors" label="楼层数" width="90" />
        <el-table-column prop="capacity" label="容纳人数" width="100" />
        <el-table-column prop="manager" label="宿管" width="100" />
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="showEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @closed="resetForm" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="楼栋编号" prop="buildingNo">
          <el-input v-model="form.buildingNo" placeholder="如: A" />
        </el-form-item>
        <el-form-item label="楼栋名称" prop="name">
          <el-input v-model="form.name" placeholder="如: 学生公寓A栋" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="楼层数" prop="floors">
              <el-input-number v-model="form.floors" :min="1" :max="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容纳人数" prop="capacity">
              <el-input-number v-model="form.capacity" :min="0" :step="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="宿管姓名">
          <el-input v-model="form.manager" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
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
import { getBuildings, addBuilding, updateBuilding, deleteBuilding } from '../api/building'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const loading = ref(false), tableData = ref([]), keyword = ref('')
const dialogVisible = ref(false), dialogTitle = ref(''), isEdit = ref(false), formRef = ref(null)
const form = reactive({ id: null, buildingNo: '', name: '', floors: 6, capacity: 0, manager: '', description: '' })
const rules = {
  buildingNo: [{ required: true, message: '请输入编号' }],
  name: [{ required: true, message: '请输入名称' }],
  floors: [{ required: true, message: '请输入楼层数' }],
  capacity: [{ required: true, message: '请输入容纳人数' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getBuildings({ pageNum: 1, pageSize: 100, keyword: keyword.value }); tableData.value = res.data.records } finally { loading.value = false }
}
function showAddDialog() { isEdit.value = false; dialogTitle.value = '新增楼栋'; dialogVisible.value = true }
function showEditDialog(row) { isEdit.value = true; dialogTitle.value = '编辑楼栋'; Object.assign(form, row); dialogVisible.value = true }
function resetForm() { formRef.value?.resetFields(); Object.assign(form, { id: null, buildingNo: '', name: '', floors: 6, capacity: 0, manager: '', description: '' }) }
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try { isEdit.value ? await updateBuilding(form) : await addBuilding(form); ElMessage.success(isEdit.value ? '修改成功' : '添加成功'); dialogVisible.value = false; loadData() } catch {}
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」吗？关联的房间也会被删除。`, '警告', { type: 'warning' })
  try { await deleteBuilding(row.id); ElMessage.success('删除成功'); loadData() } catch {}
}
onMounted(loadData)
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
.building-name { font-weight: 600; color: #1a1a2e; }
</style>
