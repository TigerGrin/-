<template>
  <view class="container">
    <!-- 科室信息头部 -->
    <view class="department-header">
        <view class="dept-info">
          <view class="dept-icon">🏥</view>
          <view class="dept-details">
            <text class="dept-name">{{ departmentName }}</text>
            <text class="dept-stats">护士总数：{{ nurses.length }}人 | 在岗：{{ onDutyCount }}人</text>
          </view>
        </view>
      <view class="dept-status active">
        <text class="status-text">正常运营</text>
      </view>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="search-section">
        <view class="search-input">
          <text class="search-icon">🔍</text>
          <input 
            type="text" 
            placeholder="搜索护士姓名..." 
            v-model="searchKeyword"
            @input="handleSearch"
            class="input-field"
          />
        </view>
      </view>
      <view class="filter-section">
        <view class="filter-btn" :class="{ active: currentFilter === 'all' }" @click="setFilter('all')">
          <text class="filter-text">全部</text>
        </view>
        <view class="filter-btn" :class="{ active: currentFilter === 'N4' }" @click="setFilter('N4')">
          <text class="filter-text">N4</text>
        </view>
        <view class="filter-btn" :class="{ active: currentFilter === 'N3' }" @click="setFilter('N3')">
          <text class="filter-text">N3</text>
        </view>
        <view class="filter-btn" :class="{ active: currentFilter === 'N2' }" @click="setFilter('N2')">
          <text class="filter-text">N2</text>
        </view>
        <view class="filter-btn" :class="{ active: currentFilter === 'N1' }" @click="setFilter('N1')">
          <text class="filter-text">N1</text>
        </view>
        <view class="filter-btn" :class="{ active: currentFilter === 'N0' }" @click="setFilter('N0')">
          <text class="filter-text">N0</text>
        </view>
        <view class="filter-btn" :class="{ active: currentFilter === '实习护士' }" @click="setFilter('实习护士')">
          <text class="filter-text">实习护士</text>
        </view>
        <view class="filter-btn" :class="{ active: currentFilter === '进修护士' }" @click="setFilter('进修护士')">
          <text class="filter-text">进修护士</text>
        </view>
      </view>
      <view class="action-buttons">
        <view class="import-btn" @click="openImportModal">
          <text class="import-icon">📥</text>
          <text class="import-text">批量导入</text>
        </view>
        <view class="add-btn" @click="showAddModal" v-if="!isBatchMode">
          <text class="add-icon">+</text>
          <text class="add-text">添加护士</text>
        </view>
        <view class="batch-mode-btn" @click="toggleBatchMode" v-if="!isBatchMode">
          <text class="batch-icon">☑️</text>
          <text class="batch-text">批量选择</text>
        </view>
        <view class="batch-actions" v-if="isBatchMode">
          <view class="select-all-btn" @click="toggleSelectAll">
            <text class="select-all-text">{{ isAllSelected ? '取消全选' : '全选' }}</text>
          </view>
          <view class="batch-delete-btn" @click="handleBatchDelete" :class="{ 'btn-disabled': selectedNurseIds.length === 0 }">
            <text class="batch-delete-icon">🗑️</text>
            <text class="batch-delete-text">批量删除 ({{ selectedNurseIds.length }})</text>
          </view>
          <view class="cancel-batch-btn" @click="cancelBatchMode">
            <text class="cancel-batch-text">取消</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 护士列表 -->
    <view class="nurse-list">
      <view 
        class="nurse-card" 
        :class="{ 'batch-mode': isBatchMode, 'selected': isNurseSelected(nurse.id) }"
        v-for="(nurse, index) in filteredNurses" 
        :key="index"
        @click="handleCardClick(nurse)"
      >
        <view class="card-header">
          <view class="nurse-checkbox" v-if="isBatchMode" @click.stop="toggleNurseSelect(nurse.id)">
            <text class="checkbox-icon">{{ isNurseSelected(nurse.id) ? '☑️' : '☐' }}</text>
          </view>
          <view class="nurse-avatar">
            <text class="avatar-text">{{ nurse.name.charAt(0) }}</text>
          </view>
          <view class="nurse-info">
            <text class="nurse-name">{{ nurse.name }}</text>
            <text class="nurse-id">工号：{{ nurse.id }}</text>
          </view>
          <view class="nurse-level" :class="'level-' + nurse.level">
            <text class="level-text">{{ nurse.level }}</text>
          </view>
        </view>
        
        <view class="card-content">
          <view class="info-grid">
            <view class="info-item">
              <text class="info-label">级别</text>
              <text class="info-value">{{ getLevelName(nurse.level) }}</text>
            </view>
            <view class="info-item" v-if="nurse.level !== '实习护士' && nurse.level !== '进修护士'">
              <text class="info-label">排班状态</text>
              <text class="info-value" :class="getScheduleStatusClass(nurse)">
                {{ getScheduleStatusDisplay(nurse) }}
              </text>
            </view>
            <view class="info-item" v-if="nurse.level !== '实习护士' && nurse.level !== '进修护士'">
              <text class="info-label">本周班次</text>
              <text class="info-value">{{ nurse.weeklyShifts }}次</text>
            </view>
            <view class="info-item" v-if="nurse.mentor">
              <text class="info-label">带班老师</text>
              <text class="info-value">{{ getMentorName(nurse.mentor) }}</text>
            </view>
            <view class="info-item" v-if="nurse.graduationYear">
              <text class="info-label">护士年届</text>
              <text class="info-value">{{ nurse.graduationYear }}年</text>
            </view>
            <view class="info-item" v-if="nurse.annualLeave !== undefined && nurse.annualLeave !== null">
              <text class="info-label">年休</text>
              <text class="info-value">{{ nurse.annualLeave }}天</text>
            </view>
            <view class="info-item" v-if="nurse.storedLeave !== undefined && nurse.storedLeave !== null">
              <text class="info-label">存休</text>
              <text class="info-value">{{ nurse.storedLeave }}天</text>
            </view>
          </view>
          
          <view class="role-info" v-if="nurse.isTeamLeader">
            <text class="role-badge">责任组长</text>
          </view>
          
          <view class="schedule-info" v-if="nurse.level === '实习护士' || nurse.level === '进修护士'">
            <text class="schedule-label">排班安排：</text>
            <text class="schedule-text">跟随带班老师 {{ getMentorName(nurse.mentor) }} 的排班</text>
          </view>
          <view class="schedule-info" v-else>
            <text class="schedule-label">最近排班：</text>
            <text class="schedule-text">{{ nurse.lastSchedule }}</text>
          </view>
        </view>
        
        <view class="card-actions">
          <view class="action-btn edit-btn" @click.stop="editNurse(nurse)">
            <text class="action-icon">✏️</text>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-btn schedule-btn" @click.stop="manageSchedule(nurse)">
            <text class="action-icon">📅</text>
            <text class="action-text">排班</text>
          </view>
          <view class="action-btn delete-btn" @click.stop="deleteNurse(nurse)">
            <text class="action-icon">🗑️</text>
            <text class="action-text">删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="filteredNurses.length === 0">
      <text class="empty-icon">👩‍⚕️</text>
      <text class="empty-text">暂无护士数据</text>
      <text class="empty-desc">点击上方"添加护士"按钮添加第一个护士</text>
    </view>

    <!-- 添加/编辑护士弹窗 -->
    <view class="modal-overlay" v-if="showModal" @click="hideModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑护士信息' : '添加护士' }}</text>
          <view class="close-btn" @click="hideModal">×</view>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">姓名</text>
            <input 
              type="text" 
              v-model="formData.name" 
              placeholder="请输入护士姓名"
              class="form-input"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">工号</text>
            <input 
              type="text" 
              v-model="formData.id" 
              placeholder="请输入工号"
              class="form-input"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">护士级别</text>
            <view class="level-selector">
              <view 
                class="level-option" 
                v-for="level in nurseLevels" 
                :key="level.value"
                :class="{ active: formData.level === level.value }"
                @click="formData.level = level.value"
              >
                <text class="level-option-text">{{ level.value }}</text>
                <text class="level-option-name">{{ level.name }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-group" v-if="formData.level === '实习护士' || formData.level === '进修护士'">
            <text class="form-label">带班老师</text>
            <view class="mentor-selector">
              <view 
                class="mentor-option" 
                v-for="mentor in availableMentors" 
                :key="mentor.id"
                :class="{ active: formData.mentor === mentor.id }"
                @click="formData.mentor = mentor.id"
              >
                <text class="mentor-option-text">{{ mentor.name }}</text>
                <text class="mentor-option-level">({{ getLevelName(mentor.level) }})</text>
              </view>
            </view>
          </view>
          
          <view class="form-group" v-if="formData.level !== '实习护士' && formData.level !== '进修护士'">
            <text class="form-label">排班状态</text>
            <view class="status-selector">
              <view 
                class="status-option" 
                v-for="status in scheduleStatuses" 
                :key="status.value"
                :class="{ active: formData.scheduleStatus === status.value }"
                @click="formData.scheduleStatus = status.value"
              >
                <text class="status-option-text">{{ status.name }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-group" v-if="formData.level !== '实习护士' && formData.level !== '进修护士'">
            <text class="form-label">本周班次</text>
            <input 
              type="number" 
              v-model="formData.weeklyShifts" 
              placeholder="请输入本周班次数"
              class="form-input"
            />
          </view>
          
          <view class="form-group" v-if="formData.level !== '实习护士' && formData.level !== '进修护士'">
            <text class="form-label">最近排班</text>
            <input 
              type="text" 
              v-model="formData.lastSchedule" 
              placeholder="请输入最近排班信息"
              class="form-input"
            />
          </view>
          
          <view class="form-group" v-if="formData.level === 'N4' || formData.level === 'N3'">
            <text class="form-label">责任组长</text>
            <view class="checkbox-group">
              <view 
                class="checkbox-item" 
                :class="{ active: formData.isTeamLeader }"
                @click="formData.isTeamLeader = !formData.isTeamLeader"
              >
                <text class="checkbox-text">设为责任组长</text>
              </view>
            </view>
          </view>
          
          <view class="form-group">
            <text class="form-label">护士年届</text>
            <input 
              type="number" 
              v-model.number="formData.graduationYear" 
              placeholder="请输入4位年份（如：2020）"
              class="form-input"
              min="1000"
              max="9999"
              :disabled="false"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">年休（天）</text>
            <input 
              type="number" 
              v-model.number="formData.annualLeave" 
              placeholder="请输入年休天数"
              class="form-input"
              step="0.01"
              min="-365"
              :disabled="false"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">存休（天）</text>
            <input 
              type="number" 
              v-model.number="formData.storedLeave" 
              placeholder="请输入存休天数"
              class="form-input"
              step="0.01"
              min="-365"
              :disabled="false"
            />
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn btn-secondary" @click="hideModal">取消</view>
          <view class="btn btn-primary" @click="saveNurse">保存</view>
        </view>
      </view>
    </view>

    <!-- 批量导入弹窗 -->
    <view 
      class="modal-overlay" 
      v-if="showImportModal" 
      @click="hideImportModal"
    >
      <view class="modal-content import-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">批量导入护士</text>
          <view class="close-btn" @click="hideImportModal">×</view>
        </view>
        
        <view class="modal-body">
          <view class="import-tips">
            <text class="tips-title">📋 导入文件格式要求：</text>
            <text class="tips-text">• Excel文件格式 (.xlsx 或 .xls)</text>
            <text class="tips-text">• 第一列：工号（如：6969、P1086）</text>
            <text class="tips-text">• 第二列：姓名（如：郭晶晶）</text>
            <text class="tips-text">• 第三列：级别/角色（如：N4护士/责任组长、N3护士、N2护士）</text>
          </view>
          
          <view class="file-upload-section">
            <!-- #ifdef H5 -->
            <input 
              type="file" 
              ref="fileInputRef"
              id="fileInput"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" 
              @change="handleFileSelect"
              style="display: none;"
            />
            <!-- #endif -->
            
            <button class="select-file-btn" @click="triggerFileInput">选择Excel文件</button>
            
            <view class="file-info" v-if="selectedFileName">
              <text class="file-name">已选择：{{ selectedFileName }}</text>
              <text class="file-remove" @click="clearFile">✕</text>
            </view>
          </view>

          <view class="import-progress" v-if="importing">
            <text class="progress-text">正在导入，请稍候...</text>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: importProgress + '%' }"></view>
            </view>
          </view>

          <view class="import-result" v-if="importResult">
            <text class="result-title" :class="importResult.success ? 'success' : 'error'">
              {{ importResult.success ? '✅ 导入成功' : '❌ 导入失败' }}
            </text>
            <text class="result-text">{{ importResult.message }}</text>
            <text class="result-details" v-if="importResult.details">
              {{ importResult.details }}
            </text>
          </view>
        </view>
        
        <view class="modal-footer">
          <view class="btn btn-secondary" @click="hideImportModal">取消</view>
          <view 
            class="btn btn-primary" 
            :class="{ 'btn-disabled': !selectedFile || importing }"
            @click="handleImport"
          >
            {{ importing ? '导入中...' : '开始导入' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// #ifdef H5
import * as XLSX from 'xlsx'
// #endif
import { 
  getNurseList, 
  getNurseDetail,
  addNurse, 
  updateNurse, 
  deleteNurse as deleteNurseAPI, 
  parseExcelNurse,
  batchDeleteNurse
} from '@/api/nurse'
import { getDepartmentDetail, getDepartmentList } from '@/api/department'
import { getScheduleList } from '@/api/schedule'

export default {
  data() {
    return {
      departmentId: 'D001', // 默认科室ID，实际应该从路由参数或用户选择获取
      departmentName: '中心监护室',
      searchKeyword: '',
      currentFilter: 'all',
      showModal: false,
      showImportModal: false,
      isEdit: false,
      editingNurse: null,
      selectedFile: null,
      selectedFileName: '',
      importing: false,
      importProgress: 0,
      importResult: null,
      formData: {
        name: '',
        id: '',
        level: 'N0',
        importDate: '',
        scheduleStatus: 'on_duty',
        weeklyShifts: '',
        lastSchedule: '',
        isTeamLeader: false,
        mentor: '',
        graduationYear: null,
        annualLeave: 0,
        storedLeave: 0
      },
      nurseLevels: [
        { value: 'N4', name: '护士' },
        { value: 'N3', name: '护士' },
        { value: 'N2', name: '护士' },
        { value: 'N1', name: '护士' },
        { value: 'N0', name: '护士' },
        { value: '实习护士', name: '实习护士' },
        { value: '进修护士', name: '进修护士' }
      ],
      scheduleStatuses: [
        { value: 'on_duty', name: '在岗' },
        { value: 'off_duty', name: '休息' },
        { value: 'leave', name: '请假' },
        { value: 'training', name: '培训' },
        { value: 'sick', name: '病假' },
        { value: 'maternity', name: '怀孕请假' },
        { value: 'study', name: '进修' },
        { value: 'support', name: '外派支援' }
      ],
      nurses: [],
      loading: false,
      isBatchMode: false,
      selectedNurseIds: [],
      todaySchedules: [] // 当日排班数据
    }
  },
  computed: {
    filteredNurses() {
      let filtered = this.nurses
      
      // 按级别过滤
      if (this.currentFilter !== 'all') {
        filtered = filtered.filter(nurse => nurse.level === this.currentFilter)
      }
      
      // 按搜索关键词过滤
      if (this.searchKeyword) {
        filtered = filtered.filter(nurse => 
          nurse.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          nurse.id.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }
      
      return filtered
    },
    onDutyCount() {
      return this.nurses.filter(nurse => nurse.scheduleStatus === 'on_duty').length
    },
    availableMentors() {
      // 返回非实习护士且非进修护士的护士作为带班老师
      return this.nurses.filter(nurse => 
        nurse.level !== '实习护士' && 
        nurse.level !== '进修护士'
      ).map(nurse => ({
        id: nurse.id,
        name: nurse.name,
        level: nurse.level
      }))
    },
    isAllSelected() {
      return this.filteredNurses.length > 0 && 
             this.selectedNurseIds.length === this.filteredNurses.length
    }
  },
  onLoad(options) {
    console.log('科室护士管理页面加载完成', options)
    // 如果路由传入了科室ID，使用传入的值
    if (options.departmentId) {
      this.departmentId = options.departmentId
    }
    // 加载科室信息和护士列表
    // 注意：科室创建由后端处理（在导入护士时自动创建，或由管理员手动创建）
    this.loadDepartmentInfo()
    this.loadNurses()
    this.loadTodaySchedules()
  },
  mounted() {
    // 初始化完成
  },
  methods: {
    // 加载科室信息（静默加载，不影响使用）
    async loadDepartmentInfo() {
      try {
        // 尝试获取科室列表
        const departmentList = await getDepartmentList()
        if (departmentList && departmentList.list && departmentList.list.length > 0) {
          // 如果列表中有科室，优先使用匹配当前ID的科室，否则使用第一个
          const targetDept = departmentList.list.find(dept => dept.id === this.departmentId) || departmentList.list[0]
          this.departmentId = targetDept.id
          this.departmentName = targetDept.name || this.departmentName
          console.log('✅ 已加载科室信息:', { id: this.departmentId, name: this.departmentName })
          return
        }
        
        // 尝试获取详情（可能会失败，静默处理）
        try {
          const data = await getDepartmentDetail(this.departmentId)
          if (data) {
            this.departmentName = data.name || this.departmentName
            console.log('✅ 已加载科室详情:', { id: this.departmentId, name: this.departmentName })
          }
        } catch (detailError) {
          // 404错误是预期的，科室不存在时使用默认名称，不影响后续操作
          console.log('科室不存在，使用默认名称。科室ID:', this.departmentId)
        }
      } catch (error) {
        // 获取科室信息失败，静默处理，使用默认值
        console.log('获取科室信息失败，使用默认值')
      }
    },
    // 加载护士列表
    async loadNurses(forceRefresh = false) {
      this.loading = true
      try {
        const params = {
          departmentId: this.departmentId,
          // 不传递level参数，始终加载所有护士，由前端进行过滤
          // level: this.currentFilter !== 'all' ? this.currentFilter : undefined,
          keyword: this.searchKeyword || undefined,
          page: 1,
          pageSize: 1000 // 设置足够大的pageSize以获取所有护士数据
        }
        
        // 如果需要强制刷新，添加时间戳避免缓存
        if (forceRefresh) {
          params._t = Date.now()
          console.log('🔄 强制刷新护士列表，时间戳:', params._t)
        }
        
        const result = await getNurseList(params, forceRefresh ? {
          header: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        } : {})
        if (result && result.list) {
          // 完全替换列表，而不是合并
          this.nurses = result.list
          console.log(`✅ 已加载护士列表，共 ${result.list.length} 人`)
          // 如果后端返回了total，也记录一下
          if (result.total !== undefined) {
            console.log(`📊 后端统计总数: ${result.total} 人`)
          }
        } else {
          // 如果没有数据，清空列表
          this.nurses = []
          console.log('⚠️ 护士列表为空')
        }
      } catch (error) {
        console.error('加载护士列表失败:', error)
        
        // 提供更友好的错误信息
        let errorMessage = '加载护士列表失败'
        if (error && error.message) {
          // 如果是服务器错误，使用统一的提示
          if (error.message.includes('服务暂时不可用') || error.message.includes('503')) {
            errorMessage = '服务暂时不可用，请稍后重试'
          } else if (error.message.includes('网络') || error.message.includes('连接')) {
            errorMessage = '网络连接失败，请检查网络设置'
          } else if (error.message.includes('404')) {
            errorMessage = '请求的资源不存在'
          } else {
            // 使用错误消息，但截取前50个字符避免过长
            errorMessage = error.message.length > 50 
              ? error.message.substring(0, 50) + '...' 
              : error.message
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.loading = false
      }
    },
    // 加载当日排班数据
    async loadTodaySchedules() {
      try {
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        
        const result = await getScheduleList({
          departmentId: this.departmentId,
          startDate: todayStr,
          endDate: todayStr
        })
        
        if (result && result.list) {
          this.todaySchedules = result.list
          console.log(`✅ 已加载当日排班数据，共 ${result.list.length} 条`)
        } else {
          this.todaySchedules = []
        }
      } catch (error) {
        console.error('加载当日排班数据失败:', error)
        this.todaySchedules = []
        // 静默处理错误，不影响主流程
      }
    },
    // 获取护士当日的排班信息
    getTodayScheduleForNurse(nurseId) {
      const schedule = this.todaySchedules.find(s => s.nurseId === nurseId)
      if (!schedule) {
        return null
      }
      
      // 返回班次名称，如果没有则返回班次类型
      return schedule.shiftName || schedule.shiftType || null
    },
    // 获取排班状态显示文本（优先显示当日排班）
    getScheduleStatusDisplay(nurse) {
      // 如果是实习护士或进修护士，不显示排班状态
      if (nurse.level === '实习护士' || nurse.level === '进修护士') {
        return ''
      }
      
      // 优先显示当日排班信息
      const todaySchedule = this.getTodayScheduleForNurse(nurse.id)
      if (todaySchedule) {
        // 处理一些特殊班次名称的显示
        if (todaySchedule === '调休0.5' || todaySchedule === 'half_compensatory') {
          return '调休'
        }
        if (todaySchedule === 'compensatory') {
          return '调休'
        }
        if (todaySchedule === 'rest' || todaySchedule === 'off_duty') {
          return '休息'
        }
        // 直接返回班次名称
        return todaySchedule
      }
      
      // 如果没有当日排班，显示"未排"
      return '未排'
    },
    // 获取排班状态的样式类
    getScheduleStatusClass(nurse) {
      // 如果有当日排班，使用特殊样式
      const todaySchedule = this.getTodayScheduleForNurse(nurse.id)
      if (todaySchedule) {
        // 休息或调休使用休息样式
        if (todaySchedule === '调休' || todaySchedule === '调休0.5' || 
            todaySchedule === 'compensatory' || todaySchedule === 'half_compensatory' ||
            todaySchedule === 'rest' || todaySchedule === 'off_duty') {
          return 'status-off_duty'
        }
        // 其他班次使用在岗样式
        return 'status-on_duty'
      }
      // 没有当日排班时，显示"未排"，使用灰色样式
      return 'status-off_duty'
    },
    handleSearch() {
      // 搜索功能 - 使用前端过滤，不需要重新加载列表
      // filteredNurses计算属性会自动根据searchKeyword进行过滤
      // 这样科室总人数保持不变，始终显示所有护士的总数
    },
    cleanupHeaderData() {
      // 清理可能错误导入的表头数据
      const headerKeywords = ['工号', '姓名', '级别', 'level', 'id', 'name', '工号:', '姓名:', '级别:']
      
      const toRemove = []
      this.nurses.forEach((nurse, index) => {
        const isHeaderRow = headerKeywords.some(keyword => 
          nurse.name === keyword || 
          nurse.id === keyword ||
          nurse.name.toLowerCase() === keyword.toLowerCase() ||
          nurse.id.toLowerCase() === keyword.toLowerCase()
        )
        
        if (isHeaderRow) {
          toRemove.push(index)
        }
      })
      
      // 从后往前删除，避免索引变化
      for (let i = toRemove.length - 1; i >= 0; i--) {
        this.nurses.splice(toRemove[i], 1)
        console.log('✅ 已删除错误导入的表头数据')
      }
      
      if (toRemove.length > 0) {
        uni.showToast({
          title: `已清理${toRemove.length}条错误数据`,
          icon: 'success',
          duration: 2000
        })
      }
    },
    setFilter(level) {
      this.currentFilter = level
      // 不需要重新加载列表，前端过滤即可（filteredNurses计算属性会自动更新）
      // 这样科室总人数保持不变，始终显示所有护士的总数
    },
    showAddModal() {
      this.isEdit = false
      this.editingNurse = null
      this.resetForm()
      this.showModal = true
    },
    editNurse(nurse) {
      this.isEdit = true
      this.editingNurse = nurse
      // 确保所有字段都被正确复制，包括可选的年届、年休、存休字段
      this.formData = {
        ...nurse,
        graduationYear: nurse.graduationYear !== undefined && nurse.graduationYear !== null ? nurse.graduationYear : null,
        annualLeave: nurse.annualLeave !== undefined && nurse.annualLeave !== null ? nurse.annualLeave : 0,
        storedLeave: nurse.storedLeave !== undefined && nurse.storedLeave !== null ? nurse.storedLeave : 0
      }
      this.showModal = true
    },
    hideModal() {
      this.showModal = false
      this.resetForm()
    },
    resetForm() {
      this.formData = {
        name: '',
        id: '',
        level: 'N0',
        importDate: '',
        scheduleStatus: 'on_duty',
        weeklyShifts: '',
        lastSchedule: '',
        isTeamLeader: false,
        mentor: '',
        graduationYear: null,
        annualLeave: 0,
        storedLeave: 0
      }
    },
    async saveNurse() {
      if (!this.formData.name || !this.formData.id) {
        uni.showToast({
          title: '请填写必填信息',
          icon: 'none'
        })
        return
      }
      
      // 如果是实习护士或进修护士，必须选择带班老师
      if ((this.formData.level === '实习护士' || this.formData.level === '进修护士') && !this.formData.mentor) {
        uni.showToast({
          title: '实习护士和进修护士必须选择带班老师',
          icon: 'none'
        })
        return
      }
      
      try {
        const nurseData = {
          id: this.formData.id,
          name: this.formData.name,
          level: this.formData.level,
          departmentId: this.departmentId,
          scheduleStatus: this.formData.scheduleStatus || 'on_duty',
          isTeamLeader: this.formData.isTeamLeader || false,
          mentor: this.formData.mentor || ''
        }
        
        // 添加可选的年届、年休、存休字段
        if (this.formData.graduationYear !== null && this.formData.graduationYear !== '' && this.formData.graduationYear !== undefined) {
          const year = Number(this.formData.graduationYear)
          if (year >= 1000 && year <= 9999) {
            nurseData.graduationYear = year
          }
        }
        
        if (this.formData.annualLeave !== null && this.formData.annualLeave !== '' && this.formData.annualLeave !== undefined) {
          nurseData.annualLeave = Number(this.formData.annualLeave) || 0
        }
        
        if (this.formData.storedLeave !== null && this.formData.storedLeave !== '' && this.formData.storedLeave !== undefined) {
          nurseData.storedLeave = Number(this.formData.storedLeave) || 0
        }
        
        if (this.isEdit) {
          // 更新护士
          await updateNurse(this.editingNurse.id, nurseData)
          uni.showToast({
            title: '护士信息已更新',
            icon: 'success'
          })
        } else {
          // 添加护士
          await addNurse(nurseData)
          uni.showToast({
            title: '护士添加成功',
            icon: 'success'
          })
        }
        
        this.hideModal()
        // 重新加载列表和当日排班
        await this.loadNurses()
        await this.loadTodaySchedules()
      } catch (error) {
        console.error('保存护士失败:', error)
        // 显示详细错误信息
        const errorMessage = error.message || '保存失败，请检查网络连接或联系管理员'
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
      }
    },
    deleteNurse(nurse) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除护士"${nurse.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteNurseAPI(nurse.id)
              
              // 立即从本地列表中移除，避免刷新时恢复
              this.nurses = this.nurses.filter(n => n.id !== nurse.id)
              
              uni.showToast({
                title: '护士已删除',
                icon: 'success'
              })
              
              // 延迟刷新列表，确保后端处理完成，同时强制刷新避免缓存
              setTimeout(async () => {
                await this.loadNurses(true) // 强制刷新，添加时间戳避免缓存
                await this.loadTodaySchedules() // 同时刷新当日排班
              }, 500)
            } catch (error) {
              console.error('删除护士失败:', error)
              // 错误提示已在API层处理
            }
          }
        }
      })
    },
    viewNurseDetail(nurse) {
      let content = `工号：${nurse.id}\n级别：${this.getLevelName(nurse.level)}`
      
      // 如果是实习护士或进修护士，显示带班老师信息
      if (nurse.level === '实习护士' || nurse.level === '进修护士') {
        content += `\n带班老师：${this.getMentorName(nurse.mentor)}`
        content += `\n排班安排：跟随带班老师 ${this.getMentorName(nurse.mentor)} 的排班`
      } else {
        // 普通护士显示排班相关信息
        content += `\n排班状态：${this.getScheduleStatusText(nurse.scheduleStatus)}`
        content += `\n本周班次：${nurse.weeklyShifts}次`
        content += `\n最近排班：${nurse.lastSchedule}`
      }
      
      // 如果是责任组长，显示身份
      if (nurse.isTeamLeader) {
        content += `\n身份：责任组长`
      }
      
      uni.showModal({
        title: nurse.name,
        content: content,
        showCancel: false
      })
    },
    manageSchedule(nurse) {
      uni.showToast({
        title: `管理${nurse.name}的排班`,
        icon: 'none'
      })
    },
    openImportModal() {
      this.showImportModal = true
      this.importResult = null
      this.selectedFile = null
      this.selectedFileName = ''
      this.importProgress = 0
      // #ifdef H5
      // 确保文件输入元素已准备好
      this.$nextTick(() => {
        const fileInput = document.getElementById('fileInput')
        if (!fileInput) {
          console.warn('文件输入元素未找到，可能还未渲染完成')
        } else {
          console.log('✅ 文件输入元素已准备好')
        }
      })
      // #endif
    },
    hideImportModal() {
      this.showImportModal = false
      this.importResult = null
      this.selectedFile = null
      this.selectedFileName = ''
      this.importProgress = 0
    },
    triggerFileInput(event) {
      // 阻止事件冒泡到弹窗背景
      if (event) {
        event.stopPropagation()
      }
      
      // #ifdef H5
      try {
        // 方法1: 尝试找到uni-input内部的真实input元素
        const uniInput = document.getElementById('fileInput')
        let realInput = null
        
        if (uniInput) {
          // 深度搜索uni-input内部的所有input元素
          const allInputs = uniInput.getElementsByTagName('input')
          for (let i = 0; i < allInputs.length; i++) {
            if (allInputs[i].type === 'file') {
              realInput = allInputs[i]
              break
            }
          }
          
          // 如果还没找到，尝试通过更深入的方式查找
          if (!realInput) {
            // 递归查找所有可能的input元素
            const walker = document.createTreeWalker(
              uniInput,
              NodeFilter.SHOW_ELEMENT,
              {
                acceptNode: function(node) {
                  if (node.tagName === 'INPUT' && node.type === 'file') {
                    return NodeFilter.FILTER_ACCEPT
                  }
                  return NodeFilter.FILTER_SKIP
                }
              }
            )
            
            let node = walker.nextNode()
            if (node) {
              realInput = node
            }
          }
        }
        
        // 方法2: 如果还是找不到，动态创建一个原生input元素并触发
        if (!realInput || !(realInput instanceof HTMLInputElement)) {
          console.log('⚠️ 未找到真实input元素，创建临时input元素')
          
          // 创建一个原生的input元素
          const tempInput = document.createElement('input')
          tempInput.type = 'file'
          tempInput.accept = '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv'
          tempInput.style.display = 'none'
          tempInput.onchange = (e) => {
            // 将选中的文件传递给handleFileSelect方法
            this.handleFileSelect(e)
            // 移除临时元素
            document.body.removeChild(tempInput)
          }
          
          // 添加到body并立即触发
          document.body.appendChild(tempInput)
          tempInput.click()
          console.log('✅ 通过临时创建的input元素触发文件选择对话框')
          return
        }
        
        // 方法3: 找到了真实的input元素，直接触发
        if (realInput instanceof HTMLInputElement) {
          realInput.click()
          console.log('✅ 通过找到的真实input元素触发文件选择对话框')
        } else {
          throw new Error('找到的元素不是HTMLInputElement')
        }
      } catch (error) {
        console.error('❌ 触发文件选择器时出错:', error)
        
        // 最后的备用方案：动态创建input
        try {
          const tempInput = document.createElement('input')
          tempInput.type = 'file'
          tempInput.accept = '.xlsx,.xls,.csv'
          tempInput.style.display = 'none'
          tempInput.onchange = (e) => {
            this.handleFileSelect(e)
            if (tempInput.parentNode) {
              document.body.removeChild(tempInput)
            }
          }
          document.body.appendChild(tempInput)
          tempInput.click()
          console.log('✅ 通过备用方案（动态创建input）触发文件选择对话框')
        } catch (fallbackError) {
          console.error('❌ 备用方案也失败:', fallbackError)
          uni.showToast({
            title: '打开文件选择对话框失败',
            icon: 'none',
            duration: 3000
          })
        }
      }
      // #endif
      
      // #ifndef H5
      uni.chooseFile({
        count: 1,
        extension: ['.xlsx', '.xls'],
        success: (res) => {
          this.selectedFile = res.tempFiles[0]
          this.selectedFileName = res.tempFiles[0].name
        },
        fail: (err) => {
          console.error('文件选择失败:', err)
          uni.showToast({
            title: '文件选择失败',
            icon: 'none'
          })
        }
      })
      // #endif
    },
    handleFileSelect(event) {
      // #ifdef H5
      try {
        // 阻止事件继续传播
        if (event) {
          event.stopPropagation()
        }
        
        const file = event.target && event.target.files && event.target.files[0]
        if (file) {
          // 验证文件类型
          const validTypes = ['.xlsx', '.xls', '.csv']
          const fileName = file.name.toLowerCase()
          const isValidType = validTypes.some(type => fileName.endsWith(type))
          
          if (!isValidType) {
            uni.showToast({
              title: '请选择Excel文件(.xlsx或.xls)',
              icon: 'none'
            })
            // 清空input
            if (event.target) {
              event.target.value = ''
            }
            return
          }
          
          this.selectedFile = file
          this.selectedFileName = file.name
          this.importResult = null
          
          console.log('文件已选择:', file.name)
        }
      } catch (error) {
        console.error('文件选择处理错误:', error)
        uni.showToast({
          title: '文件处理失败',
          icon: 'none'
        })
      }
      // #endif
    },
    clearFile() {
      this.selectedFile = null
      this.selectedFileName = ''
      this.importResult = null
      // #ifdef H5
      const fileInput = document.getElementById('fileInput')
      if (fileInput) {
        fileInput.value = ''
      }
      // #endif
    },
    async handleImport() {
      if (!this.selectedFile) {
        uni.showToast({
          title: '请先选择文件',
          icon: 'none'
        })
        return
      }

      this.importing = true
      this.importProgress = 0
      this.importResult = null

      try {
        let filePathOrFile = null
        
        // #ifdef H5
        // H5环境：使用File对象
        filePathOrFile = this.selectedFile
        // #endif
        
        // #ifndef H5
        // 小程序/App环境：使用文件路径
        filePathOrFile = this.selectedFile.path || this.selectedFile
        // #endif
        
        if (!filePathOrFile) {
          throw new Error('文件路径无效')
        }
        
        this.importProgress = 20
        
        // 导入前先刷新一次列表，确保本地数据是最新的
        console.log('🔄 导入前刷新列表，确保数据同步...')
        await this.loadNurses(true)
        await this.loadTodaySchedules() // 同时刷新当日排班
        console.log(`✅ 刷新完成，当前列表有 ${this.nurses.length} 人`)
        
        // 调用后端API解析Excel
        const result = await parseExcelNurse(filePathOrFile, this.departmentId)
        
        this.importProgress = 50
        
        if (result && result.success && result.nurses && result.nurses.length > 0) {
          // 如果后端接口只是解析但没有自动保存，需要批量保存
          let successCount = 0
          let failCount = 0
          const errors = []
          
          this.importProgress = 60
          
          // 批量保存护士数据
          console.log(`📥 开始批量保存 ${result.nurses.length} 个护士，当前列表已有 ${this.nurses.length} 人`)
          
          // 创建一个已处理护士的跟踪集合（包含本次导入中已处理的）
          const processedNurseIds = new Set()
          
          // 保存导入开始时的初始列表副本，用于检查是否存在，避免循环中更新列表导致误判
          const initialNurseList = [...this.nurses]
          const initialNurseIds = new Set(initialNurseList.map(n => n.id))
          
          // 记录需要定期刷新列表的计数器（每处理10个刷新一次）
          const REFRESH_INTERVAL = 10
          
          for (let i = 0; i < result.nurses.length; i++) {
            const nurse = result.nurses[i]
            try {
              // 每处理10个护士后，刷新一次列表以获取最新的后端状态
              if (i > 0 && i % REFRESH_INTERVAL === 0) {
                console.log(`🔄 已处理 ${i} 个，刷新列表以同步后端状态...`)
                await this.loadNurses(true)
                await this.loadTodaySchedules() // 同时刷新当日排班
                console.log(`✅ 刷新完成，当前列表有 ${this.nurses.length} 人`)
              }
              
              // 验证数据完整性
              if (!nurse.id || !nurse.name) {
                throw new Error(`工号或姓名为空: ${JSON.stringify(nurse)}`)
              }
              
              // 构建护士数据
              const nurseData = {
                id: String(nurse.id).trim(),
                name: String(nurse.name).trim(),
                level: String(nurse.level || 'N0').trim(),
                departmentId: this.departmentId,
                scheduleStatus: 'on_duty',
                isTeamLeader: Boolean(nurse.isTeamLeader || false),
                mentor: nurse.mentor ? String(nurse.mentor).trim() : ''
              }
              
              console.log(`[${i + 1}/${result.nurses.length}] 处理护士: ${nurseData.name} (${nurseData.id})`)
              
              // 验证必填字段
              if (!nurseData.id || !nurseData.name || !nurseData.level || !nurseData.departmentId) {
                throw new Error(`必填字段缺失: id=${nurseData.id}, name=${nurseData.name}, level=${nurseData.level}, departmentId=${nurseData.departmentId}`)
              }
              
              // 如果是实习护士或进修护士，必须要有带班老师
              if ((nurseData.level === '实习护士' || nurseData.level === '进修护士') && !nurseData.mentor) {
                // 如果没有带班老师，跳过这个护士（或者设置默认值）
                console.warn(`护士 ${nurseData.id} (${nurseData.name}) 是${nurseData.level}，但未指定带班老师，跳过`)
                throw new Error(`${nurseData.level}必须指定带班老师`)
              }
              
              // 检查本次导入中是否已经处理过相同工号
              if (processedNurseIds.has(nurseData.id)) {
                console.warn(`⚠️ 工号 ${nurseData.id} 在本批次导入中重复，跳过重复项: ${nurseData.name}`)
                throw new Error(`工号 ${nurseData.id} 在本批次导入文件中重复`)
              }
              
              // 检查该工号是否已存在：先检查初始列表，再检查当前列表（可能已刷新）
              let existingNurse = initialNurseIds.has(nurseData.id) 
                ? initialNurseList.find(n => n.id === nurseData.id) 
                : this.nurses.find(n => n.id === nurseData.id)
              
              if (existingNurse) {
                // 如果本地列表中已存在，检查是否是同一人（姓名匹配）
                if (existingNurse.name === nurseData.name) {
                  // 姓名匹配，执行更新（避免重复添加）
                  console.log(`⚠️ 护士 ${nurseData.id} (${nurseData.name}) 在本地列表中已存在，执行更新操作`)
                  try {
                    await updateNurse(nurseData.id, nurseData)
                    successCount++
                    processedNurseIds.add(nurseData.id)
                    console.log(`✅ [${i + 1}/${result.nurses.length}] 护士 ${nurseData.id} 更新成功`)
                  } catch (updateError) {
                    console.error(`❌ [${i + 1}/${result.nurses.length}] 更新失败:`, updateError)
                    throw new Error(`更新失败: ${updateError.message || '未知错误'}`)
                  }
                } else {
                  // 工号相同但姓名不同，可能是数据冲突，不执行更新，直接失败
                  console.error(`❌ 工号冲突: 工号 ${nurseData.id} 已存在，但姓名不匹配 (已有: ${existingNurse.name}, 导入: ${nurseData.name})`)
                  throw new Error(`工号 ${nurseData.id} 已存在但姓名不匹配，无法更新。已有: ${existingNurse.name}, 导入: ${nurseData.name}`)
                }
              } else {
                // 本地列表中不存在，尝试添加
                console.log(`➕ [${i + 1}/${result.nurses.length}] 尝试添加新护士: ${nurseData.name} (${nurseData.id})`)
                try {
                  await addNurse(nurseData)
                  successCount++
                  // 不立即更新本地列表，避免数据不同步，统一在最后刷新列表
                  processedNurseIds.add(nurseData.id)
                  console.log(`✅ [${i + 1}/${result.nurses.length}] 护士 ${nurseData.id} 添加成功`)
                } catch (addError) {
                  // 如果是工号已存在的错误（后端返回），需要验证是否是同一人
                  // 注意：只有明确是"工号已存在"时才更新，其他错误（如容量限制）应该直接失败
                  if (addError.message && (
                    addError.message.includes('工号已存在') || 
                    addError.message.includes('已存在') ||
                    addError.message.includes('already exists')
                  )) {
                    // 后端说已存在，但本地列表中没有，先尝试从后端查询验证
                    console.log(`⚠️ [${i + 1}/${result.nurses.length}] 护士 ${nurseData.id} (${nurseData.name}) 在后端已存在，但本地列表中不存在，尝试验证...`)
                    try {
                      // 从后端查询该护士详情
                      const existingNurseDetail = await getNurseDetail(nurseData.id)
                      
                      if (existingNurseDetail) {
                        // 后端确实存在，检查姓名是否匹配
                        if (existingNurseDetail.name === nurseData.name) {
                          // 姓名匹配，是同一人，执行更新
                          console.log(`✅ 姓名匹配，执行更新: ${nurseData.id} (${nurseData.name})`)
                          await updateNurse(nurseData.id, nurseData)
                          successCount++
                          // 不立即更新本地列表，统一在最后刷新列表
                          processedNurseIds.add(nurseData.id)
                          console.log(`✅ [${i + 1}/${result.nurses.length}] 护士 ${nurseData.id} 更新成功`)
                        } else {
                          // 姓名不匹配，可能是数据冲突，不执行更新
                          console.error(`❌ 工号冲突: 工号 ${nurseData.id} 已存在，但姓名不匹配 (后端: ${existingNurseDetail.name}, 导入: ${nurseData.name})`)
                          throw new Error(`工号 ${nurseData.id} 已存在但姓名不匹配。后端: ${existingNurseDetail.name}, 导入: ${nurseData.name}`)
                        }
                      } else {
                        // 查询返回null，可能是数据异常
                        console.error(`⚠️ 后端返回工号已存在，但查询详情为空: ${nurseData.id}`)
                        throw new Error(`工号 ${nurseData.id} 状态异常，后端说已存在但无法查询详情`)
                      }
                    } catch (detailError) {
                      // 查询详情失败（可能是404或其他错误）
                      console.error(`⚠️ 查询护士详情失败:`, detailError)
                      // 如果查询失败（404），可能是数据不同步，尝试直接更新
                      if (detailError.message && detailError.message.includes('404')) {
                        console.log(`⚠️ 护士 ${nurseData.id} 查询返回404，但添加时提示已存在，尝试直接更新...`)
                        try {
                          await updateNurse(nurseData.id, nurseData)
                          successCount++
                          // 不立即更新本地列表，统一在最后刷新列表
                          processedNurseIds.add(nurseData.id)
                          console.log(`✅ [${i + 1}/${result.nurses.length}] 护士 ${nurseData.id} 更新成功（通过更新API）`)
                        } catch (updateError) {
                          throw new Error(`更新失败: ${updateError.message || '未知错误'}`)
                        }
                      } else {
                        throw new Error(`验证失败: ${detailError.message || '未知错误'}`)
                      }
                    }
                  } else {
                    // 其他错误（如容量限制、权限不足等）直接抛出，不尝试更新
                    // 检查是否是容量限制错误（根据API文档的新格式）
                    const errorMsg = addError.message || ''
                    if (errorMsg.includes('科室容量已满') || errorMsg.includes('容量已满')) {
                      // 提取容量信息：格式为 "科室容量已满：当前有20名护士，科室容量为20，无法添加新护士"
                      throw new Error(`科室容量已满，无法添加更多护士: ${nurseData.name} (${nurseData.id})\n错误详情: ${errorMsg}`)
                    } else if (errorMsg.includes('科室容量不足') || errorMsg.includes('容量不足')) {
                      // 批量导入时的容量错误：格式为 "科室容量不足：当前有5名护士，容量为20，只能再添加15名护士，但Excel中有55名新护士需要导入"
                      throw new Error(`科室容量不足，无法导入: ${nurseData.name} (${nurseData.id})\n错误详情: ${errorMsg}`)
                    } else if (errorMsg.includes('容量') || errorMsg.includes('超过') || errorMsg.includes('limit') || errorMsg.includes('capacity')) {
                      throw new Error(`科室容量限制，无法添加更多护士: ${nurseData.name} (${nurseData.id})\n错误详情: ${errorMsg}`)
                    } else {
                      // 其他未知错误
                      console.error(`❌ [${i + 1}/${result.nurses.length}] 添加失败:`, addError)
                      throw new Error(`${addError.message || '添加失败: 未知错误'} - ${nurseData.name} (${nurseData.id})`)
                    }
                  }
                }
              }
              
              // 更新进度
              this.importProgress = 60 + Math.floor((i + 1) / result.nurses.length * 30)
            } catch (error) {
              failCount++
              const errorMsg = error.message || `护士 ${nurse.name || nurse.id} 保存失败`
              errors.push(`${nurse.id || '未知'}: ${errorMsg}`)
              console.error(`❌ [${i + 1}/${result.nurses.length}] 保存护士失败 [${nurse.id}]:`, error)
              console.error(`   错误详情: ${errorMsg}`)
              // 打印详细错误信息以便调试
              if (error.stack) {
                console.error('错误堆栈:', error.stack)
              }
            }
          }
          
          this.importProgress = 100
          
          console.log(`📊 导入完成统计: 成功 ${successCount}条，失败 ${failCount}条`)
          if (failCount > 0) {
            console.log(`❌ 失败的记录:`, errors)
          }
          
          this.importResult = {
            success: failCount === 0,
            message: `成功: ${successCount}条，失败: ${failCount}条`,
            successCount,
            failCount,
            details: errors.length > 0 ? errors.join('\n') : null
          }
          
          uni.showToast({
            title: `成功导入${successCount}条数据${failCount > 0 ? `，失败${failCount}条` : ''}`,
            icon: successCount > 0 ? 'success' : 'none',
            duration: 3000
          })
          
          // 强制刷新列表，确保获取最新数据
          console.log('🔄 开始刷新护士列表...')
          await this.loadNurses(true)
          await this.loadTodaySchedules() // 同时刷新当日排班
          console.log(`✅ 刷新完成，当前列表有 ${this.nurses.length} 人`)
          
          // 延迟关闭弹窗
          setTimeout(() => {
            this.hideImportModal()
          }, 2000)
        } else if (result && result.success) {
          // 后端可能已经自动保存了（如果没有返回nurses数组）
          this.importResult = {
            success: true,
            message: `成功: ${result.successCount}条，失败: ${result.failCount}条`,
            successCount: result.successCount,
            failCount: result.failCount,
            details: result.errors && result.errors.length > 0 ? result.errors.join('\n') : null
          }
          
          this.importProgress = 100
          
          uni.showToast({
            title: `成功导入${result.successCount}条数据`,
            icon: 'success'
          })
          
          // 重新加载列表
          await this.loadNurses()
          
          // 延迟关闭弹窗
          setTimeout(() => {
            this.hideImportModal()
          }, 2000)
        } else {
          throw new Error(result?.message || '导入失败')
        }
      } catch (error) {
        console.error('导入失败:', error)
        let errorMessage = error.message || '导入失败，请检查文件格式'
        
        // 处理不同类型的错误
        if (errorMessage.includes('科室容量不足') || errorMessage.includes('容量不足')) {
          // 批量导入时的容量限制错误（在解析Excel阶段）
          // 格式：科室容量不足：当前有5名护士，容量为20，只能再添加15名护士，但Excel中有55名新护士需要导入
          errorMessage = `导入失败：${errorMessage}\n\n请先删除部分现有护士或联系管理员增加科室容量。`
        } else if (errorMessage.includes('科室容量已满') || errorMessage.includes('容量已满')) {
          // 单个添加时的容量限制错误
          // 格式：科室容量已满：当前有20名护士，科室容量为20，无法添加新护士
          errorMessage = `导入失败：${errorMessage}\n\n请先删除部分现有护士或联系管理员增加科室容量。`
        } else if (errorMessage.includes('服务暂时不可用') || errorMessage.includes('503')) {
          errorMessage = '服务器暂时不可用，请稍后重试。如果问题持续，请联系管理员检查服务器状态。'
        } else if (errorMessage.includes('网络连接') || errorMessage.includes('fetch')) {
          errorMessage = '网络连接失败，请检查网络设置后重试'
        } else if (errorMessage.includes('科室不存在')) {
          errorMessage = `科室ID "${this.departmentId}" 不存在，请先在系统中创建该科室后再导入`
        }
        
        this.importResult = {
          success: false,
          message: errorMessage,
          details: errorMessage.includes('科室不存在') ? `请先创建科室ID: ${this.departmentId}` : 
                   errorMessage.includes('服务器') ? '服务器可能正在维护或过载，请稍后重试' : null
        }
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 4000
        })
      } finally {
        this.importing = false
        this.importProgress = 0
      }
    },
    readFile(file) {
      return new Promise((resolve, reject) => {
        // #ifdef H5
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
        // #endif
        // #ifndef H5
        uni.getFileSystemManager().readFile({
          filePath: file.path,
          success: (res) => {
            resolve(res.data)
          },
          fail: reject
        })
        // #endif
      })
    },
    async parseExcelFile(fileData) {
      // #ifdef H5
      // H5环境使用xlsx库进行前端解析（纯前端，无需后端）
      try {
        // 使用xlsx库解析Excel文件
        const workbook = XLSX.read(fileData, { type: 'array' })
        
        // 读取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 将工作表转换为JSON数组
        // 注意：header参数会让xlsx库使用第一行作为列名，所以会自动跳过第一行
        // 但为了更安全，我们使用range来确保从第二行开始读取
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: ['id', 'name', 'level'], 
          defval: '',
          range: 1 // 从第二行开始（跳过表头）
        })
        
        // 表头关键词列表，用于过滤掉可能的表头行
        const headerKeywords = ['工号', '姓名', '级别', 'level', 'id', 'name', '工号:', '姓名:', '级别:']
        
        // 转换为所需的格式，并过滤掉表头行
        const nurses = jsonData.map(row => ({
          id: String(row.id || row[0] || '').trim(),
          name: String(row.name || row[1] || '').trim(),
          level: String(row.level || row[2] || 'N0').trim()
        })).filter(nurse => {
          // 过滤空行
          if (!nurse.id || !nurse.name) {
            return false
          }
          
          // 过滤表头行：如果姓名或工号是表头关键词，则跳过
          const isHeaderRow = headerKeywords.some(keyword => 
            nurse.name === keyword || 
            nurse.id === keyword ||
            nurse.name.toLowerCase() === keyword.toLowerCase() ||
            nurse.id.toLowerCase() === keyword.toLowerCase()
          )
          
          if (isHeaderRow) {
            console.log('⚠️ 跳过表头行:', nurse)
            return false
          }
          
          return true
        })
        
        console.log('✅ Excel解析成功，共', nurses.length, '条数据')
        return nurses
      } catch (error) {
        console.error('❌ Excel解析错误:', error)
        // 如果是CSV文件，尝试使用CSV解析
        if (this.selectedFile && this.selectedFile.name && this.selectedFile.name.endsWith('.csv')) {
          return this.parseCSVFile(fileData)
        }
        throw new Error('Excel文件解析失败: ' + (error.message || '请检查文件格式'))
      }
      // #endif
      
      // #ifndef H5
      // 小程序/App环境：如果有后端API则调用，否则使用CSV解析
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: '/api/nurse/parse-excel',
            filePath: this.selectedFile.path,
            name: 'file',
            success: resolve,
            fail: reject
          })
        })
        
        const response = {
          data: JSON.parse(uploadResult.data)
        }
        
        if (response.data && response.data.success) {
          return response.data.nurses || response.data.data
        } else {
          throw new Error(response.data?.message || '解析失败')
        }
      } catch (error) {
        console.error('Excel解析错误:', error)
        // 如果是CSV文件，尝试使用CSV解析作为备选
        if (this.selectedFile && this.selectedFile.name && this.selectedFile.name.endsWith('.csv')) {
          return this.parseCSVFile(fileData)
        }
        throw new Error(error.message || 'Excel文件解析失败，请检查文件格式')
      }
      // #endif
    },
    parseCSVFile(fileData) {
      // 简单的CSV解析（作为备选方案）
      const text = new TextDecoder('utf-8').decode(fileData)
      const lines = text.split('\n').filter(line => line.trim())
      
      const nurses = []
      // 跳过表头
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i]
        // 简单的CSV解析（假设使用逗号分隔）
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''))
        
        if (parts.length >= 3 && parts[0] && parts[1]) {
          nurses.push({
            id: parts[0],
            name: parts[1],
            level: parts[2] || 'N0'
          })
        }
      }
      
      return nurses
    },
    validateAndImportNurses(nurses) {
      const currentDate = new Date().toISOString().split('T')[0]
      let successCount = 0
      let failCount = 0
      const errors = []
      
      // 表头关键词列表，用于在验证时过滤掉表头行
      const headerKeywords = ['工号', '姓名', '级别', 'level', 'id', 'name', '工号:', '姓名:', '级别:']

      nurses.forEach((nurseData, index) => {
        try {
          // 解析级别和角色
          const levelInfo = this.parseLevelAndRole(nurseData.level || nurseData[2])
          
          // 获取工号和姓名
          const nurseId = String(nurseData.id || nurseData[0] || '').trim()
          const nurseName = String(nurseData.name || nurseData[1] || '').trim()
          
          // 验证并过滤表头行
          const isHeaderRow = headerKeywords.some(keyword => 
            nurseName === keyword || 
            nurseId === keyword ||
            nurseName.toLowerCase() === keyword.toLowerCase() ||
            nurseId.toLowerCase() === keyword.toLowerCase()
          )
          
          if (isHeaderRow) {
            console.log('⚠️ 验证时跳过表头行:', { id: nurseId, name: nurseName })
            return // 跳过表头行，不计数
          }
          
          // 验证必填字段
          if (!nurseId) {
            throw new Error(`第${index + 2}行：工号不能为空`)
          }
          if (!nurseName) {
            throw new Error(`第${index + 2}行：姓名不能为空`)
          }

          // 检查工号是否已存在（nurseId已在上面定义）
          const existingNurse = this.nurses.find(n => n.id === nurseId)
          if (existingNurse) {
            // 更新现有护士
            Object.assign(existingNurse, {
              name: nurseName,
              level: levelInfo.level,
              isTeamLeader: levelInfo.isTeamLeader,
              importDate: currentDate
            })
            successCount++
          } else {
            // 添加新护士
            const newNurse = {
              id: nurseId,
              name: nurseName,
              level: levelInfo.level,
              importDate: currentDate,
              scheduleStatus: 'on_duty',
              weeklyShifts: 0,
              lastSchedule: '',
              isTeamLeader: levelInfo.isTeamLeader,
              mentor: ''
            }
            this.nurses.push(newNurse)
            successCount++
          }
        } catch (error) {
          failCount++
          errors.push(error.message)
        }
      })

      return {
        success: failCount === 0,
        message: `成功: ${successCount}条，失败: ${failCount}条`,
        successCount,
        failCount,
        details: errors.length > 0 ? errors.join('\n') : null
      }
    },
    parseLevelAndRole(levelText) {
      if (!levelText) {
        return { level: 'N0', isTeamLeader: false }
      }

      const text = String(levelText).trim()
      let level = 'N0'
      let isTeamLeader = false

      // 解析级别 (N4、N3、N2、N1、N0)
      if (text.includes('N4')) {
        level = 'N4'
      } else if (text.includes('N3')) {
        level = 'N3'
      } else if (text.includes('N2')) {
        level = 'N2'
      } else if (text.includes('N1')) {
        level = 'N1'
      } else if (text.includes('N0')) {
        level = 'N0'
      }

      // 检查是否是责任组长
      if (text.includes('责任组长') || text.includes('/责任组长')) {
        isTeamLeader = true
      }

      return { level, isTeamLeader }
    },
    getLevelName(level) {
      const levelMap = {
        'N4': 'N4护士',
        'N3': 'N3护士',
        'N2': 'N2护士',
        'N1': 'N1护士',
        'N0': 'N0护士',
        '实习护士': '实习护士',
        '进修护士': '进修护士'
      }
      return levelMap[level] || level || '未知'
    },
    getMentorName(mentorId) {
      const mentor = this.nurses.find(nurse => nurse.id === mentorId)
      return mentor ? mentor.name : '未指定'
    },
    getScheduleStatusText(status) {
      const statusMap = {
        'on_duty': '在岗',
        'off_duty': '休息',
        'leave': '请假',
        'training': '培训',
        'sick': '病假',
        'maternity': '怀孕请假',
        'study': '进修',
        'support': '外派支援'
      }
      return statusMap[status] || '未知'
    },
    // 批量选择相关方法
    toggleBatchMode() {
      this.isBatchMode = true
      this.selectedNurseIds = []
    },
    cancelBatchMode() {
      this.isBatchMode = false
      this.selectedNurseIds = []
    },
    handleCardClick(nurse) {
      if (this.isBatchMode) {
        this.toggleNurseSelect(nurse.id)
      } else {
        this.viewNurseDetail(nurse)
      }
    },
    toggleNurseSelect(nurseId) {
      const index = this.selectedNurseIds.indexOf(nurseId)
      if (index > -1) {
        this.selectedNurseIds.splice(index, 1)
      } else {
        this.selectedNurseIds.push(nurseId)
      }
    },
    isNurseSelected(nurseId) {
      return this.selectedNurseIds.includes(nurseId)
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedNurseIds = []
      } else {
        this.selectedNurseIds = this.filteredNurses.map(nurse => nurse.id)
      }
    },
    async handleBatchDelete() {
      if (this.selectedNurseIds.length === 0) {
        uni.showToast({
          title: '请至少选择一个护士',
          icon: 'none'
        })
        return
      }

      // 显示更详细的确认信息
      const selectedNames = this.filteredNurses
        .filter(nurse => this.selectedNurseIds.includes(nurse.id))
        .map(nurse => nurse.name)
        .slice(0, 5)
        .join('、')
      const nameList = selectedNames + (this.selectedNurseIds.length > 5 ? ' 等' : '')

      uni.showModal({
        title: '确认批量删除',
        content: `确定要删除选中的 ${this.selectedNurseIds.length} 个护士吗？\n(${nameList})\n\n此操作不可恢复！`,
        success: async (res) => {
          if (res.confirm) {
            try {
              console.log('开始批量删除，选中的护士ID:', this.selectedNurseIds)
              
              // 调用批量删除API
              const result = await batchDeleteNurse({ 
                nurseIds: this.selectedNurseIds 
              })
              
              console.log('批量删除成功，返回结果:', result)
              
              const deletedCount = result?.deletedCount || this.selectedNurseIds.length
              
              uni.showToast({
                title: `成功删除 ${deletedCount} 个护士`,
                icon: 'success',
                duration: 2000
              })
              
              // 立即从本地列表中移除已删除的护士（避免刷新时恢复）
              const deletedIds = new Set(this.selectedNurseIds)
              this.nurses = this.nurses.filter(nurse => !deletedIds.has(nurse.id))
              
              // 清空选择并退出批量模式
              this.selectedNurseIds = []
              this.isBatchMode = false
              
              // 延迟刷新列表，确保后端处理完成，同时强制刷新避免缓存
              setTimeout(async () => {
                await this.loadNurses(true) // 传入true表示强制刷新
                await this.loadTodaySchedules() // 同时刷新当日排班
              }, 1000)
              
            } catch (error) {
              console.error('批量删除失败:', error)
              
              // 提供更详细的错误信息
              let errorMessage = error.message || '批量删除失败'
              
              // 如果是404错误，说明接口确实不存在或路径错误
              if (errorMessage.includes('404') || errorMessage.includes('不存在')) {
                // 提供更详细的错误信息和解决方案
                uni.showModal({
                  title: '批量删除接口不可用',
                  content: `批量删除接口返回404错误，可能的原因：\n\n1. 后端未实现该接口\n2. 接口路径不正确\n3. 服务器不支持DELETE请求\n\n已尝试多种请求方式均失败。\n\n是否尝试逐个删除选中的 ${this.selectedNurseIds.length} 个护士？`,
                  success: async (modalRes) => {
                    if (modalRes.confirm) {
                      await this.deleteNursesOneByOne()
                    }
                  }
                })
                return
              } else if (errorMessage.includes('网络') || errorMessage.includes('连接')) {
                errorMessage = '网络连接失败，请检查网络后重试'
              } else if (errorMessage.includes('护士不存在')) {
                errorMessage = `部分或全部选中的护士在后端不存在。\n可能是数据不同步，请刷新列表后重试。`
              }
              
              uni.showModal({
                title: '批量删除失败',
                content: errorMessage,
                showCancel: false,
                confirmText: '我知道了'
              })
            }
          }
        }
      })
    },
    // 逐个删除护士（批量删除接口不可用时的降级方案）
    async deleteNursesOneByOne() {
      const total = this.selectedNurseIds.length
      let successCount = 0
      let failCount = 0
      const failedNurses = []
      
      uni.showLoading({
        title: `正在删除 0/${total}`,
        mask: true
      })
      
      // 逐个删除
      for (let i = 0; i < this.selectedNurseIds.length; i++) {
        const nurseId = this.selectedNurseIds[i]
        try {
          uni.showLoading({
            title: `正在删除 ${i + 1}/${total}`,
            mask: true
          })
          
          await deleteNurseAPI(nurseId)
          successCount++
          
          // 立即从本地列表中移除，避免刷新时恢复
          this.nurses = this.nurses.filter(nurse => nurse.id !== nurseId)
          
          // 每删除5个休息一下，避免请求过快
          if ((i + 1) % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (error) {
          failCount++
          const nurse = this.nurses.find(n => n.id === nurseId)
          const nurseName = nurse ? nurse.name : nurseId
          failedNurses.push(nurseName)
          console.error(`删除护士失败 [${nurseId}]:`, error)
        }
      }
      
      uni.hideLoading()
      
      // 显示结果
      if (failCount === 0) {
        uni.showToast({
          title: `成功删除 ${successCount} 个护士`,
          icon: 'success',
          duration: 2000
        })
      } else {
        uni.showModal({
          title: '删除完成',
          content: `成功: ${successCount}个\n失败: ${failCount}个\n\n失败的护士：${failedNurses.slice(0, 5).join('、')}${failedNurses.length > 5 ? ' 等' : ''}`,
          showCancel: false
        })
      }
      
      // 清空选择并退出批量模式
      this.selectedNurseIds = []
      this.isBatchMode = false
      
      // 强制刷新列表，确保获取最新数据（不依赖本地缓存）
      setTimeout(async () => {
        await this.loadNurses(true) // 强制刷新，添加时间戳避免缓存
        await this.loadTodaySchedules() // 同时刷新当日排班
      }, 1000)
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 科室信息头部 */
.department-header {
  background-color: #ffffff;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.dept-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.dept-icon {
  font-size: 48rpx;
}

.dept-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.dept-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}


.dept-stats {
  font-size: 22rpx;
  color: #999999;
}

.dept-status {
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.dept-status.active {
  background-color: #d1fae5;
  color: #065f46;
}

/* 操作栏 */
.action-bar {
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-section {
  margin-bottom: 20rpx;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 25rpx;
  padding: 0 20rpx;
  height: 70rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  color: #666666;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
}

.filter-section {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  background-color: #f5f5f5;
  color: #666666;
  font-size: 24rpx;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 25rpx;
  color: #ffffff;
  font-size: 26rpx;
  transition: all 0.3s ease;
}

.add-btn:active {
  transform: scale(0.95);
}

.add-icon {
  font-size: 24rpx;
}

.add-text {
  font-weight: 500;
}

/* 护士列表 */
.nurse-list {
  padding: 20rpx 30rpx 30rpx;
}

.nurse-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.nurse-card:active {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.nurse-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
}

.nurse-info {
  flex: 1;
}

.nurse-name {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.nurse-id {
  display: block;
  font-size: 24rpx;
  color: #666666;
}

.nurse-level {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: bold;
}

.level-N4 {
  background-color: #fef3c7;
  color: #92400e;
}

.level-N3 {
  background-color: #dbeafe;
  color: #1e40af;
}

.level-N2 {
  background-color: #d1fae5;
  color: #065f46;
}

.level-N1 {
  background-color: #e0e7ff;
  color: #3730a3;
}

.level-N0 {
  background-color: #f3e8ff;
  color: #7c2d12;
}

.card-content {
  padding: 0 30rpx 20rpx;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.info-item {
  text-align: center;
}

.info-label {
  display: block;
  font-size: 22rpx;
  color: #666666;
  margin-bottom: 4rpx;
}

.info-value {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
}

.status-on_duty {
  color: #10b981;
}

.status-off_duty {
  color: #6b7280;
}

.status-leave {
  color: #f59e0b;
}

.status-training {
  color: #3b82f6;
}

.status-sick {
  color: #ef4444;
}

.status-maternity {
  color: #ec4899;
}

.status-study {
  color: #8b5cf6;
}

.status-support {
  color: #06b6d4;
}

.role-info {
  margin: 15rpx 0;
  text-align: center;
}

.role-badge {
  display: inline-block;
  padding: 8rpx 16rpx;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
}

.checkbox-group {
  margin-top: 10rpx;
}

.checkbox-item {
  padding: 16rpx 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.checkbox-item.active {
  border-color: #f59e0b;
  background-color: #fef3c7;
  color: #92400e;
}

.checkbox-text {
  font-size: 26rpx;
  font-weight: 500;
}

.mentor-selector {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  max-height: 300rpx;
  overflow-y: auto;
}

.mentor-option {
  padding: 16rpx 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  background-color: #ffffff;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.mentor-option.active {
  border-color: #667eea;
  background-color: #f0f4ff;
}

.mentor-option-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
}

.mentor-option.active .mentor-option-text {
  color: #667eea;
}

.mentor-option-level {
  font-size: 22rpx;
  color: #666666;
}

.mentor-option.active .mentor-option-level {
  color: #667eea;
}

.schedule-info {
  background-color: #f8f9fa;
  padding: 20rpx;
  border-radius: 12rpx;
}

.schedule-label {
  font-size: 22rpx;
  color: #666666;
}

.schedule-text {
  font-size: 24rpx;
  color: #333333;
  margin-left: 8rpx;
}

.card-actions {
  display: flex;
  padding: 20rpx 30rpx 30rpx;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
}

.edit-btn {
  background-color: #e0f2fe;
  color: #0277bd;
}

.schedule-btn {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.delete-btn {
  background-color: #ffebee;
  color: #c62828;
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 22rpx;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 100rpx 30rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: block;
}

.empty-desc {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #666666;
}

.modal-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333333;
  background-color: #ffffff;
}

.form-input:focus {
  border-color: #667eea;
  outline: none;
}

.level-selector, .status-selector {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.level-option, .status-option {
  padding: 12rpx 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  background-color: #ffffff;
  transition: all 0.3s ease;
}

.level-option.active, .status-option.active {
  border-color: #667eea;
  background-color: #f0f4ff;
  color: #667eea;
}

.level-option-text {
  font-size: 24rpx;
  font-weight: bold;
  margin-right: 8rpx;
}

.level-option-name {
  font-size: 22rpx;
}

.status-option-text {
  font-size: 24rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666666;
}

.btn-secondary:active {
  background-color: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-primary:active {
  transform: scale(0.95);
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-disabled:active {
  transform: none;
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 15rpx;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 12rpx;
  }
  
  .filter-section {
    justify-content: center;
  }
}

/* 导入相关样式 */
.import-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background-color: #f0f4ff;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.import-btn:active {
  transform: scale(0.95);
}

.import-icon {
  font-size: 24rpx;
}

.import-text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

.batch-mode-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background-color: #f0f4ff;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.batch-mode-btn:active {
  transform: scale(0.95);
}

.batch-icon {
  font-size: 24rpx;
}

.batch-text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: 100%;
}

.select-all-btn {
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.select-all-btn:active {
  transform: scale(0.95);
}

.select-all-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.batch-delete-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.batch-delete-btn:active {
  transform: scale(0.95);
}

.batch-delete-btn.btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.batch-delete-icon {
  font-size: 24rpx;
}

.batch-delete-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
}

.cancel-batch-btn {
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  transition: all 0.3s ease;
}

.cancel-batch-btn:active {
  transform: scale(0.95);
}

.cancel-batch-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.nurse-checkbox {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  border-radius: 8rpx;
  background-color: #f5f5f5;
  transition: all 0.3s ease;
}

.checkbox-icon {
  font-size: 32rpx;
}

.nurse-card.batch-mode {
  position: relative;
}

.nurse-card.selected {
  border: 2rpx solid #667eea;
  background-color: #f0f4ff;
}

.import-modal {
  max-width: 700rpx;
}

.import-tips {
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.tips-title {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
}

.tips-text {
  display: block;
  font-size: 24rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 8rpx;
}

.file-upload-section {
  margin-bottom: 30rpx;
}

.select-file-btn {
  padding: 20rpx 40rpx;
  background-color: #667eea;
  color: #ffffff;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  cursor: pointer;
  position: relative;
  z-index: 0;
}

.select-file-btn:active {
  background-color: #5568d3;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background-color: #f0f4ff;
  border-radius: 12rpx;
}

.file-name {
  font-size: 24rpx;
  color: #667eea;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-remove {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  font-size: 24rpx;
  cursor: pointer;
}

.import-progress {
  margin: 30rpx 0;
}

.progress-text {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.progress-bar {
  height: 8rpx;
  background-color: #e5e7eb;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #667eea;
  transition: width 0.3s ease;
}

.import-result {
  margin-top: 30rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background-color: #f8f9fa;
}

.result-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.result-title.success {
  color: #10b981;
}

.result-title.error {
  color: #ef4444;
}

.result-text {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 8rpx;
}

.result-details {
  display: block;
  font-size: 22rpx;
  color: #999999;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 200rpx;
  overflow-y: auto;
}

.btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>