# Sealos 快速开始指南

## 🚀 5 分钟快速部署

### 前置条件
- ✅ Sealos 账号（[注册地址](https://cloud.sealos.io/)）
- ✅ 项目代码已准备好
- ⚠️ Docker（可选，如果使用 Sealos 云构建则不需要）

### 方法一：使用 Sealos 应用管理（最简单）

#### 步骤 1：准备 Git 仓库（如果还没有）

确保项目代码已推送到 Git 仓库（GitHub、GitLab、Gitee 等）：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 步骤 2：构建 Docker 镜像

**选项 A：使用 Sealos 云构建（推荐，无需安装 Docker）⭐**
1. 登录 Sealos 平台
2. 进入 **"镜像构建"** 或 **"Image Builder"**
3. 点击 **"新建构建"** 或 **"创建任务"**
4. 连接您的 Git 仓库
5. 配置构建规则：
   - Dockerfile 路径：`./Dockerfile`
   - 构建上下文：`./`
   - 镜像名称：`hospital-schedule-system`
   - 镜像标签：`latest`
6. 点击构建，等待完成（通常 3-5 分钟）

> 💡 **推荐使用云构建**：无需安装 Docker，直接在 Sealos 平台完成构建！

**选项 B：本地构建并推送（需要安装 Docker）**
> 📖 如需安装 Docker，请查看 `Docker安装指南.md`

```bash
# Windows
build-and-deploy.bat

# Linux/Mac
chmod +x build-and-deploy.sh
./build-and-deploy.sh
```

#### 步骤 3：在 Sealos 创建应用

1. 登录 Sealos 桌面
2. 点击左侧 **"应用管理"** 或 **"App Launchpad"**
3. 点击 **"新建应用"**

#### 步骤 4：配置应用

**基本信息：**
- 应用名称：`hospital-schedule`（自定义）
- 镜像地址：选择您构建的镜像，或输入镜像地址
  - 例如：`your-registry/hospital-schedule:latest`

**资源配置：**
- CPU：`0.5` 核（最小配置）
- 内存：`512` MB（最小配置）
- 实例数：`1`

**网络配置：**
- 容器端口：`80`
- 协议：`HTTP`
- ✅ **开启公网访问**（重要！）

**环境变量（可选）：**
如果需要动态配置后端地址，可以添加：
- 变量名：`VITE_API_BASE_URL`
- 变量值：`https://eflfbpmxcpqg.sealoshzh.site/api`

#### 步骤 4：部署

1. 点击 **"部署应用"** 或 **"确认"**
2. 等待 1-2 分钟，状态变为 **"Running"**
3. 在应用详情页面，找到 **"公网地址"**
4. 点击公网地址，即可访问您的应用！

### 方法二：使用 Sealos DevBox（适合开发调试）

#### 步骤 1：创建 DevBox 项目

1. 登录 Sealos 桌面
2. 点击 **"DevBox"**
3. 点击 **"新建项目"**
4. 配置：
   - 运行环境：`Node.js 18`
   - CPU：`0.5` 核
   - 内存：`512` MB
   - 端口：`5173`
   - ✅ 开启公网访问

#### 步骤 2：连接并开发

1. 在 DevBox 项目列表中找到您的项目
2. 选择 IDE（推荐 Cursor 或 VS Code）
3. 安装 DevBox 插件并连接
4. 在终端中执行：
   ```bash
   npm install
   npm run dev:h5
   ```
5. 使用 DevBox 提供的公网地址访问应用

#### 步骤 3：构建并发布

```bash
# 构建生产版本
npm run build:h5

# 在 DevBox 项目详情页面
# 1. 找到"版本历史"
# 2. 点击"发布版本"
# 3. 填写版本信息并发布
```

#### 步骤 4：部署上线

1. 在版本历史中找到发布的版本
2. 点击 **"上线"** 按钮
3. 按照向导完成部署配置
4. 部署完成后访问公网地址

## 📋 检查清单

部署前请确认：
- [ ] 项目代码已推送到 Git 仓库
- [ ] Dockerfile 文件已创建并已推送到仓库
- [ ] nginx.conf 文件已创建并已推送到仓库
- [ ] 后端 API 地址正确（`https://eflfbpmxcpqg.sealoshzh.site/api`）
- [ ] 已在 Sealos 创建镜像构建任务（或本地已构建镜像）
- [ ] 镜像构建成功
- [ ] Sealos 账号已登录
- [ ] 已开启公网访问

## 🔍 验证部署

部署成功后，请验证：
1. ✅ 应用可以正常访问
2. ✅ 页面正常加载
3. ✅ API 请求正常（检查浏览器控制台）
4. ✅ 路由跳转正常（SPA 路由）

## 🐛 常见问题

### Q1: 应用无法访问？
- 检查应用状态是否为 "Running"
- 确认已开启公网访问
- 检查容器端口是否为 80

### Q2: 页面空白？
- 检查浏览器控制台错误
- 确认构建产物路径正确
- 检查 nginx 配置

### Q3: API 请求失败？
- 检查后端服务是否正常运行
- 确认 API 地址配置正确
- 检查 CORS 配置

### Q4: 路由刷新 404？
- 确认 nginx.conf 中已配置 SPA 路由支持
- 检查 `try_files` 配置

## 📞 获取帮助

- 📖 **无需 Docker 部署**：查看 `无需Docker部署指南.md`（推荐！）
- 📖 **安装 Docker**：查看 `Docker安装指南.md`
- 📖 **详细部署文档**：查看 `Sealos部署指南.md`
- 🌐 Sealos 官方文档：https://docs.sealos.io
- 💬 Sealos 社区：https://forum.sealos.io

---

**💡 提示：无需安装 Docker，使用 Sealos 云构建即可快速部署！** 🎉

