/**
 * 科室管理接口
 */
import { get, post, put } from '../utils/api'

/**
 * 获取科室列表
 * @param {Object} params 查询参数
 * @param {String} params.keyword 搜索关键词（科室名称）
 */
export function getDepartmentList(params = {}) {
  return get('/department/list', params)
}

/**
 * 获取科室详情
 * @param {String} departmentId 科室ID
 * @param {Object} options 请求选项
 */
export function getDepartmentDetail(departmentId, options = {}) {
  return get(`/department/${departmentId}`, {}, { showError: false, ...options })
}

/**
 * 创建科室
 * @param {Object} data 科室信息
 * @param {String} data.id 科室ID
 * @param {String} data.name 科室名称
 * @param {String} data.director 科室主任
 * @param {Number} data.capacity 容量
 * @param {Object} options 请求选项
 */
export function createDepartment(data, options = {}) {
  return post('/department/add', data, { showError: false, showLoading: false, ...options })
}

/**
 * 更新科室信息
 * @param {String} departmentId 科室ID
 * @param {Object} data 要更新的字段
 * @param {String} data.name 科室名称
 * @param {String} data.director 科室主任
 * @param {Number} data.capacity 容量
 * @param {Object} options 请求选项
 */
export function updateDepartment(departmentId, data, options = {}) {
  return put(`/department/${departmentId}`, data, { showError: false, showLoading: false, ...options })
}

/**
 * 确保科室存在（如果不存在则创建）
 * 注意：如果后端没有创建接口，此函数会静默跳过，让后端在需要时自动创建
 * @param {String} departmentId 科室ID
 * @param {String} departmentName 科室名称
 */
export async function ensureDepartmentExists(departmentId, departmentName = '中心监护室') {
  try {
    // 先尝试获取科室详情
    await getDepartmentDetail(departmentId)
    // 如果成功，说明科室存在
    console.log(`✅ 科室已存在: ${departmentId} - ${departmentName}`)
    return true
  } catch (error) {
    // 科室不存在，尝试创建（如果后端有创建接口）
    // 由于后端可能没有创建接口，我们静默处理失败
    console.log(`科室不存在，尝试创建: ${departmentId}`)
    
    try {
      // 尝试使用POST创建
      await createDepartment({
        id: departmentId,
        name: departmentName
      })
      console.log(`✅ 已创建科室: ${departmentId} - ${departmentName}`)
      return true
    } catch (createError) {
      // POST创建失败，可能是接口不存在
      console.log(`⚠️ POST创建科室失败，尝试使用PUT方式`)
      
      try {
        // 尝试使用PUT更新（某些后端支持PUT创建）
        await updateDepartment(departmentId, {
          name: departmentName
        })
        console.log(`✅ 已创建/更新科室: ${departmentId} - ${departmentName}`)
        return true
      } catch (putError) {
        // 如果都失败了，说明后端可能没有创建接口
        // 静默失败，不影响后续操作，让后端在导入护士时自动创建
        console.log(`⚠️ 无法创建科室（后端可能不支持），将在导入护士时由后端自动创建。科室ID: ${departmentId}`)
        return false
      }
    }
  }
}

export default {
  getDepartmentList,
  getDepartmentDetail,
  createDepartment,
  updateDepartment,
  ensureDepartmentExists
}

