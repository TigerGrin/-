# API 连接问题排查指南

## 问题描述

本机可以正常访问后端，但客户端无法连接后端或数据库。

## 已修复的问题

### 问题 1：生产环境直接请求后端地址

**原因：**
- 生产环境代码直接使用完整后端 URL：`https://eflfbpmxcpqg.sealoshzh.site/api`
- 可能导致 CORS 跨域问题
- 客户端网络可能无法直接访问后端地址

**解决方案：**
- ✅ 已修改 `src/utils/api.js`，统一使用相对路径 `/api`
- ✅ 所有 API 请求通过 nginx 代理转发到后端
- ✅ nginx 已配置 CORS 头，解决跨域问题

### 问题 2：nginx CORS 配置不完整

**原因：**
- nginx 的 CORS 配置可能不够完善
- OPTIONS 预检请求处理不当

**解决方案：**
- ✅ 已优化 `nginx.conf`，完善 CORS 配置
- ✅ 正确处理 OPTIONS 预检请求
- ✅ 添加必要的代理头信息

## 修复后的工作流程

```
客户端浏览器
    ↓
请求 /api/xxx
    ↓
前端服务器 (nginx)
    ↓
代理转发到 https://eflfbpmxcpqg.sealoshzh.site/api/xxx
    ↓
后端服务器
    ↓
返回响应（通过 nginx 添加 CORS 头）
    ↓
客户端浏览器
```

## 部署更新步骤

### 1. 提交代码更改

```bash
git add src/utils/api.js nginx.conf
git commit -m "Fix: Use nginx proxy for API requests to avoid CORS issues"
git push origin main
```

### 2. 等待 GitHub Actions 构建

- 在 GitHub 仓库的 Actions 页面查看构建进度
- 等待构建完成（约 3-5 分钟）

### 3. 在 Sealos 更新应用

1. 进入 Sealos → 应用管理
2. 找到 `hospital-schedule` 应用
3. 点击"更新"或"重新部署"
4. 等待部署完成

### 4. 验证修复

1. 打开浏览器开发者工具（F12）
2. 切换到 Network（网络）标签
3. 访问应用并触发 API 请求
4. 检查：
   - API 请求地址应该是 `/api/xxx`（相对路径）
   - 请求应该成功（状态码 200）
   - 响应头应该包含 CORS 相关头信息

## 如果问题仍然存在

### 检查清单

1. **确认代码已更新**
   - 检查 `src/utils/api.js` 中 `BASE_URL` 是否为 `/api`
   - 检查 `nginx.conf` 中 API 代理配置是否正确

2. **检查浏览器控制台**
   - 打开开发者工具（F12）
   - 查看 Console（控制台）是否有错误
   - 查看 Network（网络）标签，检查 API 请求：
     - 请求 URL 是否正确
     - 响应状态码是什么
     - 是否有 CORS 错误

3. **检查后端服务**
   - 确认后端服务 `https://eflfbpmxcpqg.sealoshzh.site` 是否正常运行
   - 可以在浏览器直接访问后端地址测试

4. **检查 nginx 日志**
   - 在 Sealos 应用详情页面查看日志
   - 检查是否有代理错误

5. **测试 API 代理**
   - 直接访问：`https://你的前端地址/api/某个接口`
   - 应该能正常返回后端数据

## 常见错误及解决方案

### 错误 1：CORS 错误

**错误信息：**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**解决方案：**
- 确认 nginx 配置了 CORS 头
- 确认使用相对路径 `/api` 而不是完整 URL

### 错误 2：404 Not Found

**错误信息：**
```
GET /api/xxx 404 (Not Found)
```

**可能原因：**
- nginx 代理配置不正确
- 后端路径不匹配

**解决方案：**
- 检查 nginx.conf 中的 `proxy_pass` 配置
- 确认后端 API 路径是否正确

### 错误 3：502 Bad Gateway

**错误信息：**
```
502 Bad Gateway
```

**可能原因：**
- 后端服务不可用
- nginx 无法连接到后端

**解决方案：**
- 检查后端服务是否正常运行
- 检查 nginx 代理配置中的后端地址是否正确

### 错误 4：网络超时

**错误信息：**
```
Request timeout
```

**可能原因：**
- 后端响应慢
- 网络连接问题

**解决方案：**
- 增加 nginx 超时时间（已在配置中设置为 30s）
- 检查后端服务性能

## 调试技巧

### 1. 在浏览器控制台测试

```javascript
// 测试 API 请求
fetch('/api/某个接口')
  .then(res => res.json())
  .then(data => console.log('成功:', data))
  .catch(err => console.error('失败:', err))
```

### 2. 检查实际请求地址

在浏览器 Network 标签中：
- 查看请求的完整 URL
- 确认是相对路径还是绝对路径
- 查看响应头中的 CORS 信息

### 3. 直接测试后端

在浏览器中直接访问：
```
https://eflfbpmxcpqg.sealoshzh.site/api/某个接口
```
如果能访问，说明后端正常，问题在前端配置。

## 验证修复是否成功

修复后，客户端应该能够：
- ✅ 正常加载页面
- ✅ 成功请求 API 接口
- ✅ 正常显示数据
- ✅ 没有 CORS 错误
- ✅ 没有网络错误

---

**修复后记得重新部署应用！** 🚀

