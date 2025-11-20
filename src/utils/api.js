/**
 * API请求封装工具
 * 统一处理请求拦截、响应拦截和错误处理
 */

// 判断当前运行环境
// 在H5开发环境中使用代理路径，避免CORS问题
let BASE_URL = 'https://eflfbpmxcpqg.sealoshzh.site/api'

// 检测是否在H5开发环境中运行
try {
  // 检查是否在浏览器环境且是开发模式
  const isH5Dev = typeof window !== 'undefined' && 
                   (import.meta.env?.DEV === true || 
                    process.env.NODE_ENV === 'development' ||
                    window.location?.hostname === 'localhost' ||
                    window.location?.hostname === '127.0.0.1')
  
  if (isH5Dev) {
    // 在H5开发环境中使用代理路径，避免CORS问题
    BASE_URL = '/api'
  }
} catch (e) {
  // 如果判断失败，使用默认的完整URL
  console.warn('无法判断运行环境，使用完整URL:', e)
}

/**
 * 统一请求方法
 * @param {Object} options 请求配置
 * @returns {Promise} 返回Promise对象
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const fullUrl = BASE_URL + options.url
    // 开发环境下输出请求信息
    if (typeof window !== 'undefined' && (import.meta.env?.DEV || process.env.NODE_ENV === 'development')) {
      console.log('🌐 API请求:', options.method || 'GET', fullUrl, options.data || {})
    }
    
    // 显示加载提示
    if (options.showLoading !== false) {
      uni.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      })
    }

    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': options.contentType || 'application/json',
        ...options.header
      },
      success: (res) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          uni.hideLoading()
        }
        
        // 开发环境下输出响应信息
        if (typeof window !== 'undefined' && (import.meta.env?.DEV || process.env.NODE_ENV === 'development')) {
          console.log('✅ API响应:', res.statusCode, fullUrl, res.data ? (typeof res.data === 'string' ? res.data.substring(0, 100) : res.data) : '无数据')
        }

        // 处理HTTP状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 处理业务状态码
          // 先检查响应数据是否为有效的JSON格式
          let responseData = res.data
          
          // 如果响应是字符串，尝试解析为JSON
          if (typeof responseData === 'string') {
            try {
              // 检查是否是有效的JSON字符串
              if (responseData.trim().startsWith('{') || responseData.trim().startsWith('[')) {
                responseData = JSON.parse(responseData)
              } else {
                // 不是JSON格式，可能是HTML错误页面或纯文本
                throw new Error('响应不是有效的JSON格式')
              }
            } catch (e) {
              // 解析失败，可能是HTML错误页面或纯文本响应
              console.warn('响应解析失败，可能是非JSON格式:', e)
              const errorMsg = `服务器响应格式错误 (${res.statusCode})`
              if (options.showError !== false) {
                uni.showToast({
                  title: errorMsg,
                  icon: 'none',
                  duration: 3000
                })
              }
              reject(new Error(errorMsg))
              return
            }
          }
          
          // 检查响应数据结构
          if (responseData && typeof responseData === 'object') {
            const { code, message, data } = responseData
            
            if (code === 200) {
              resolve(data)
            } else {
              // 业务错误
              const errorMsg = message || '请求失败'
              // 对于404错误，不显示错误提示（资源不存在是正常情况）
              const is404 = res.statusCode === 404 || code === 404
              if (options.showError !== false && !is404) {
                uni.showToast({
                  title: errorMsg,
                  icon: 'none',
                  duration: 2000
                })
              }
              reject(new Error(errorMsg))
            }
          } else {
            // 响应数据结构异常
            const errorMsg = '服务器响应数据格式异常'
            if (options.showError !== false) {
              uni.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 3000
              })
            }
            reject(new Error(errorMsg))
          }
        } else {
          // HTTP错误（4xx, 5xx等），尝试解析响应体中的错误信息
          let errorMsg = `请求失败: ${res.statusCode}`
          
          // 根据不同状态码提供更友好的错误信息
          if (res.statusCode === 503) {
            // 在开发环境中提供更详细的诊断信息
            const isDev = typeof window !== 'undefined' && 
                         (import.meta.env?.DEV === true || 
                          process.env.NODE_ENV === 'development' ||
                          window.location?.hostname === 'localhost' ||
                          window.location?.hostname === '127.0.0.1')
            if (isDev) {
              errorMsg = '后端服务不可用（503）。请检查：1) 后端服务器是否已启动 2) 代理配置是否正确 3) 网络连接是否正常'
              console.error('⚠️ 后端服务连接失败:', {
                url: fullUrl,
                target: 'https://eflfbpmxcpqg.sealoshzh.site',
                suggestion: '请确认后端服务已启动并可以访问'
              })
            } else {
              errorMsg = '服务暂时不可用，请稍后重试。如果问题持续，请联系管理员检查服务器状态。'
            }
          } else if (res.statusCode === 502) {
            errorMsg = '网关错误，请稍后重试'
          } else if (res.statusCode === 500) {
            errorMsg = '服务器内部错误，请稍后重试'
          } else if (res.statusCode === 404) {
            errorMsg = '请求的资源不存在'
          } else if (res.statusCode === 403) {
            errorMsg = '访问被拒绝'
          } else if (res.statusCode === 401) {
            errorMsg = '未授权，请登录'
          }
          
          // 如果响应体包含JSON格式的错误信息，尝试解析
          if (res.data) {
            try {
              let errorData = res.data
              // 如果是字符串，尝试解析
              if (typeof res.data === 'string') {
                // 检查是否是有效的JSON字符串
                const trimmed = res.data.trim()
                if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                  errorData = JSON.parse(res.data)
                } else {
                  // 不是JSON，可能是HTML错误页面，跳过解析
                  throw new Error('响应不是JSON格式')
                }
              }
              
              // 如果包含message字段，使用它作为错误信息
              if (errorData && typeof errorData === 'object') {
                if (errorData.message) {
                  errorMsg = errorData.message
                } else if (errorData.error) {
                  errorMsg = errorData.error
                }
              }
            } catch (e) {
              // 解析失败，使用默认错误信息（可能是HTML错误页面）
              // 不输出警告，因为对于HTML响应这是正常的
            }
          }
          
          // 对于404错误，不显示错误提示（资源不存在是正常情况）
          const is404 = res.statusCode === 404
          if (options.showError !== false && !is404) {
            uni.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 3000
            })
          }
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          uni.hideLoading()
        }

        // 网络错误或其他错误
        const errorMsg = err.errMsg || '网络错误，请检查网络连接'
        if (options.showError !== false) {
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          })
        }
        reject(new Error(errorMsg))
      }
    })
  })
}

/**
 * GET请求
 */
