/**
 * 排班管理接口
 */
import { get, post, put, del } from '../utils/api'

/**
 * 获取排班列表
 * @param {Object} params 查询参数
 * @param {String} params.departmentId 科室ID
 * @param {String} params.nurseId 护士工号
 * @param {String} params.startDate 开始日期 YYYY-MM-DD
 * @param {String} params.endDate 结束日期 YYYY-MM-DD
 * @param {String} params.shiftType 班次类型，多个值用逗号分隔
 */
export function getScheduleList(params = {}) {
  return get('/schedule/list', params)
}

/**
 * 创建排班
 * @param {Object} data 排班信息
 * @param {String} data.nurseId 护士工号
 * @param {String} data.departmentId 科室ID
 * @param {String} data.date 排班日期 YYYY-MM-DD
 * @param {String} data.shiftType 班次类型
 * @param {String} data.shiftName 班次名称（可选）
 * @param {String} data.timeRange 时间段（可选）：'整班'、'上午'、'下午'
 * @param {Number} data.hours 工时（可选，小时数）
 */
export function createSchedule(data) {
  return post('/schedule/add', data)
}

/**
 * 批量创建排班
 * @param {Object} data 批量排班信息
 * @param {String} data.departmentId 科室ID
 * @param {Array} data.schedules 排班数组
 */
export function batchCreateSchedule(data) {
  return post('/schedule/batch', data)
}

/**
 * 更新排班
 * @param {String} scheduleId 排班ID
 * @param {Object} data 要更新的字段
 * @param {String} [data.nurseId] 护士工号
 * @param {String} [data.date] 排班日期 YYYY-MM-DD
 * @param {String} [data.shiftType] 班次类型
 * @param {String} [data.shiftName] 班次名称
 * @param {String} [data.timeRange] 时间段：'整班'、'上午'、'下午'
 * @param {Number} [data.hours] 工时（小时数）
 */
export function updateSchedule(scheduleId, data) {
  return put(`/schedule/${scheduleId}`, data)
}

/**
 * 删除排班
 * @param {String} scheduleId 排班ID
 */
export function deleteSchedule(scheduleId) {
  return del(`/schedule/${scheduleId}`)
}

/**
 * 验证排班规则
 * @param {Object} data 验证数据
 * @param {String} data.nurseId 护士工号
 * @param {String} data.date 日期 YYYY-MM-DD
 * @param {String} data.shiftType 班次类型
 */
export function validateSchedule(data) {
  return post('/schedule/validate', data)
}

/**
 * 获取指定日期班次人员统计
 * @param {Object} params 查询参数
 * @param {String} params.date 日期 YYYY-MM-DD
 * @param {String} params.departmentId 科室ID
 */
export function getDateStats(params) {
  return get('/schedule/date-stats', params)
}

/**
 * 获取日历视图排班数据（按日期分组）
 * @param {Object} params 查询参数
 * @param {String} params.departmentId 科室ID
 * @param {String} params.startDate 开始日期 YYYY-MM-DD
 * @param {String} params.endDate 结束日期 YYYY-MM-DD
 */
export function getScheduleCalendar(params) {
  return get('/schedule/calendar', params)
}

/**
 * 获取护士排班日历
 * @param {String} nurseId 护士工号
 * @param {Object} params 查询参数
 * @param {String} params.startDate 开始日期 YYYY-MM-DD
 * @param {String} params.endDate 结束日期 YYYY-MM-DD
 */
export function getNurseScheduleCalendar(nurseId, params) {
  return get(`/schedule/nurse-calendar/${nurseId}`, params)
}

/**
 * 批量更新排班
 * @param {Object} data 批量更新数据
 * @param {Array} data.updates 更新数据数组
 * @param {String} data.updates[].scheduleId 排班ID (MongoDB ObjectId)
 * @param {String} data.updates[].nurseId 护士工号（可选）
 * @param {String} data.updates[].date 排班日期（可选）
 * @param {String} data.updates[].shiftType 班次类型（可选）
 * @param {String} data.updates[].shiftName 班次名称（可选）
 */
export function batchUpdateSchedule(data) {
  return put('/schedule/batch', data)
}

/**
 * 批量删除排班
 * @param {Object} data 删除参数
 * @param {Array<String>} data.scheduleIds 排班ID数组 (MongoDB ObjectId)
 */
export function batchDeleteSchedule(data) {
  return del('/schedule/batch', data)
}

/**
 * 自动排班生成
 * @param {Object} data 自动排班参数
 * @param {String} data.departmentId 科室ID
 * @param {String} data.startDate 开始日期 YYYY-MM-DD
 * @param {String} data.endDate 结束日期 YYYY-MM-DD
 * @param {Object} data.rules 排班规则
 * @param {Number} data.rules.teamLeaderCount 组长总数
 * @param {Number} data.rules.teamLeaderCycle 组长夜班周期（天）
 * @param {Number} data.rules.teamLeaderRest 组长每轮轮空人数
 * @param {Number} data.rules.n2n3NightCycle N2、N3夜班周期（天）
 * @param {Number} data.rules.n1n0NightCycle N1、N0夜班周期（天）
 */
export function autoGenerateSchedule(data) {
  return post('/schedule/auto-generate', data)
}

export default {
  getScheduleList,
  createSchedule,
  batchCreateSchedule,
  updateSchedule,
  deleteSchedule,
  validateSchedule,
  getDateStats,
  getScheduleCalendar,
  getNurseScheduleCalendar,
  batchUpdateSchedule,
  batchDeleteSchedule,
  autoGenerateSchedule
}

