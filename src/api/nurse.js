/**
 * 护士管理接口
 */
import { get, post, put, del, uploadFile } from '../utils/api'

/**
 * 获取护士列表
 * @param {Object} params 查询参数
 * @param {String} params.departmentId 科室ID
 * @param {String} params.level 护士级别
 * @param {String} params.scheduleStatus 排班状态
 * @param {String} params.keyword 搜索关键词
 * @param {Number} params.page 页码
 * @param {Number} params.pageSize 每页数量
 * @param {Object} options 请求选项
 */
export function getNurseList(params = {}, options = {}) {
  return get('/nurse/list', params, options)
}

/**
 * 获取单个护士详情
 * @param {String} nurseId 护士工号
 */
export function getNurseDetail(nurseId) {
  return get(`/nurse/${nurseId}`)
}

/**
 * 添加护士
 * @param {Object} data 护士信息
 * @param {String} data.id 工号
 * @param {String} data.name 姓名
 * @param {String} data.level 护士级别
 * @param {String} data.departmentId 科室ID
 * @param {String} data.scheduleStatus 排班状态
 * @param {Boolean} data.isTeamLeader 是否责任组长
 * @param {String} data.mentor 带班老师工号
 * @param {Number|null} data.graduationYear 护士年届（4位整型年份，1000-9999）
 * @param {Number} data.annualLeave 年休（天数，浮点型），默认0
 * @param {Number} data.storedLeave 存休（天数，浮点型），默认0
 */
export function addNurse(data) {
  return post('/nurse/add', data)
}

/**
 * 更新护士信息
 * @param {String} nurseId 护士工号
 * @param {Object} data 要更新的字段
 * @param {String} [data.name] 姓名
 * @param {String} [data.level] 护士级别
 * @param {String} [data.departmentId] 科室ID
 * @param {String} [data.scheduleStatus] 排班状态
 * @param {Boolean} [data.isTeamLeader] 是否责任组长
 * @param {String} [data.mentor] 带班老师工号
 * @param {Number|null} [data.graduationYear] 护士年届（4位整型年份，1000-9999）
 * @param {Number} [data.annualLeave] 年休（天数，浮点型）
 * @param {Number} [data.storedLeave] 存休（天数，浮点型）
 */
export function updateNurse(nurseId, data) {
  return put(`/nurse/${nurseId}`, data)
}

/**
 * 删除护士
 * @param {String} nurseId 护士工号
 */
export function deleteNurse(nurseId) {
  return del(`/nurse/${nurseId}`)
}

/**
 * 批量导入护士（Excel解析）
 * @param {String|File} filePathOrFile 文件路径（小程序/App环境）或File对象（H5环境）
 * @param {String} departmentId 科室ID
 */
export function parseExcelNurse(filePathOrFile, departmentId) {
  // #ifdef H5
  // H5环境处理File对象
  if (filePathOrFile instanceof File || filePathOrFile instanceof Blob) {
    // 在H5环境下，uni.uploadFile也可以使用File对象
    // 但为了更好的兼容性和代理支持，我们使用fetch但走代理路径
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', filePathOrFile)
      formData.append('departmentId', departmentId)
      
      // 判断是否在开发环境，如果是则使用代理路径
      let uploadUrl = 'https://eflfbpmxcpqg.sealoshzh.site/api/nurse/parse-excel'
      try {
        const isH5Dev = typeof window !== 'undefined' && 
                         (import.meta.env?.DEV === true || 
                          process.env.NODE_ENV === 'development' ||
                          window.location?.hostname === 'localhost' ||
                          window.location?.hostname === '127.0.0.1')
        if (isH5Dev) {
          // 开发环境使用代理路径
          uploadUrl = '/api/nurse/parse-excel'
        }
      } catch (e) {
        // 如果判断失败，使用完整URL
        console.warn('无法判断运行环境，使用完整URL:', e)
      }
      
      console.log('📤 上传文件到:', uploadUrl)
      
      fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // 注意：不要设置Content-Type，让浏览器自动设置（包含boundary）
      })
      .then(response => {
        // 处理HTTP状态码
        if (response.status === 503) {
          throw new Error('服务暂时不可用，请稍后重试。如果问题持续，请联系管理员检查服务器状态。')
        } else if (response.status === 502) {
          throw new Error('网关错误，请稍后重试')
        } else if (response.status >= 500) {
          throw new Error(`服务器错误 (${response.status})，请稍后重试`)
        } else if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`)
        }
        
        // 尝试解析JSON响应
        return response.text().then(text => {
          try {
            return JSON.parse(text)
          } catch (e) {
            // 如果不是JSON，可能是HTML错误页面
            if (response.status >= 400) {
              throw new Error(`服务器返回了错误响应 (${response.status})`)
            }
            throw new Error('响应格式错误')
          }
        })
      })
      .then(result => {
        const { code, message, data } = result
        if (code === 200) {
          resolve(data)
        } else {
          const errorMsg = message || '上传失败'
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          })
          reject(new Error(errorMsg))
        }
      })
      .catch(error => {
        console.error('文件上传失败:', error)
        
        // 提供更友好的错误信息
        let errorMsg = error.message || '上传失败，请检查网络连接'
        
        // 如果是网络错误
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMsg = '网络连接失败，请检查网络设置'
        }
        
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 4000
        })
        reject(error)
      })
    })
  } else {
    // H5环境也可以使用文件路径（如果是从input选择器获取的）
    return uploadFile(
      '/nurse/parse-excel',
      filePathOrFile,
      'file',
      { departmentId }
    )
  }
  // #endif
  
  // #ifndef H5
  // 小程序/App环境直接使用文件路径
  return uploadFile(
    '/nurse/parse-excel',
    filePathOrFile,
    'file',
    { departmentId }
  )
  // #endif
}

/**
 * 批量删除护士
 * @param {Object} data 删除参数
 * @param {Array<String>} data.nurseIds 护士工号数组
 * @param {String} data.importDate 导入日期
 */
export async function batchDeleteNurse(data) {
  // 先尝试使用DELETE方法（符合RESTful规范）
  try {
    return await del('/nurse/batch', data)
  } catch (error) {
    // 如果DELETE失败（404或405），尝试使用POST方法
    // 某些服务器不支持DELETE请求带请求体，或者后端可能使用POST处理批量删除
    if (error.message && (
      error.message.includes('404') || 
      error.message.includes('405') || 
      error.message.includes('方法不允许') ||
      error.message.includes('Method Not Allowed')
    )) {
      console.log('⚠️ DELETE方法失败，尝试使用POST方法')
      try {
        return await post('/nurse/batch-delete', data)
      } catch (postError) {
        // 如果POST也失败，尝试另一个可能的路径
        try {
          return await post('/nurse/batch', data, {
            header: {
              'X-HTTP-Method-Override': 'DELETE'
            }
          })
        } catch (finalError) {
          // 所有尝试都失败，抛出原始错误
          throw error
        }
      }
    } else {
      // 其他错误直接抛出
      throw error
    }
  }
}

export default {
  getNurseList,
  getNurseDetail,
  addNurse,
  updateNurse,
  deleteNurse,
  parseExcelNurse,
  batchDeleteNurse
}

