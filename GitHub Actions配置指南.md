# GitHub Actions 自动构建配置指南

本指南将帮助您配置 GitHub Actions，实现代码推送后自动构建 Docker 镜像。

## 🚀 快速开始

### 步骤 1：创建 GitHub Secrets

1. 打开您的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**（新建仓库密钥）

需要添加以下两个密钥：

#### 密钥 1：DOCKER_USERNAME
- **Name（名称）**：`DOCKER_USERNAME`
- **Secret（值）**：您的 Docker Hub 用户名
  - 如果没有 Docker Hub 账号，请先注册：https://hub.docker.com/

#### 密钥 2：DOCKER_PASSWORD
- **Name（名称）**：`DOCKER_PASSWORD`
- **Secret（值）**：您的 Docker Hub 密码或访问令牌
  - 推荐使用访问令牌（更安全）：
    1. 登录 Docker Hub
    2. 进入 Account Settings → Security
    3. 点击 "New Access Token"
    4. 创建令牌并复制（只显示一次，请保存好）

### 步骤 2：推送工作流文件到仓库

工作流文件已经创建在 `.github/workflows/build.yml`，您只需要：

```bash
# 添加文件
git add .github/workflows/build.yml

# 提交
git commit -m "Add GitHub Actions workflow for Docker build"

# 推送到 GitHub
git push origin main
```

### 步骤 3：验证构建

1. 推送代码后，GitHub Actions 会自动开始构建
2. 在 GitHub 仓库页面，点击 **Actions** 标签
3. 您可以看到构建进度和日志
4. 构建成功后，镜像会自动推送到 Docker Hub

## 📋 工作流说明

### 触发条件

工作流会在以下情况自动触发：
- ✅ 推送到 `main` 或 `master` 分支
- ✅ 创建版本标签（如 `v1.0.0`）
- ✅ 创建 Pull Request
- ✅ 手动触发（在 Actions 页面点击 "Run workflow"）

### 构建的镜像标签

- `latest`：默认分支的最新版本
- `main-<commit-sha>`：基于 commit SHA 的标签
- `v1.0.0`：如果推送了版本标签
- `1.0`：版本标签的简化形式

### 镜像地址格式

构建完成后，镜像地址为：
```
docker.io/<您的DockerHub用户名>/hospital-schedule-system:latest
```

## 🔍 在 Sealos 使用构建的镜像

### 步骤 1：等待构建完成

在 GitHub Actions 页面确认构建成功（绿色 ✓）

### 步骤 2：在 Sealos 部署应用

1. 登录 Sealos 平台
2. 进入 **应用管理** → **应用部署**
3. 配置应用：
   - **应用名称**：`hospital-schedule`
   - **镜像源**：选择 **"公共"**
   - **镜像名**：`<您的DockerHub用户名>/hospital-schedule-system:latest`
     - 例如：`yourusername/hospital-schedule-system:latest`
   - **镜像仓库地址**：留空或填写 `docker.io`
   - **容器端口**：`80`
   - **开启公网访问**：✅
   - **CPU**：`0.5` 核
   - **内存**：`512` MB

4. 点击 **"部署应用"**

5. 等待部署完成，获取公网访问地址

## 🐛 常见问题

### Q1: 构建失败，提示 "unauthorized"？

**原因**：Docker Hub 认证失败

**解决方案**：
1. 检查 `DOCKER_USERNAME` 和 `DOCKER_PASSWORD` 是否正确
2. 如果使用访问令牌，确保令牌有推送权限
3. 重新创建访问令牌并更新 Secret

### Q2: 构建失败，提示找不到 Dockerfile？

**原因**：Dockerfile 路径不正确或未提交到仓库

**解决方案**：
1. 确认 `Dockerfile` 文件在项目根目录
2. 确认文件已提交到 Git：
   ```bash
   git add Dockerfile
   git commit -m "Add Dockerfile"
   git push
   ```

### Q3: 构建失败，提示 npm 错误？

**原因**：依赖安装或构建过程出错

**解决方案**：
1. 查看 GitHub Actions 日志，找到具体错误
2. 检查 `package.json` 和 `package-lock.json` 是否正确
3. 确认 `npm run build:h5` 命令在本地可以正常运行

### Q4: 如何查看构建日志？

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 点击失败的构建任务
3. 展开各个步骤查看详细日志

### Q5: 如何手动触发构建？

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 选择 "Build and Push Docker Image" 工作流
3. 点击 **Run workflow** 按钮
4. 选择分支，点击 **Run workflow**

### Q6: 如何只构建不推送（测试）？

修改 `.github/workflows/build.yml`，将 `push` 设置为 `false`：

```yaml
push: false  # 只构建，不推送
```

## 🔄 更新镜像

每次您推送代码到 `main` 或 `master` 分支时：
1. GitHub Actions 会自动触发构建
2. 构建完成后自动推送新镜像
3. 在 Sealos 中，您可以：
   - 手动更新应用（使用新镜像）
   - 或配置自动更新

## 📝 工作流文件说明

工作流文件位置：`.github/workflows/build.yml`

主要功能：
- ✅ 自动检测代码变更
- ✅ 使用 Docker Buildx 构建多平台镜像
- ✅ 使用缓存加速构建
- ✅ 自动生成版本标签
- ✅ 推送到 Docker Hub

## 💡 优化建议

1. **使用缓存**：工作流已配置构建缓存，加速后续构建
2. **版本标签**：推送版本标签（如 `v1.0.0`）会自动创建对应版本的镜像
3. **多平台构建**：如需支持 ARM 架构，可以添加 `platforms` 配置

## 📞 获取帮助

- GitHub Actions 文档：https://docs.github.com/en/actions
- Docker Hub 文档：https://docs.docker.com/docker-hub/
- Sealos 文档：https://docs.sealos.io

---

**配置完成后，每次推送代码都会自动构建镜像！** 🎉

