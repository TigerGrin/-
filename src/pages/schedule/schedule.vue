<template>
  <view class="container">
    <!-- 头部信息 -->
    <view class="schedule-header">
      <view class="header-info">
        <text class="header-title">浙江大学医学院附属第二医院</text>
        <text class="header-subtitle">重症医学科1病区 周排班表</text>
        <text class="header-dept">科室：重症医学科1病区</text>
        <text class="header-date">时间：{{ weekStart }} -- {{ weekEnd }}</text>
      </view>
      <view class="header-actions">
        <view class="week-nav" @click="prevWeek">
          <text class="nav-icon">←</text>
        </view>
        <view class="current-week">{{ currentWeekText }}</view>
        <view class="week-nav" @click="nextWeek">
          <text class="nav-icon">→</text>
        </view>
        <view class="save-btn" @click="saveStoredLeave">
          <text class="save-icon">💾</text>
          <text class="save-text">保存存休</text>
        </view>
        <view class="export-btn" @click="exportToExcel">
          <text class="export-icon">📥</text>
          <text class="export-text">导出Excel</text>
        </view>
      </view>
    </view>

    <!-- 状态/班次类型选择面板 -->
    <view class="shift-panel">
      <view class="panel-title">状态/班次类型</view>
      <view class="shift-types">
        <view
          v-for="shift in shiftTypes"
          :key="shift.value"
          class="shift-type-tag"
          :class="{ selected: selectedShift?.value === shift.value }"
          @click="selectShift(shift)"
        >
          <text class="shift-tag-text">{{ getShiftDisplayName(shift) }}</text>
        </view>
      </view>
    </view>

    <!-- 周排班表格 -->
    <view class="schedule-table-wrapper">
      <scroll-view class="table-scroll" scroll-x="true" scroll-y="true">
        <view class="schedule-table">
          <!-- 表头 -->
          <view class="table-header">
            <view class="header-cell fixed-col">工号</view>
            <view class="header-cell fixed-col">姓名</view>
            <view class="header-cell fixed-col">年届</view>
            <view class="header-cell fixed-col">年休</view>
            <view class="header-cell fixed-col">存休</view>
        <view
              v-for="(day, index) in weekDays" 
          :key="index"
              class="header-cell date-col"
            >
              <text class="date-text">{{ day.date }}</text>
              <text class="weekday-text">{{ day.weekday }}</text>
            </view>
            <view class="header-cell hours-col">当周工时</view>
            <view class="header-cell remarks-col">备注</view>
            <view class="header-cell weekly-stored-leave-col">当周存休</view>
          </view>

          <!-- 表格内容 -->
          <view class="table-body">
              <view
              v-for="nurse in sortedNurses"
              :key="nurse.id"
              class="table-row"
            >
              <!-- 固定列 -->
              <view class="cell fixed-col">{{ nurse.id }}</view>
              <view class="cell fixed-col">{{ nurse.name }}</view>
              <view class="cell fixed-col">{{ nurse.graduationYear || '-' }}</view>
              <view class="cell fixed-col">{{ nurse.annualLeave !== undefined && nurse.annualLeave !== null ? nurse.annualLeave : 0 }}</view>
              <view class="cell fixed-col">{{ nurse.storedLeave !== undefined && nurse.storedLeave !== null ? nurse.storedLeave : 0 }}</view>
              
              <!-- 日期列 -->
              <view
                v-for="(day, dayIndex) in weekDays"
                :key="dayIndex"
                class="cell date-col schedule-cell"
                :class="{ 'cell-has-schedule': hasSchedule(nurse.id, day.dateStr) }"
                @click="handleCellClick(nurse.id, day.dateStr)"
              >
                <view
                  v-if="getSchedulesForCell(nurse.id, day.dateStr).length > 0"
                  class="schedule-content-wrapper"
                >
                  <view
                    v-for="(schedule, sIndex) in getSchedulesForCell(nurse.id, day.dateStr)"
                    :key="schedule.id || sIndex"
                    class="schedule-content"
                    @click.stop="handleScheduleDoubleClick(schedule)"
                    @contextmenu.prevent.stop="handleScheduleClick(schedule.nurseId, schedule.date, schedule)"
                  >
                    <text class="schedule-text">{{ getScheduleDisplayText(schedule) }}</text>
                  </view>
                </view>
                <view v-else class="schedule-placeholder">
                  <text class="placeholder-text">点击填入状态</text>
                </view>
              </view>

              <!-- 当周工时列 -->
              <view class="cell hours-col">
                <text class="hours-text">{{ formatWeeklyHours(nurse.id) }}</text>
              </view>
              <!-- 备注列 -->
              <view class="cell remarks-col">
                <input 
                  type="text" 
                  v-model="remarks[nurse.id]"
                  placeholder="备注"
                  class="remarks-input"
                />
              </view>
              <!-- 当周存休列 -->
              <view class="cell weekly-stored-leave-col">
                <text class="stored-leave-text">{{ formatWeeklyStoredLeave(nurse.id) }}</text>
              </view>
            </view>
              </view>
                  </view>
      </scroll-view>
    </view>

    <!-- 工时设置弹窗 -->
    <view class="modal-overlay" v-if="showHoursModal" @click="hideHoursModal">
      <view class="modal-content hours-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">设置工时</text>
          <view class="close-btn" @click="hideHoursModal">×</view>
        </view>
        <view class="modal-body">
          <view class="form-group" v-if="editingSchedule">
            <text class="form-label">护士：{{ getNurseName(editingSchedule.nurseId) }}</text>
          </view>
          <view class="form-group" v-if="editingSchedule">
            <text class="form-label">日期：{{ editingSchedule.date }}</text>
          </view>
          <view class="form-group" v-if="editingSchedule">
            <text class="form-label">班次：{{ getScheduleDisplayText(editingSchedule) }}</text>
          </view>
          <!-- 备日班和备夜班的启用开关 -->
          <view class="form-group" v-if="isBackupShift">
            <text class="form-label">是否启用</text>
            <view class="switch-group">
              <view 
                class="switch-item" 
                :class="{ active: isBackupEnabled }"
                @click="toggleBackupEnabled"
              >
                <text class="switch-text">{{ isBackupEnabled ? '已启用' : '未启用' }}</text>
              </view>
            </view>
          </view>
          <!-- 时间段选择 -->
          <view class="form-group">
            <text class="form-label">时间段</text>
            <view class="switch-group">
              <view 
                class="switch-item" 
                :class="{ active: timePeriod === 'full' }"
                @click="timePeriod = 'full'"
              >
                <text class="switch-text">整班</text>
              </view>
              <view 
                class="switch-item" 
                :class="{ active: timePeriod === 'morning' }"
                @click="timePeriod = 'morning'"
              >
                <text class="switch-text">上午</text>
              </view>
              <view 
                class="switch-item" 
                :class="{ active: timePeriod === 'afternoon' }"
                @click="timePeriod = 'afternoon'"
              >
                <text class="switch-text">下午</text>
              </view>
            </view>
          </view>
          <view class="form-group" v-if="!isBackupShift || isBackupEnabled">
            <text class="form-label">工时（小时）</text>
            <input 
              type="number" 
              v-model.number="editingHours" 
              placeholder="请输入工时"
              class="form-input"
              :disabled="isBackupShift && !isBackupEnabled"
              min="0"
              max="24"
              step="0.5"
            />
          </view>
          <view class="form-group" v-if="isBackupShift && !isBackupEnabled">
            <text class="form-label">工时：0小时（未启用）</text>
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn btn-secondary" @click="hideHoursModal">取消</view>
          <view class="btn btn-primary" @click="saveHours">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// #ifdef H5
