# 无需 Docker 的 Sealos 部署指南

如果您不想安装 Docker，可以直接使用 Sealos 的云构建功能来部署应用！

## 🚀 快速开始（5 步）

### 步骤 1：准备 Git 仓库

确保您的项目代码已推送到 Git 仓库：

**选项 A：使用 GitHub**
1. 在 GitHub 创建新仓库
2. 将项目代码推送到仓库：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

**选项 B：使用 Gitee（国内更快）**
1. 在 Gitee 创建新仓库
2. 将项目代码推送到仓库：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://gitee.com/your-username/your-repo.git
git push -u origin main
```

### 步骤 2：登录 Sealos

1. 访问 [Sealos 官网](https://cloud.sealos.io/)
2. 注册/登录账号
3. 进入 Sealos 桌面

### 步骤 3：创建镜像构建任务

1. 在 Sealos 桌面，找到 **"镜像构建"** 或 **"Image Builder"**
2. 点击 **"新建构建"** 或 **"创建任务"**

3. 配置构建信息：
   - **任务名称**：`hospital-schedule-build`
   - **代码仓库**：
     - 选择您的 Git 平台（GitHub/GitLab/Gitee）
     - 授权访问您的仓库
     - 选择仓库和分支（通常是 `main` 或 `master`）
   - **Dockerfile 路径**：`./Dockerfile`
   - **构建上下文**：`./`
   - **镜像名称**：`hospital-schedule-system`
   - **镜像标签**：`latest`

4. 点击 **"创建"** 或 **"开始构建"**

### 步骤 4：等待构建完成

1. 在构建任务列表中，可以看到构建进度
2. 点击任务查看详细日志
3. 等待构建完成（通常 3-5 分钟）
4. 构建成功后，镜像会自动保存到 Sealos 的镜像仓库

### 步骤 5：部署应用

1. 在 Sealos 桌面，点击 **"应用管理"** 或 **"App Launchpad"**
2. 点击 **"新建应用"**

3. 配置应用：
   - **应用名称**：`hospital-schedule`
   - **镜像地址**：选择刚才构建的镜像
     - 或手动输入：`sealos.hub/hospital-schedule-system:latest`
   - **CPU**：`0.5` 核
   - **内存**：`512` MB
   - **实例数**：`1`

4. 配置网络：
   - **容器端口**：`80`
   - **协议**：`HTTP`
   - ✅ **开启公网访问**（重要！）

5. 点击 **"部署应用"**

6. 等待 1-2 分钟，应用状态变为 **"Running"**

7. 在应用详情页面，找到 **"公网地址"**，点击即可访问！

## 📋 部署检查清单

部署前请确认：
- [ ] 项目代码已推送到 Git 仓库
- [ ] 仓库中包含 `Dockerfile` 文件
- [ ] 仓库中包含 `nginx.conf` 文件
- [ ] Sealos 账号已登录
- [ ] 已创建镜像构建任务
- [ ] 镜像构建成功
- [ ] 已创建应用并开启公网访问

## 🔍 验证部署

部署成功后，请验证：
1. ✅ 应用状态为 "Running"
2. ✅ 可以访问公网地址
3. ✅ 页面正常加载
4. ✅ API 请求正常（检查浏览器控制台）
5. ✅ 路由跳转正常

## 🐛 常见问题

### Q1: 构建失败？
**可能原因和解决方案：**
- **Dockerfile 路径错误**：确认路径为 `./Dockerfile`
- **构建上下文错误**：确认为 `./`
- **代码未推送**：确保所有文件（包括 Dockerfile）都已推送到仓库
- **查看构建日志**：在构建任务详情中查看错误信息

### Q2: 找不到镜像？
**解决方案：**
- 确认镜像构建任务已成功完成
- 在应用创建时，使用完整的镜像地址：
  - 格式：`sealos.hub/镜像名称:标签`
  - 例如：`sealos.hub/hospital-schedule-system:latest`

### Q3: 应用无法启动？
**检查：**
- 查看应用日志（在应用详情页面）
- 确认容器端口配置为 `80`
- 确认已开启公网访问

### Q4: 页面空白或 404？
**解决方案：**
- 检查浏览器控制台错误
- 确认 nginx.conf 文件已包含在仓库中
- 查看应用日志确认 nginx 是否正常启动

## 🔄 更新应用

当您修改代码后，需要重新部署：

1. **推送新代码到 Git 仓库**
```bash
git add .
git commit -m "Update code"
git push
```

2. **重新构建镜像**
   - 在 Sealos 的镜像构建任务中
   - 点击 **"重新构建"** 或创建新的构建任务

3. **更新应用**
   - 在应用管理中找到您的应用
   - 点击 **"更新"** 或 **"重新部署"**
   - 选择新构建的镜像版本

## 💡 小贴士

1. **使用版本标签**：建议使用版本号作为镜像标签（如 `v1.0.0`），而不是 `latest`，便于版本管理

2. **自动化构建**：可以配置 Git Webhook，代码推送后自动触发构建

3. **多环境部署**：可以创建多个构建任务，分别构建开发、测试、生产环境的镜像

4. **监控和日志**：在应用详情页面可以查看实时日志和资源使用情况

## 📞 获取帮助

- 📖 详细部署文档：查看 `Sealos部署指南.md`
- 🌐 Sealos 官方文档：https://docs.sealos.io
- 💬 Sealos 社区：https://forum.sealos.io

---

**无需安装 Docker，也能轻松部署！** 🎉

