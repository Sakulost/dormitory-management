<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <span class="title-icon">🔧</span>
        <span>报修管理</span>
      </div>
      <el-button type="primary" class="btn-gradient" @click="showAddDialog">
        <el-icon><Plus /></el-icon>提交报修
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="状态筛选">
          <el-select v-model="searchStatus" placeholder="全部" clearable style="width:120px" @change="loadData">
            <el-option label="待处理" value="待处理" /><el-option label="处理中" value="处理中" /><el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" stripe v-loading="loading" class="data-table">
        <el-table-column label="房间" width="150">
          <template #default="{ row }">
            <el-tag effect="light" type="primary">{{ row.buildingName }}-{{ row.roomNo }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="studentName" label="报修人" width="100" />
        <el-table-column prop="title" label="标题" min-width="150">
          <template #default="{ row }"><span class="title-text">{{ row.title }}</span></template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status==='已完成'?'success':row.status==='处理中'?'warning':'danger'"
              effect="dark" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportTime" label="报修时间" width="170" />
        <el-table-column prop="remark" label="处理备注" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status!=='已完成'" size="small" type="warning" link @click="showStatusDialog(row)">
              处理
            </el-button>
            <span v-else style="color:#c0c4cc">-</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData" @current-change="loadData" background />
      </div>
    </div>

    <!-- 新增报修 -->
    <el-dialog title="提交报修" v-model="dialogVisible" width="500px" @closed="resetForm" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-form-item label="房间" prop="roomId">
          <el-select v-model="form.roomId" filterable placeholder="搜索房间" style="width:100%">
            <el-option v-for="r in rooms" :key="r.id" :label="`${r.buildingName}-${r.roomNo}`" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="报修标题" prop="title">
          <el-input v-model="form.title" placeholder="如：水龙头漏水" />
        </el-form-item>
        <el-form-item label="详细描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- 处理状态 -->
    <el-dialog title="处理报修" v-model="statusDialogVisible" width="450px" :close-on-click-modal="false">
      <el-form label-width="90px">
        <el-form-item label="当前状态">
          <el-tag :type="currentRepair?.status==='已完成'?'success':'warning'" effect="dark">
            {{ currentRepair?.status }}
          </el-tag>
        </el-form-item>
        <el-form-item label="更新状态">
          <el-select v-model="statusForm.status" style="width:100%">
            <el-option label="待处理" value="待处理" /><el-option label="处理中" value="处理中" /><el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="statusForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStatusUpdate">更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getRepairs, addRepair, updateRepairStatus } from '../api/repair'
import { getRooms } from '../api/room'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false), tableData = ref([]), rooms = ref([])
const pageNum = ref(1), pageSize = ref(10), total = ref(0), searchStatus = ref('')
const dialogVisible = ref(false), formRef = ref(null), form = reactive({ roomId: null, title: '', description: '' })
const rules = { roomId: [{ required: true, message: '请选择房间' }], title: [{ required: true, message: '请输入标题' }] }
const statusDialogVisible = ref(false), currentRepair = ref(null), statusForm = reactive({ status: '', remark: '' })

async function loadData() {
  loading.value = true
  try { const res = await getRepairs({ pageNum: pageNum.value, pageSize: pageSize.value, status: searchStatus.value }); tableData.value = res.data.records; total.value = res.data.total } finally { loading.value = false }
}
async function loadRooms() { const res = await getRooms({ pageSize: 1000, pageNum: 1 }); rooms.value = res.data.records }
function showAddDialog() { dialogVisible.value = true }
function resetForm() { formRef.value?.resetFields(); Object.assign(form, { roomId: null, title: '', description: '' }) }
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try { await addRepair(form); ElMessage.success('报修提交成功'); dialogVisible.value = false; loadData() } catch {}
}
function showStatusDialog(row) { currentRepair.value = row; statusForm.status = row.status; statusForm.remark = ''; statusDialogVisible.value = true }
async function handleStatusUpdate() {
  try { await updateRepairStatus(currentRepair.value.id, statusForm.status, statusForm.remark); ElMessage.success('状态更新成功'); statusDialogVisible.value = false; loadData() } catch {}
}
onMounted(() => { loadData(); loadRooms() })
</script>

<style scoped>
.page-container { max-width: 1400px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: #1a1a2e; }
.title-icon { font-size: 26px; }
.btn-gradient { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; padding: 10px 22px; font-weight: 600; transition: all 0.3s; }
.btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
.search-bar { background: #fff; border-radius: 14px; padding: 20px 24px 4px; margin-bottom: 16px; border: 1px solid #f0f0f0; }
.table-card { background: #fff; border-radius: 14px; padding: 4px; border: 1px solid #f0f0f0; overflow: hidden; }
.data-table { --el-table-header-bg-color: #f8f9ff; }
.data-table :deep(th) { font-weight: 600; color: #1a1a2e; font-size: 13px; }
.data-table :deep(.el-table__row:hover) { background: #f8f9ff; }
.title-text { font-weight: 600; color: #1a1a2e; }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 20px; }
</style>