export function get(url, params = {}, options = {}) {
  // 过滤掉 undefined、null 和空字符串参数
  const filteredParams = Object.keys(params).reduce((acc, key) => {
    const value = params[key]
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value
    }
    return acc
  }, {})
  
  // 将params转换为query字符串
  const queryString = Object.keys(filteredParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filteredParams[key])}`)
    .join('&')
  
  const fullUrl = queryString ? `${url}?${queryString}` : url
  
  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  })
}

/**
 * POST请求
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 文件上传
 * @param {String} url 接口地址
 * @param {String} filePath 文件路径
 * @param {String} name 文件字段名，默认为'file'
 * @param {Object} formData 其他表单数据
 * @param {Object} options 其他配置
 */
export function uploadFile(url, filePath, name = 'file', formData = {}, options = {}) {
  return new Promise((resolve, reject) => {
    // 显示加载提示
    if (options.showLoading !== false) {
      uni.showLoading({
        title: options.loadingText || '上传中...',
        mask: true
      })
    }

    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name,
      formData,
      header: {
        ...options.header
      },
      success: (res) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          uni.hideLoading()
        }

        try {
          const data = JSON.parse(res.data)
          const { code, message, data: resultData } = data

          if (code === 200) {
            resolve(resultData)
          } else {
            const errorMsg = message || '上传失败'
            if (options.showError !== false) {
              uni.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 2000
              })
            }
            reject(new Error(errorMsg))
          }
        } catch (e) {
          const errorMsg = '响应数据解析失败'
          if (options.showError !== false) {
            uni.showToast({
              title: errorMsg,
              icon: 'none'
            })
          }
          reject(new Error(errorMsg))
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          uni.hideLoading()
        }

        const errorMsg = err.errMsg || '上传失败，请检查网络连接'
        if (options.showError !== false) {
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          })
        }
        reject(new Error(errorMsg))
      }
    })
  })
}

export default {
  get,
  post,
  put,
  del,
  uploadFile
}

