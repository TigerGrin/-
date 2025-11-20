/**
 * 统计接口
 */
import { get } from '../utils/api'

/**
 * 获取科室统计信息
 * @param {Object} params 查询参数
 * @param {String} params.departmentId 科室ID，不传则统计所有科室
 */
export function getDepartmentStatistics(params = {}) {
  return get('/statistics/department', params)
}

/**
 * 获取护士排班统计
 * @param {String} nurseId 护士工号
 * @param {Object} params 查询参数
 * @param {String} params.startDate 开始日期 YYYY-MM-DD
 * @param {String} params.endDate 结束日期 YYYY-MM-DD
 */
export function getNurseStatistics(nurseId, params = {}) {
  return get(`/statistics/nurse/${nurseId}`, params)
}

export default {
  getDepartmentStatistics,
  getNurseStatistics
}

