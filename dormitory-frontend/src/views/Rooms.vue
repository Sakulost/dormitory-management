<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <span class="title-icon">🏠</span>
        <span>房间管理</span>
      </div>
      <el-button type="primary" class="btn-gradient" @click="showAddDialog">
        <el-icon><Plus /></el-icon>新增房间
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="宿舍楼">
          <el-select v-model="searchForm.buildingId" placeholder="全部" clearable style="width:160px">
            <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="searchForm.roomNo" placeholder="房间号" clearable :prefix-icon="Search" class="search-input" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width:110px">
            <el-option label="可用" value="可用" /><el-option label="已满" value="已满" /><el-option label="维修中" value="维修中" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch"><el-icon><Search /></el-icon>搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-card">
      <el-table :data="tableData" stripe v-loading="loading" class="data-table">
        <el-table-column label="宿舍楼" width="140">
          <template #default="{ row }">
            <span class="bld-name">{{ row.buildingName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roomNo" label="房间号" width="100">
          <template #default="{ row }">
            <el-tag effect="dark">{{ row.roomNo }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="floor" label="楼层" width="70" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column label="入住情况" min-width="180">
          <template #default="{ row }">
            <div class="capacity-bar">
              <el-progress :percentage="row.capacity ? Math.round(row.occupied/row.capacity*100) : 0"
                :color="row.occupied >= row.capacity ? '#ef4444' : row.occupied > 0 ? '#6366f1' : '#10b981'"
                :stroke-width="8" />
              <span class="capacity-text">{{ row.occupied }}/{{ row.capacity }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="住宿费/年" width="110">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status==='可用'?'success':row.status==='已满'?'danger':'warning'" effect="light" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="showEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData" @current-change="loadData" background />
      </div>
    </div>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" @closed="resetForm" :close-on-click-modal="false">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="所属楼栋" prop="buildingId">
          <el-select v-model="form.buildingId" style="width:100%">
            <el-option v-for="b in buildings" :key="b.id" :label="b.name" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间号" prop="roomNo">
              <el-input v-model="form.roomNo" placeholder="如: A-101" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼层" prop="floor">
              <el-input-number v-model="form.floor" :min="1" :max="20" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="房间类型" prop="type">
              <el-select v-model="form.type" style="width:100%">
                <el-option label="2人间" value="2人间" /><el-option label="4人间" value="4人间" /><el-option label="6人间" value="6人间" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容纳人数" prop="capacity">
              <el-input-number v-model="form.capacity" :min="1" :max="10" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="住宿费/年">
          <el-input-number v-model="form.price" :min="0" :step="100" :precision="2" />
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
import { getRooms, addRoom, updateRoom, deleteRoom } from '../api/room'
import { getAllBuildings } from '../api/building'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const loading = ref(false), tableData = ref([]), buildings = ref([])
const pageNum = ref(1), pageSize = ref(10), total = ref(0)
const searchForm = reactive({ roomNo: '', buildingId: null, status: '' })
const dialogVisible = ref(false), dialogTitle = ref(''), isEdit = ref(false), formRef = ref(null)
const form = reactive({ id: null, buildingId: null, roomNo: '', floor: 1, capacity: 4, type: '4人间', price: 1200.00 })
const rules = {
  buildingId: [{ required: true, message: '请选择楼栋' }],
  roomNo: [{ required: true, message: '请输入房间号' }],
  floor: [{ required: true, message: '请输入楼层' }],
  type: [{ required: true, message: '请选择类型' }],
  capacity: [{ required: true, message: '请输入容纳人数' }]
}

async function loadData() {
  loading.value = true
  try { const res = await getRooms({ pageNum: pageNum.value, pageSize: pageSize.value, ...searchForm }); tableData.value = res.data.records; total.value = res.data.total } finally { loading.value = false }
}
async function loadBuildings() { const res = await getAllBuildings(); buildings.value = res.data }
function handleSearch() { pageNum.value = 1; loadData() }
function resetSearch() { searchForm.roomNo = ''; searchForm.buildingId = null; searchForm.status = ''; handleSearch() }
function showAddDialog() { isEdit.value = false; dialogTitle.value = '新增房间'; dialogVisible.value = true }
function showEditDialog(row) { isEdit.value = true; dialogTitle.value = '编辑房间'; Object.assign(form, { ...row, price: Number(row.price) }); dialogVisible.value = true }
function resetForm() { formRef.value?.resetFields(); Object.assign(form, { id: null, buildingId: null, roomNo: '', floor: 1, capacity: 4, type: '4人间', price: 1200.00 }) }
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try { isEdit.value ? await updateRoom(form) : await addRoom(form); ElMessage.success(isEdit.value ? '修改成功' : '添加成功'); dialogVisible.value = false; loadData() } catch {}
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除房间「${row.roomNo}」吗？`, '警告', { type: 'warning' })
  try { await deleteRoom(row.id); ElMessage.success('删除成功'); loadData() } catch {}
}
onMounted(() => { loadData(); loadBuildings() })
</script>

<style scoped>
.page-container { max-width: 1400px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: #1a1a2e; }
.title-icon { font-size: 26px; }
.btn-gradient { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; border-radius: 10px; padding: 10px 22px; font-weight: 600; transition: all 0.3s; }
.btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
.search-bar { background: #fff; border-radius: 14px; padding: 20px 24px 4px; margin-bottom: 16px; border: 1px solid #f0f0f0; }
.search-input { width: 160px; }
.search-input :deep(.el-input__wrapper) { border-radius: 8px; }
.table-card { background: #fff; border-radius: 14px; padding: 4px; border: 1px solid #f0f0f0; overflow: hidden; }
.data-table { --el-table-header-bg-color: #f8f9ff; }
.data-table :deep(th) { font-weight: 600; color: #1a1a2e; font-size: 13px; }
.data-table :deep(.el-table__row:hover) { background: #f8f9ff; }
.bld-name { font-weight: 600; color: #1a1a2e; }
.capacity-bar { display: flex; align-items: center; gap: 10px; }
.capacity-text { font-size: 13px; color: #606266; white-space: nowrap; }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 20px; }
</style>
