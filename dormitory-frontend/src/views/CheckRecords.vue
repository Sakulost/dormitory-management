<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">
        <span class="title-icon">🚪</span>
        <span>入退宿管理</span>
      </div>
    </div>

    <!-- 操作面板 -->
    <el-row :gutter="24" style="margin-bottom:20px">
      <el-col :span="12">
        <div class="action-panel checkin-panel">
          <div class="panel-icon">🏠</div>
          <div class="panel-body">
            <h3>办理入住</h3>
            <div class="panel-form">
              <el-select v-model="checkInStudentId" filterable placeholder="搜索学生" style="width:190px" size="large">
                <el-option v-for="s in unassignedStudents" :key="s.id"
                  :label="`${s.name} (${s.studentNo})`" :value="s.id" />
              </el-select>
              <span class="arrow">→</span>
              <el-select v-model="checkInRoomId" filterable placeholder="搜索可用房间" style="width:210px" size="large">
                <el-option v-for="r in availableRooms" :key="r.id"
                  :label="`${r.buildingName}-${r.roomNo} (${r.occupied}/${r.capacity})`" :value="r.id" />
              </el-select>
              <el-button type="primary" size="large" class="btn-action" @click="handleCheckIn">确认入住</el-button>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="action-panel checkout-panel">
          <div class="panel-icon">🚪</div>
          <div class="panel-body">
            <h3>办理退宿</h3>
            <div class="panel-form">
              <el-select v-model="checkOutStudentId" filterable placeholder="搜索已入住学生" style="width:260px" size="large">
                <el-option v-for="s in checkedInStudents" :key="s.id"
                  :label="`${s.name} (${s.studentNo}) — ${s.buildingName}-${s.roomNo}`" :value="s.id" />
              </el-select>
              <el-button type="danger" size="large" class="btn-action" @click="handleCheckOut">确认退宿</el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 记录列表 -->
    <div class="table-card">
      <div style="padding:16px 20px">
        <el-form :inline="true">
          <el-form-item label="类型筛选">
            <el-select v-model="searchType" placeholder="全部" clearable style="width:110px" @change="loadData">
              <el-option label="入住" value="入住" /><el-option label="退宿" value="退宿" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="tableData" stripe v-loading="loading" class="data-table">
        <el-table-column prop="studentName" label="学生" width="100">
          <template #default="{ row }"><span class="name">{{ row.studentName }}</span></template>
        </el-table-column>
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column label="楼栋-房间" min-width="150">
          <template #default="{ row }">
            <el-tag effect="light" type="primary">{{ row.buildingName }}-{{ row.roomNo }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.type==='入住'?'success':'danger'" effect="dark" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkDate" label="日期" width="170" />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      </el-table>
      <div class="pagination-wrap">
        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData" @current-change="loadData" background />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCheckRecords, checkIn, checkOut } from '../api/checkRecord'
import { getStudents } from '../api/student'
import { getRooms } from '../api/room'
import { ElMessage } from 'element-plus'

const loading = ref(false), tableData = ref([]), pageNum = ref(1), pageSize = ref(10), total = ref(0), searchType = ref('')
const checkInStudentId = ref(null), checkInRoomId = ref(null), unassignedStudents = ref([]), availableRooms = ref([])
const checkOutStudentId = ref(null), checkedInStudents = ref([])

async function loadData() {
  loading.value = true
  try { const res = await getCheckRecords({ pageNum: pageNum.value, pageSize: pageSize.value, type: searchType.value }); tableData.value = res.data.records; total.value = res.data.total } finally { loading.value = false }
}
async function loadSelectOptions() {
  const [un, ch, rm] = await Promise.all([
    getStudents({ status: '未入住', pageSize: 1000, pageNum: 1 }),
    getStudents({ status: '入住', pageSize: 1000, pageNum: 1 }),
    getRooms({ status: '可用', pageSize: 1000, pageNum: 1 })
  ])
  unassignedStudents.value = un.data.records; checkedInStudents.value = ch.data.records; availableRooms.value = rm.data.records
}
async function handleCheckIn() {
  if (!checkInStudentId.value || !checkInRoomId.value) { ElMessage.warning('请选择学生和房间'); return }
  try { await checkIn(checkInStudentId.value, checkInRoomId.value); ElMessage.success('入住办理成功'); checkInStudentId.value = null; checkInRoomId.value = null; loadData(); loadSelectOptions() } catch {}
}
async function handleCheckOut() {
  if (!checkOutStudentId.value) { ElMessage.warning('请选择学生'); return }
  const s = checkedInStudents.value.find(s => s.id === checkOutStudentId.value)
  if (!s) { ElMessage.warning('未找到该学生'); return }
  try { await checkOut(checkOutStudentId.value, s.roomId); ElMessage.success('退宿办理成功'); checkOutStudentId.value = null; loadData(); loadSelectOptions() } catch {}
}
onMounted(() => { loadData(); loadSelectOptions() })
</script>

<style scoped>
.page-container { max-width: 1400px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; color: #1a1a2e; }
.title-icon { font-size: 26px; }

.action-panel {
  border-radius: 16px; padding: 24px; display: flex; gap: 16px; align-items: flex-start;
  border: 1px solid #f0f0f0; transition: all 0.3s;
}
.action-panel:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.checkin-panel { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); }
.checkout-panel { background: linear-gradient(135deg, #fff7ed, #ffedd5); }
.panel-icon { font-size: 36px; }
.panel-body { flex: 1; }
.panel-body h3 { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1a1a2e; }
.panel-form { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.arrow { font-size: 18px; color: #909399; font-weight: 700; }
.btn-action { border-radius: 10px; font-weight: 600; }

.table-card { background: #fff; border-radius: 14px; border: 1px solid #f0f0f0; overflow: hidden; }
.data-table { --el-table-header-bg-color: #f8f9ff; }
.data-table :deep(th) { font-weight: 600; color: #1a1a2e; font-size: 13px; }
.data-table :deep(.el-table__row:hover) { background: #f8f9ff; }
.name { font-weight: 600; color: #1a1a2e; }
.pagination-wrap { display: flex; justify-content: flex-end; padding: 16px 20px; }
</style>