import ExcelJS from 'exceljs'
// #endif
import { getNurseList, updateNurse } from '@/api/nurse'
import { 
  getScheduleList, 
  createSchedule, 
  updateSchedule,
  deleteSchedule, 
  validateSchedule 
} from '@/api/schedule'

const LEGACY_SHIFT_NAME_VALUE_MAP = {
  // 已删除：'上午治疗/调休0.5': 'morning_treatment'
}

const ZERO_HOUR_SHIFT_VALUES = new Set([
  'rest',
  'compensatory',
  'half_compensatory',
  'backup_day',
  'backup_night'
])

const TWELVE_HOUR_SHIFT_VALUES = new Set([
  'night_1_5',
  'duty_1_5',
  'night_leader',
  'night_nurse'
])

export default {
  data() {
    return {
      departmentId: 'D001',
      currentWeekStart: this.getWeekStart(new Date()),
      nurses: [],
      schedules: [],
      selectedShift: null,
      remarks: {},
      loading: false,
      showHoursModal: false,
      editingSchedule: null,
      editingHours: 8,
      isBackupEnabled: false, // 备班是否启用
      timePeriod: 'full', // 时间段选择：'full'(整班)、'morning'(上午) 或 'afternoon'(下午)
      weeklyStoredLeaveCalculated: {}, // 记录本周已计算过存休的护士及其存休变化 { nurseId: storedLeaveDays }
      doubleClickTimer: null, // 双击检测定时器
      // 状态/班次类型定义
      shiftTypes: [
        { value: 'rest', name: '休息' },
        { value: 'compensatory', name: '调休' },
        { value: 'night_1_5', name: '夜*1.5' },
        { value: 'duty_1_5', name: '责*1.5' },
        { value: 'treatment_1_25', name: '治疗1.25' },
        { value: 'backup_day', name: '备日班' },
        { value: 'training', name: '院内培训' },
        { value: 'day_team_leader', name: '责任组长(白班)' },
        { value: 'day_duty_nurse', name: '责任护士(白班)' },
        { value: 'day_office', name: '办公护士(白班)' },
        { value: 'day_treatment', name: '治疗护士(白班)' },
        { value: 'night_leader', name: '组长(夜班)' },
        { value: 'night_nurse', name: '护士(夜班)' },
        { value: 'backup_night', name: '备夜班' }
      ]
    }
  },
  computed: {
    // 判断当前编辑的排班是否是备日班或备夜班
    isBackupShift() {
      if (!this.editingSchedule) {
        return false
      }
      const shiftValue = this.editingSchedule.shiftValue || this.getScheduleShiftValue(this.editingSchedule)
      return shiftValue === 'backup_day' || shiftValue === 'backup_night'
    },
    weekStart() {
      return this.formatDate(this.currentWeekStart)
    },
    weekEnd() {
      const end = new Date(this.currentWeekStart)
      end.setDate(end.getDate() + 6)
      return this.formatDate(end)
    },
    currentWeekText() {
      return `${this.weekStart} 至 ${this.weekEnd}`
    },
    weekDays() {
      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(this.currentWeekStart)
        date.setDate(date.getDate() + i)
        const dateStr = this.formatDate(date)
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        days.push({
          date: `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`,
          weekday: weekdays[date.getDay()],
          dateStr
        })
      }
      return days
    },
    sortedNurses() {
      // 按照数据库索引值排序（orderIndex, index, sortOrder等字段）
      const nurses = [...this.nurses]
      return nurses.sort((a, b) => {
        // 优先使用orderIndex字段
        if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
          return (a.orderIndex || 0) - (b.orderIndex || 0)
        }
        // 其次使用index字段
        if (a.index !== undefined && b.index !== undefined) {
          return (a.index || 0) - (b.index || 0)
        }
        // 再次使用sortOrder字段
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return (a.sortOrder || 0) - (b.sortOrder || 0)
        }
        // 如果都没有，按照创建时间排序
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt) - new Date(b.createdAt)
        }
        // 最后按照工号排序
        return (a.id || '').localeCompare(b.id || '')
      })
    },
    shiftNameToValueMap() {
      const map = {}
      this.shiftTypes.forEach((shift) => {
        map[shift.name] = shift.value
      })
      return {
        ...LEGACY_SHIFT_NAME_VALUE_MAP,
        ...map
      }
    },
    weeklyHoursMap() {
      const weekDateSet = new Set(this.weekDays.map(day => day.dateStr))
      const hoursMap = {}

      this.nurses.forEach(nurse => {
        hoursMap[nurse.id] = 0
      })

      this.schedules.forEach(schedule => {
        if (!weekDateSet.has(schedule.date)) {
          return
        }
        const shiftValue = this.getScheduleShiftValue(schedule)
        const hours = this.getHoursForShiftValue(shiftValue, schedule)
        hoursMap[schedule.nurseId] = (hoursMap[schedule.nurseId] || 0) + hours
      })

      return hoursMap
    },
    weeklyStoredLeaveMap() {
      const BASE_HOURS = 40 // 基准工时40小时
      const HOURS_PER_DAY = 8 // 每天8小时
      const storedLeaveMap = {}
      const weeklyHours = this.weeklyHoursMap

      this.nurses.forEach(nurse => {
        const weeklyHoursValue = weeklyHours[nurse.id] || 0
        // 计算与基准的差值
        const hoursDiff = weeklyHoursValue - BASE_HOURS
        // 计算存休天数（保留正负）：(当周工时 - 40) / 8
        const storedLeaveDays = hoursDiff / HOURS_PER_DAY
        storedLeaveMap[nurse.id] = storedLeaveDays
      })

      return storedLeaveMap
    }
  },
  onLoad(options) {
    if (options.departmentId) {
      this.departmentId = options.departmentId
    }
    this.loadNurses()
    this.loadSchedules()
  },
  methods: {
    getWeekStart(date) {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // 周一为起始
      return new Date(d.setDate(diff))
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    resolveShiftValue(scheduleData) {
      if (!scheduleData) {
        return ''
      }
      if (scheduleData.shiftValue) {
        return scheduleData.shiftValue
      }
      if (scheduleData.shiftName && this.shiftNameToValueMap[scheduleData.shiftName]) {
        return this.shiftNameToValueMap[scheduleData.shiftName]
      }
      if (scheduleData.shiftType === 'off_duty') {
        if (scheduleData.shiftName === '调休0.5') {
          return 'half_compensatory'
        }
        if (scheduleData.shiftName === '调休') {
          return 'compensatory'
        }
        return 'rest'
      }
      return scheduleData.shiftType || ''
    },
    getScheduleShiftValue(schedule) {
      if (!schedule) {
        return ''
      }
      if (schedule.shiftValue) {
        return schedule.shiftValue
      }
      if (schedule.shiftName && this.shiftNameToValueMap[schedule.shiftName]) {
        return this.shiftNameToValueMap[schedule.shiftName]
      }
      if (schedule.shiftType === 'off_duty') {
        return 'rest'
      }
      return schedule.shiftType || ''
    },
    getHoursForShiftValue(shiftValue, schedule) {
      // 优先使用手动设置的工时
      if (schedule && schedule.hours !== undefined && schedule.hours !== null) {
        // 对于备日班和备夜班，如果工时为0，表示未启用，返回0
        if ((shiftValue === 'backup_day' || shiftValue === 'backup_night') && schedule.hours === 0) {
          return 0
        }
        return schedule.hours
      }
      
      // 如果没有手动设置，使用默认工时
      if (!shiftValue) {
        return 0
      }
      // 备日班和备夜班默认未启用，工时为0
      if (shiftValue === 'backup_day' || shiftValue === 'backup_night') {
        return 0
      }
      if (ZERO_HOUR_SHIFT_VALUES.has(shiftValue)) {
        return 0
      }
      if (TWELVE_HOUR_SHIFT_VALUES.has(shiftValue)) {
        return 12
      }
      return 8
    },
    formatWeeklyHours(nurseId) {
      const hours = this.weeklyHoursMap[nurseId] || 0
      return `${hours}h`
    },
    formatWeeklyStoredLeave(nurseId) {
      const storedLeaveDays = this.weeklyStoredLeaveMap[nurseId] || 0
      // 保留2位小数，正数显示+号
      const formatted = storedLeaveDays > 0 
        ? `+${storedLeaveDays.toFixed(2)}` 
        : storedLeaveDays.toFixed(2)
      return formatted
    },
    prevWeek() {
      const newDate = new Date(this.currentWeekStart)
      newDate.setDate(newDate.getDate() - 7)
      this.currentWeekStart = newDate
      // 切换周时，清空本周已计算的存休记录
      this.weeklyStoredLeaveCalculated = {}
      this.loadSchedules()
    },
    nextWeek() {
      const newDate = new Date(this.currentWeekStart)
      newDate.setDate(newDate.getDate() + 7)
      this.currentWeekStart = newDate
      // 切换周时，清空本周已计算的存休记录
      this.weeklyStoredLeaveCalculated = {}
      this.loadSchedules()
    },
    async loadNurses() {
      try {
        const result = await getNurseList({ 
          departmentId: this.departmentId,
          page: 1,
          pageSize: 1000
        })
        if (result && result.list) {
          this.nurses = result.list
          console.log(`✅ 已加载护士列表，共 ${result.list.length} 人`)
        }
      } catch (error) {
        console.error('加载护士列表失败:', error)
      }
    },
    async loadSchedules() {
      this.loading = true
      try {
        const result = await getScheduleList({
          departmentId: this.departmentId,
          startDate: this.weekStart,
          endDate: this.weekEnd
        })
        
        if (result && result.list) {
          this.schedules = result.list.map(item => ({
            id: item._id || item.id,
            nurseId: item.nurseId,
            nurseName: item.nurseName,
            date: item.date,
            shiftType: item.shiftType,
            shiftName: item.shiftName,
            shiftValue: this.resolveShiftValue(item),
            timePeriod: item.timePeriod || 'full', // 加载时添加时间段信息
            hours: item.hours !== undefined && item.hours !== null ? item.hours : undefined
          }))
          
          // 切换周时，清空本周已计算的存休记录
          this.weeklyStoredLeaveCalculated = {}
        }
      } catch (error) {
        console.error('加载排班数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    getShiftDisplayName(shift) {
      if (!shift) {
        return ''
      }
      if (shift.value === 'half_compensatory' || shift.name === '调休0.5') {
        return '调休'
      }
      return shift.name
    },
    // 状态选择与填充
    selectShift(shift) {
      if (this.selectedShift && this.selectedShift.value === shift.value) {
        this.selectedShift = null
        uni.showToast({
          title: '已取消选择',
          icon: 'none'
        })
      } else {
        this.selectedShift = shift
        uni.showToast({
          title: `已选择${this.getShiftDisplayName(shift)}`,
          icon: 'none'
        })
      }
    },
    async handleCellClick(nurseId, dateStr) {
      if (!this.selectedShift) {
        uni.showToast({
          title: '请先在上方选择状态',
          icon: 'none'
        })
        return
      }
      await this.applyShiftToCell(this.selectedShift, nurseId, dateStr)
    },
    async applyShiftToCell(shift, nurseId, dateStr) {
      if (!shift) {
        return
      }

      // 不再检查是否已有排班，直接添加新排班（支持同一天多个排班）

      // 映射状态到API的shiftType
      // 特殊状态（休息、调休等）使用特殊的shiftType来标识
      const shiftTypeMap = {
        'rest': 'off_duty', // 休息状态，使用off_duty标识
        'compensatory': 'off_duty', // 调休状态，也使用off_duty标识
        'half_compensatory': 'off_duty',
        'night_1_5': 'night_nurse',
        'duty_1_5': 'day_duty_nurse',
        'treatment_1_25': 'day_treatment',
        'backup_day': 'backup_day',
        'training': 'training', // 培训状态
        'day_team_leader': 'day_team_leader',
        'day_duty_nurse': 'day_duty_nurse',
        'day_office': 'day_office',
        'day_treatment': 'day_treatment',
        'night_leader': 'night_leader',
        'night_nurse': 'night_nurse',
        'backup_night': 'backup_night'
      }

      const shiftType = shiftTypeMap[shift.value] || shift.value

      // 检查是否已有排班（支持同一天多个排班，所以不阻止）
      const existingSchedules = this.getSchedulesForCell(nurseId, dateStr)
      const hasExistingSchedule = existingSchedules.length > 0

      // 验证排班规则（休息和调休状态跳过验证）
      // 如果已有排班，也跳过验证（因为验证可能会阻止同一天多个排班）
      const skipValidation = ['rest', 'compensatory', 'half_compensatory', 'training'].includes(shift.value) || hasExistingSchedule

      if (shift.value === 'rest') {
        const weekDateSet = new Set(this.weekDays.map(day => day.dateStr))
        const restCount = this.schedules.filter(schedule => 
          schedule.nurseId === nurseId &&
          weekDateSet.has(schedule.date) &&
          this.getScheduleShiftValue(schedule) === 'rest'
        ).length

        if (restCount >= 2) {
          uni.showToast({
            title: '本周休息次数已达上限（2次）',
            icon: 'none'
          })
          return
        }
      }
      
      if (!skipValidation) {
        try {
          const nurse = this.nurses.find(n => n.id === nurseId)
          if (!nurse) {
            throw new Error('护士不存在')
          }

        const validateResult = await validateSchedule({
            nurseId,
            date: dateStr,
            shiftType
          })

          if (validateResult && !validateResult.valid) {
          uni.showModal({
              title: '排班验证失败',
            content: validateResult.errors.join('\n'),
            showCancel: false
          })
          return
        }
        } catch (error) {
          console.error('验证排班失败:', error)
          // 验证失败不影响继续创建排班
        }
      }

      // 直接创建排班，不再删除已有排班
      try {
        const result = await createSchedule({
          nurseId,
          departmentId: this.departmentId,
          date: dateStr,
          shiftType,
          shiftName: shift.name,
          timePeriod: this.timePeriod // 添加上下午信息
        })

        if (result) {
          // 添加到本地列表
          this.schedules.push({
            id: result.id || result._id,
            nurseId,
            nurseName: this.nurses.find(n => n.id === nurseId)?.name || '',
            date: dateStr,
            shiftType,
            shiftName: shift.name,
            shiftValue: shift.value,
            timePeriod: this.timePeriod, // 保存上下午信息
            hours: result.hours !== undefined && result.hours !== null ? result.hours : undefined
          })
          
          // 检查该护士是否是带班老师，如果是，自动为实习护士和进修护士排班
          await this.autoScheduleForStudents(nurseId, dateStr, shiftType, shift.name, shift.value)
          
          // 不再自动更新存休，需要点击保存按钮统一更新
          
          uni.showToast({
            title: '排班成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('创建排班失败:', error)
        // 检查是否是"已有排班"的错误，如果是，说明后端不支持同一天多个排班
        // 这种情况下，我们需要提示用户，或者尝试其他方式
        const errorMessage = error.message || ''
        if (errorMessage.includes('已有排班') || errorMessage.includes('已存在')) {
          // 如果后端不支持同一天多个排班，提示用户
          uni.showModal({
            title: '提示',
            content: '后端服务可能不支持同一天多个排班。请检查后端API是否已更新以支持此功能。',
            showCancel: false
          })
        } else {
          uni.showToast({
            title: errorMessage || '创建排班失败',
            icon: 'none'
          })
        }
      }
    },
    hasSchedule(nurseId, dateStr) {
      return this.schedules.some(s => s.nurseId === nurseId && s.date === dateStr)
    },
    getSchedulesForCell(nurseId, dateStr) {
      return this.schedules.filter(s => s.nurseId === nurseId && s.date === dateStr)
    },
    getScheduleForCell(nurseId, dateStr) {
      // 保留此方法以兼容旧代码，返回第一个排班
      const schedules = this.getSchedulesForCell(nurseId, dateStr)
      return schedules.length > 0 ? schedules[0] : null
    },
    getScheduleDisplayText(schedule) {
      if (!schedule) {
        return ''
      }
      let text = ''
      if (schedule.shiftValue === 'half_compensatory' || schedule.shiftName === '调休0.5') {
        text = '调休'
      } else {
        text = schedule.shiftName || schedule.shiftType || ''
      }
      // 添加时间段标识（整班不显示前缀）
      if (schedule.timePeriod) {
        if (schedule.timePeriod === 'morning') {
          text = `上午${text}`
        } else if (schedule.timePeriod === 'afternoon') {
          text = `下午${text}`
        }
        // 'full' (整班) 不添加前缀
      }
      return text
    },
    getScheduleText(nurseId, dateStr) {
      // 保留此方法以兼容旧代码，返回第一个排班的文本
      const schedule = this.getScheduleForCell(nurseId, dateStr)
      return this.getScheduleDisplayText(schedule)
    },
    getNurseName(nurseId) {
      const nurse = this.nurses.find(n => n.id === nurseId)
      return nurse ? nurse.name : '未知'
    },
    // 根据班次类型获取默认工时
    getDefaultHoursForShiftValue(shiftValue) {
      if (!shiftValue) {
        return 8
      }
      
      // 零工时班次
      if (ZERO_HOUR_SHIFT_VALUES.has(shiftValue)) {
        return 0
      }
      
      // 包含"*1.5"的班默认12小时（如"夜*1.5"、"责*1.5"等）
      const shiftStr = String(shiftValue)
      if (shiftStr.includes('1.5') || shiftStr.includes('*1.5') || 
          shiftValue === 'night_1_5' || shiftValue === 'duty_1_5' || 
          shiftValue === 'night_leader' || shiftValue === 'night_nurse') {
        return 12
      }
      
      // 包含"*1.25"的班默认9小时（如"治疗1.25"等）
      if (shiftStr.includes('1.25') || shiftStr.includes('*1.25') || 
          shiftValue === 'treatment_1_25') {
        return 9
      }
      
      // 其余默认8小时
      return 8
    },
    // 处理排班点击（设置工时）
    handleScheduleClick(nurseId, dateStr, schedule = null) {
      // 如果传入了schedule对象，直接使用；否则查找第一个排班
      if (!schedule) {
        schedule = this.getScheduleForCell(nurseId, dateStr)
      }
      if (!schedule) {
        return
      }
      
      // 设置当前编辑的排班
      this.editingSchedule = schedule
      
      // 设置时间段
      this.timePeriod = schedule.timePeriod || 'full'
      
      // 判断是否是备日班或备夜班
      const shiftValue = schedule.shiftValue || this.getScheduleShiftValue(schedule)
      const isBackup = shiftValue === 'backup_day' || shiftValue === 'backup_night'
      
      if (isBackup) {
        // 备班：根据工时判断是否启用
        // 如果工时存在且大于0，则已启用，否则未启用
        if (schedule.hours !== undefined && schedule.hours !== null && schedule.hours > 0) {
          this.isBackupEnabled = true
          this.editingHours = schedule.hours
        } else {
          this.isBackupEnabled = false
          this.editingHours = 0
        }
      } else {
        // 非备班：正常处理
        this.isBackupEnabled = false
        
        // 获取默认工时：优先使用手动设置的工时，否则使用默认工时
        if (schedule.hours !== undefined && schedule.hours !== null) {
          this.editingHours = schedule.hours
        } else {
          // 根据班次类型和名称设置默认工时
          const shiftName = schedule.shiftName || ''
          
          // 优先根据班次名称判断（如"夜*1.5"、"责*1.5"、"治疗1.25"等）
          if (shiftName.includes('*1.5') || shiftName.includes('1.5')) {
            this.editingHours = 12
          } else if (shiftName.includes('*1.25') || shiftName.includes('1.25')) {
            this.editingHours = 9
          } else {
            // 否则根据shiftValue判断
            this.editingHours = this.getDefaultHoursForShiftValue(shiftValue)
          }
        }
      }
      
      // 打开工时设置弹窗
      this.showHoursModal = true
    },
    // 切换备班启用状态
    toggleBackupEnabled() {
      this.isBackupEnabled = !this.isBackupEnabled
      if (this.isBackupEnabled) {
        // 启用时，如果当前工时为0，设置为默认8小时
        if (this.editingHours === 0 || this.editingHours === undefined || this.editingHours === null) {
          this.editingHours = 8
        }
      } else {
        // 未启用时，工时为0
        this.editingHours = 0
      }
    },
    // 关闭工时设置弹窗
    hideHoursModal() {
      this.showHoursModal = false
      this.editingSchedule = null
      this.editingHours = 8
      this.isBackupEnabled = false
      this.timePeriod = 'full'
    },
    // 保存工时
    async saveHours() {
      if (!this.editingSchedule) {
        return
      }
      
      // 判断是否是备日班或备夜班
      const shiftValue = this.editingSchedule.shiftValue || this.getScheduleShiftValue(this.editingSchedule)
      const isBackup = shiftValue === 'backup_day' || shiftValue === 'backup_night'
      
      // 如果是备班且未启用，工时为0
      let finalHours = 0
      if (isBackup) {
        if (this.isBackupEnabled) {
          // 启用时，使用设置的工时，默认8小时
          if (this.editingHours === undefined || this.editingHours === null || this.editingHours < 0) {
            finalHours = 8 // 默认8小时
          } else {
            finalHours = this.editingHours
          }
        } else {
          // 未启用，工时为0
          finalHours = 0
        }
      } else {
        // 非备班，正常验证
        if (this.editingHours === undefined || this.editingHours === null || this.editingHours < 0) {
          uni.showToast({
            title: '请输入有效的工时',
            icon: 'none'
          })
          return
        }
        finalHours = this.editingHours
      }
      
      try {
        // 更新排班工时和上下午
        await updateSchedule(this.editingSchedule.id, {
          hours: finalHours,
          timePeriod: this.timePeriod
        })
        
        // 更新本地排班数据
        const scheduleIndex = this.schedules.findIndex(s => s.id === this.editingSchedule.id)
        if (scheduleIndex !== -1) {
          this.schedules[scheduleIndex].hours = finalHours
          this.schedules[scheduleIndex].timePeriod = this.timePeriod
        }
        
        // 不再自动更新存休，需要点击保存按钮统一更新
        
        uni.showToast({
          title: '设置成功',
          icon: 'success'
        })
        
        this.hideHoursModal()
      } catch (error) {
        console.error('保存设置失败:', error)
        uni.showToast({
          title: error.message || '保存设置失败',
          icon: 'none'
        })
      }
    },
    // 保存存休：根据当周工时计算并更新所有有排班人员的存休
    // 以40小时为基准，超过或不足的工时除以8加入存休（保留正负）
    // 优化：只更新排班有变化的人，避免重复扣减
    async saveStoredLeave() {
      const BASE_HOURS = 40 // 基准工时40小时
      const HOURS_PER_DAY = 8 // 每天8小时
      
      uni.showLoading({
        title: '正在保存存休...',
        mask: true
      })
      
      try {
        // 获取所有护士的当周工时
        const weeklyHours = this.weeklyHoursMap
        const weekDateSet = new Set(this.weekDays.map(day => day.dateStr))
        
        // 为每个有排班的护士计算存休
        const updatePromises = []
        let updateCount = 0
        
        for (const nurseId in weeklyHours) {
          const weeklyHoursValue = weeklyHours[nurseId] || 0
          
          // 检查该护士本周是否有排班记录
          const hasScheduleThisWeek = this.schedules.some(schedule => 
            schedule.nurseId === nurseId && weekDateSet.has(schedule.date)
          )
          
          // 只对有排班的护士计算存休
          if (!hasScheduleThisWeek || weeklyHoursValue === 0) {
            continue
          }
          
          // 计算与基准的差值
          const hoursDiff = weeklyHoursValue - BASE_HOURS
          
          // 计算存休天数（保留正负）：(当周工时 - 40) / 8
          // 例如：48小时 -> (48-40)/8 = 1天（正数，表示存休增加）
          //      32小时 -> (32-40)/8 = -1天（负数，表示存休减少）
          const storedLeaveDays = hoursDiff / HOURS_PER_DAY
          
          // 获取护士当前信息
          const nurse = this.nurses.find(n => n.id === nurseId)
          if (!nurse) {
            continue
          }
          
          // 获取当前存休（如果不存在则默认为0）
          const currentStoredLeave = nurse.storedLeave !== undefined && nurse.storedLeave !== null 
            ? nurse.storedLeave 
            : 0
          
          // 检查本周是否已经计算过存休
          const previousCalculatedDays = this.weeklyStoredLeaveCalculated[nurseId] || 0
          
          // 计算新的存休：原存休 - 之前计算的存休变化 + 新的存休变化
          // 这样可以避免重复累加
          const newStoredLeave = currentStoredLeave - previousCalculatedDays + storedLeaveDays
          
          // 只有当存休发生变化时才更新（避免浮点数精度问题）
          if (Math.abs(newStoredLeave - currentStoredLeave) > 0.001 || Math.abs(storedLeaveDays - previousCalculatedDays) > 0.001) {
            updateCount++
            updatePromises.push(
              updateNurse(nurseId, {
                storedLeave: newStoredLeave
              }).then(() => {
                // 更新本地护士数据
                if (nurse) {
                  nurse.storedLeave = newStoredLeave
                }
                // 记录本次计算的存休变化
                this.weeklyStoredLeaveCalculated[nurseId] = storedLeaveDays
                
                const changeText = storedLeaveDays > 0 ? `+${storedLeaveDays.toFixed(2)}` : storedLeaveDays.toFixed(2)
                console.log(`✅ 已更新护士 ${nurse.name} 的存休: ${currentStoredLeave.toFixed(2)} -> ${newStoredLeave.toFixed(2)} (本周工时: ${weeklyHoursValue}h, 变化: ${changeText}天)`)
              }).catch(error => {
                console.error(`❌ 更新护士 ${nurse.name} 存休失败:`, error)
              })
            )
          }
        }
        
        // 等待所有更新完成
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises)
          uni.hideLoading()
          uni.showToast({
            title: `已更新 ${updateCount} 名护士的存休`,
            icon: 'success',
            duration: 2000
          })
          console.log(`✅ 已更新 ${updateCount} 名护士的存休`)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: '没有需要更新的存休',
            icon: 'none',
            duration: 2000
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('保存存休失败:', error)
        uni.showToast({
          title: error.message || '保存存休失败',
          icon: 'none',
          duration: 3000
        })
      }
    },
    // 处理排班双击（删除单个排班）
    handleScheduleDoubleClick(schedule) {
      // 双击删除单个排班
      // 使用定时器检测双击
      if (!this.doubleClickTimer) {
        this.doubleClickTimer = setTimeout(() => {
          // 单击：如果有选中班次，添加新排班
          if (this.selectedShift) {
            this.applyShiftToCell(this.selectedShift, schedule.nurseId, schedule.date)
          }
          this.doubleClickTimer = null
        }, 300) // 300ms内再次点击视为双击
      } else {
        // 双击：删除这个排班
        clearTimeout(this.doubleClickTimer)
        this.doubleClickTimer = null
        this.removeSingleSchedule(schedule)
      }
    },
    // 删除单个排班
    async removeSingleSchedule(schedule) {
      if (!schedule || !schedule.id) {
        return
      }

      const nurse = this.nurses.find(n => n.id === schedule.nurseId)
      const nurseName = nurse?.name || '未知'

      // 检查该护士是否是带班老师
      const isMentor = this.nurses.some(n => 
        n.mentor === schedule.nurseId && 
        (n.level === '实习护士' || n.level === '进修护士')
      )

      // 构建确认消息
      let confirmMessage = `确定要删除 ${nurseName} 在 ${schedule.date} 的"${this.getScheduleDisplayText(schedule)}"排班吗？`
      if (isMentor) {
        const students = this.nurses.filter(n => 
          n.mentor === schedule.nurseId && 
          (n.level === '实习护士' || n.level === '进修护士')
        )
        confirmMessage += `\n\n注意：此操作将同时删除 ${students.length} 名实习/进修护士的相同排班。`
      }

      uni.showModal({
        title: '确认删除',
        content: confirmMessage,
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteSchedule(schedule.id)
              this.schedules = this.schedules.filter(s => s.id !== schedule.id)
              
              // 如果是带班老师，同时删除学生的排班
              if (isMentor) {
                await this.removeStudentSchedules(schedule.nurseId, schedule.date)
              }
              
              // 不再自动更新存休，需要点击保存按钮统一更新
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (error) {
              console.error('删除排班失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    async removeScheduleForCell(nurseId, dateStr) {
      const schedule = this.getScheduleForCell(nurseId, dateStr)
      if (!schedule) {
        return
      }

      const nurse = this.nurses.find(n => n.id === nurseId)
      const nurseName = nurse?.name || '未知'

      // 检查该护士是否是带班老师
      const isMentor = this.nurses.some(n => 
        n.mentor === nurseId && 
        (n.level === '实习护士' || n.level === '进修护士')
      )

      // 构建确认消息
      let confirmMessage = `确定要删除 ${nurseName} 在 ${dateStr} 的排班吗？`
      if (isMentor) {
        const students = this.nurses.filter(n => 
          n.mentor === nurseId && 
          (n.level === '实习护士' || n.level === '进修护士')
        )
        confirmMessage += `\n\n注意：此操作将同时删除 ${students.length} 名实习/进修护士的相同排班。`
      }

      uni.showModal({
        title: '确认删除',
        content: confirmMessage,
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteSchedule(schedule.id)
              this.schedules = this.schedules.filter(s => s.id !== schedule.id)
              
              // 如果是带班老师，同时删除学生的排班
              if (isMentor) {
                await this.removeStudentSchedules(nurseId, dateStr)
              }
              
              // 不再自动更新存休，需要点击保存按钮统一更新
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (error) {
              console.error('删除排班失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    // 删除学生的排班（当带班老师的排班被删除时）
    async removeStudentSchedules(mentorNurseId, dateStr) {
      try {
        // 查找所有 mentor 字段等于该护士工号的实习护士和进修护士
        const students = this.nurses.filter(nurse => 
          nurse.mentor === mentorNurseId && 
          (nurse.level === '实习护士' || nurse.level === '进修护士')
        )

        if (students.length === 0) {
          return
        }

        console.log(`🗑️ 发现 ${students.length} 名实习/进修护士需要删除排班`)

        // 删除每个学生的排班
        const deletePromises = students.map(async (student) => {
          const studentSchedule = this.getScheduleForCell(student.id, dateStr)
          if (studentSchedule) {
            try {
              await deleteSchedule(studentSchedule.id)
              // 从本地列表中移除
              this.schedules = this.schedules.filter(s => s.id !== studentSchedule.id)
              console.log(`✅ 已删除学生 ${student.name} 的排班`)
              return { success: true, studentName: student.name }
            } catch (error) {
              console.error(`删除学生 ${student.name} 的排班失败:`, error)
              return { success: false, studentName: student.name, error: error.message }
            }
          }
          return { success: true, studentName: student.name }
        })

        // 等待所有删除完成
        const results = await Promise.all(deletePromises)
        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length

        if (failCount > 0) {
          const failNames = results.filter(r => !r.success).map(r => r.studentName).join('、')
          console.warn(`⚠️ ${failCount} 名学生的排班删除失败: ${failNames}`)
        }

        if (successCount > 0) {
          console.log(`✅ 已删除 ${successCount} 名学生的排班`)
        }
      } catch (error) {
        console.error('删除学生排班功能出错:', error)
        // 静默处理错误，不影响主流程
      }
    },
    // 自动为实习护士和进修护士排班（当带班老师被排班时）
    async autoScheduleForStudents(mentorNurseId, dateStr, shiftType, shiftName, originalShiftValue) {
      try {
        // 查找所有 mentor 字段等于该护士工号的实习护士和进修护士
        const students = this.nurses.filter(nurse => 
          nurse.mentor === mentorNurseId && 
          (nurse.level === '实习护士' || nurse.level === '进修护士')
        )

        if (students.length === 0) {
          // 没有学生，直接返回
          return
        }

        console.log(`📚 发现 ${students.length} 名实习/进修护士需要自动排班`)

        // 为每个学生创建排班
        const schedulePromises = students.map(async (student) => {
          // 检查是否已有排班，如果有排班则跳过，不覆盖
          const existingSchedule = this.getScheduleForCell(student.id, dateStr)
          if (existingSchedule) {
            console.log(`⏭️ 学生 ${student.name} 在 ${dateStr} 已有排班（${existingSchedule.shiftName}），跳过自动排班`)
            return { 
              success: true, 
              studentName: student.name, 
              skipped: true,
              reason: '已有排班'
            }
          }

          // 创建新排班
          try {
            const result = await createSchedule({
              nurseId: student.id,
              departmentId: this.departmentId,
              date: dateStr,
              shiftType,
              shiftName
            })

            if (result) {
              // 添加到本地列表
              this.schedules.push({
                id: result.id || result._id,
                nurseId: student.id,
                nurseName: student.name,
                date: dateStr,
                shiftType,
                shiftName,
                shiftValue: originalShiftValue,
                timePeriod: result.timePeriod || 'full', // 学生排班默认整班
                hours: result.hours !== undefined && result.hours !== null ? result.hours : undefined
              })
              console.log(`✅ 已为学生 ${student.name} 自动排班`)
              return { success: true, studentName: student.name, skipped: false }
            }
          } catch (error) {
            console.error(`为学生 ${student.name} 创建排班失败:`, error)
            return { success: false, studentName: student.name, error: error.message }
          }
        })

        // 等待所有排班创建完成
        const results = await Promise.all(schedulePromises)
        const successCount = results.filter(r => r.success && !r.skipped).length
        const skippedCount = results.filter(r => r.skipped).length
        const failCount = results.filter(r => !r.success).length

        if (failCount > 0) {
          const failNames = results.filter(r => !r.success).map(r => r.studentName).join('、')
          console.warn(`⚠️ ${failCount} 名学生的自动排班失败: ${failNames}`)
          // 不显示错误提示，避免干扰用户操作
        }

        if (skippedCount > 0) {
          console.log(`⏭️ ${skippedCount} 名学生已有排班，已跳过`)
        }

        if (successCount > 0) {
          console.log(`✅ 已为 ${successCount} 名学生自动排班`)
        }
      } catch (error) {
        console.error('自动排班功能出错:', error)
        // 静默处理错误，不影响主流程
      }
    },
    // 导出Excel
    async exportToExcel() {
      try {
        uni.showLoading({
          title: '正在导出...'
        })

        // #ifdef H5
        // H5环境使用exceljs库导出
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('排班表')
        
        const totalCols = 5 + this.weekDays.length + 3 // 固定列 + 日期列 + 工时列 + 备注列 + 当周存休列
        
        // 设置列宽
        worksheet.columns = [
          { width: 12 }, // 工号
          { width: 10 }, // 姓名
          { width: 8 },  // 年届
          { width: 8 },  // 年休
          { width: 8 },  // 存休
          ...this.weekDays.map(() => ({ width: 15 })), // 日期列
          { width: 12 }, // 当周工时
          { width: 20 }, // 备注
          { width: 12 }  // 当周存休
        ]
        
        // 第1行：主标题（合并所有列）
        const titleRow = worksheet.addRow([])
        titleRow.getCell(1).value = '浙江大学医学院附属第二医院 重症医学科1病区 周排班表'
        titleRow.getCell(1).font = { bold: true, size: 16 }
        titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
        // 为整个合并区域设置边框
        titleRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
        worksheet.mergeCells(1, 1, 1, totalCols)
        
        // 第2行：日期范围（合并所有列，右对齐）
        const dateRow = worksheet.addRow([])
        const dateCell = dateRow.getCell(totalCols)
        dateCell.value = `时间:${this.weekStart} -- ${this.weekEnd}`
        dateCell.alignment = { horizontal: 'right', vertical: 'middle' }
        dateCell.font = { size: 11 }
        // 为整个合并区域设置边框
        dateRow.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
        worksheet.mergeCells(2, 1, 2, totalCols)
        
        // 第3行：表头第一行
        const headerRow1 = worksheet.addRow([
          '工号',
          '姓名',
          '年届',
          '年休',
          '存休',
          ...this.weekDays.map(day => day.date),
          '当周工时',
          '备注',
          '当周存休'
        ])
        
        // 设置第3行样式
        headerRow1.eachCell((cell, colNumber) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.font = { bold: true, size: 11 }
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
        
        // 第4行：表头第二行（只显示星期）
        const headerRow2 = worksheet.addRow([
          '', // 工号（合并）
          '', // 姓名（合并）
          '', // 年届（合并）
          '', // 年休（合并）
          '', // 存休（合并）
          ...this.weekDays.map(day => day.weekday),
          '',  // 当周工时（合并）
          '',  // 备注（合并）
          ''   // 当周存休（合并）
        ])
        
        // 设置第4行样式
        headerRow2.eachCell((cell, colNumber) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.font = { size: 11 }
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
        
        // 合并左侧固定列（工号、姓名、年届、年休、存休）
        for (let col = 1; col <= 5; col++) {
          worksheet.mergeCells(3, col, 4, col)
        }
        
        // 合并右侧列（当周工时、备注、当周存休）
        const hoursColumnIndex = 5 + this.weekDays.length + 1
        const remarksColumnIndex = hoursColumnIndex + 1
        const storedLeaveColumnIndex = remarksColumnIndex + 1
        worksheet.mergeCells(3, hoursColumnIndex, 4, hoursColumnIndex)
        worksheet.mergeCells(3, remarksColumnIndex, 4, remarksColumnIndex)
        worksheet.mergeCells(3, storedLeaveColumnIndex, 4, storedLeaveColumnIndex)
        
        // 添加数据行
        this.sortedNurses.forEach(nurse => {
          const row = worksheet.addRow([
            nurse.id || '',
            nurse.name || '',
            nurse.graduationYear || '-',
            nurse.annualLeave !== undefined && nurse.annualLeave !== null ? nurse.annualLeave : 0,
            nurse.storedLeave !== undefined && nurse.storedLeave !== null ? nurse.storedLeave : 0,
            ...this.weekDays.map(day => {
              const schedules = this.getSchedulesForCell(nurse.id, day.dateStr)
              if (schedules.length === 0) {
                return ''
              }
              // 多个排班用换行符分隔
              return schedules.map(s => this.getScheduleDisplayText(s)).join('\n')
            }),
            `${this.weeklyHoursMap[nurse.id] || 0}h`,
            this.remarks[nurse.id] || '',
            this.formatWeeklyStoredLeave(nurse.id)
          ])
          
          // 设置数据行样式：居中 + 边框 + 自动换行
          row.eachCell((cell, colNumber) => {
            // 日期列（第6列开始）需要自动换行以显示多个排班
            const isDateColumn = colNumber >= 6 && colNumber <= 5 + this.weekDays.length
            cell.alignment = { 
              horizontal: 'center', 
              vertical: 'middle',
              wrapText: isDateColumn // 日期列自动换行
            }
            cell.font = { size: 11 }
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          })
        })
        
        // 导出文件
        const fileName = `排班表_${this.weekStart}_${this.weekEnd}.xlsx`
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        link.click()
        window.URL.revokeObjectURL(url)

        uni.hideLoading()
        uni.showToast({
          title: '导出成功',
          icon: 'success'
        })
        // #endif

        // #ifndef H5
        // 非H5环境提示用户
        uni.hideLoading()
        uni.showModal({
          title: '导出提示',
          content: 'Excel导出功能仅在H5环境下可用，请在浏览器中打开',
          showCancel: false
        })
        // #endif
      } catch (error) {
        console.error('导出Excel失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '导出失败',
            icon: 'none'
          })
        }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 20rpx;
}

.schedule-header {
  background-color: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.header-info {
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
}

.header-subtitle {
  font-size: 28rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.header-dept {
  font-size: 24rpx;
  color: #999999;
  display: block;
  margin-bottom: 4rpx;
}

.header-date {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.week-nav {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #667eea;
  color: #ffffff;
  border-radius: 8rpx;
  cursor: pointer;
}

.nav-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background-color: #667eea;
  color: #ffffff;
  border-radius: 8rpx;
  cursor: pointer;
  margin-left: 20rpx;
  transition: all 0.2s;
}

.save-btn:active {
  background-color: #5568d3;
  transform: scale(0.95);
}

.save-icon {
  font-size: 24rpx;
}

.save-text {
  font-size: 24rpx;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background-color: #4caf50;
  color: #ffffff;
  border-radius: 8rpx;
  cursor: pointer;
  margin-left: 20rpx;
  transition: all 0.2s;
}

.export-btn:active {
  background-color: #45a049;
  transform: scale(0.95);
}

.export-icon {
  font-size: 24rpx;
}

.export-text {
  font-size: 24rpx;
}

.shift-panel {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.panel-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.shift-types {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.shift-type-tag {
  padding: 12rpx 24rpx;
  background-color: #667eea;
  color: #ffffff;
  border-radius: 8rpx;
  font-size: 24rpx;
  cursor: pointer;
  transition: all 0.2s;
}

.shift-type-tag.selected {
  background-color: #4caf50;
  box-shadow: 0 0 0 2rpx rgba(76, 175, 80, 0.3);
}

.shift-tag-text {
  font-size: 24rpx;
}

.schedule-table-wrapper {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.table-scroll {
  width: 100%;
  max-height: 80vh;
}

.schedule-table {
  min-width: 100%;
  border-collapse: collapse;
}

.table-header {
  display: flex;
  background-color: #667eea;
  color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
}

.header-cell {
  padding: 16rpx;
  font-size: 24rpx;
  font-weight: bold;
  text-align: center;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
  box-sizing: border-box;
}

.header-cell.fixed-col {
  width: 200rpx;
  min-width: 200rpx;
  max-width: 200rpx;
  background-color: #5568d3;
}

.header-cell.date-col {
  width: 200rpx;
  min-width: 200rpx;
  max-width: 200rpx;
}

.header-cell.remarks-col {
  width: 180rpx;
  min-width: 180rpx;
  max-width: 180rpx;
}
.header-cell.hours-col {
  width: 160rpx;
  min-width: 160rpx;
  max-width: 160rpx;
}
.header-cell.weekly-stored-leave-col {
  width: 160rpx;
  min-width: 160rpx;
  max-width: 160rpx;
}

.date-text {
  display: block;
  font-size: 24rpx;
  margin-bottom: 4rpx;
}

.weekday-text {
  display: block;
  font-size: 20rpx;
  opacity: 0.9;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #e0e0e0;
  box-sizing: border-box;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.cell {
  padding: 16rpx;
  font-size: 24rpx;
  text-align: center;
  border-right: 1rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-sizing: border-box;
}

.cell.fixed-col {
  width: 200rpx;
  min-width: 200rpx;
  max-width: 200rpx;
  background-color: #f9f9f9;
  font-weight: 500;
}

.cell.date-col {
  width: 200rpx;
  min-width: 200rpx;
  max-width: 200rpx;
  min-height: 80rpx;
}

.cell.remarks-col {
  width: 180rpx;
  min-width: 180rpx;
  max-width: 180rpx;
}
.cell.hours-col {
  width: 160rpx;
  min-width: 160rpx;
  max-width: 160rpx;
}
.cell.weekly-stored-leave-col {
  width: 160rpx;
  min-width: 160rpx;
  max-width: 160rpx;
}
.hours-text {
  font-size: 22rpx;
  font-weight: 500;
  color: #333333;
}
.stored-leave-text {
  font-size: 22rpx;
  font-weight: 500;
  color: #667eea;
}

.schedule-cell {
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.schedule-cell.cell-has-schedule {
  background-color: #f0f0f0;
}

.schedule-content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  padding: 4rpx;
}

.schedule-content {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rpx 8rpx;
  background-color: #667eea;
  color: #ffffff;
  border-radius: 4rpx;
  cursor: pointer;
}

.schedule-text {
  font-size: 20rpx;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}

.schedule-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 20rpx;
  color: #cccccc;
}

.remarks-input {
  width: 100%;
  padding: 8rpx;
  font-size: 22rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 4rpx;
  text-align: center;
}

/* 工时设置弹窗样式 */
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

.hours-modal {
  background-color: #ffffff;
  border-radius: 20rpx;
  width: 90%;
  max-width: 600rpx;
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
  cursor: pointer;
}

.modal-body {
  padding: 30rpx;
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

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999999;
  cursor: not-allowed;
}

.switch-group {
  margin-top: 10rpx;
  display: flex;
  gap: 16rpx;
}

.switch-item {
  flex: 1;
  padding: 16rpx 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  background-color: #ffffff;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.switch-item.active {
  border-color: #667eea;
  background-color: #f0f4ff;
}

.switch-text {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

.switch-item.active .switch-text {
  color: #667eea;
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
  cursor: pointer;
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
</style>