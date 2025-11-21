# 找不到 Image Builder 的解决方案

如果您在 Sealos 桌面找不到"镜像构建"或"Image Builder"，可以使用以下替代方案：

## 🔍 方案一：使用 Sealos 应用商店的构建功能

1. 点击 Sealos 桌面上的 **"应用商店"** 图标
2. 在应用商店中搜索 "构建" 或 "build"
3. 查找是否有镜像构建相关的应用
4. 安装并使用

## 🚀 方案二：使用 GitHub Actions 自动构建（推荐）

如果 Sealos 没有 Image Builder，可以使用 GitHub Actions 自动构建镜像并推送到 Docker Hub 或其他镜像仓库。

### 步骤：

1. **创建 GitHub Actions 工作流文件**

在项目根目录创建 `.github/workflows/build.yml`：

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            your-dockerhub-username/hospital-schedule:latest
            your-dockerhub-username/hospital-schedule:${{ github.sha }}
```

2. **配置 GitHub Secrets**

在 GitHub 仓库设置中添加：
- `DOCKER_USERNAME`: 您的 Docker Hub 用户名
- `DOCKER_PASSWORD`: 您的 Docker Hub 密码或访问令牌

3. **推送代码触发构建**

```bash
git add .github/workflows/build.yml
git commit -m "Add GitHub Actions workflow"
git push
```

4. **在 Sealos 使用构建的镜像**

构建完成后，在 Sealos 的"应用部署"界面：
- 镜像名：`your-dockerhub-username/hospital-schedule:latest`
- 镜像仓库地址：`docker.io`（或留空）

## 🐳 方案三：使用本地 Docker 构建（如果已安装）

如果您已经安装了 Docker，可以使用本地构建：

1. **运行构建脚本**

```bash
# Windows
build-and-deploy.bat

# Linux/Mac
chmod +x build-and-deploy.sh
./build-and-deploy.sh
```

2. **推送到镜像仓库**

修改脚本中的 `REGISTRY` 变量，然后运行脚本会自动推送。

3. **在 Sealos 使用**

在"应用部署"界面使用推送的镜像地址。

## 📦 方案四：使用其他云构建服务

### 使用阿里云容器镜像服务（ACR）

1. 登录阿里云容器镜像服务
2. 创建镜像仓库
3. 使用构建规则，连接 Git 仓库
4. 自动构建镜像
5. 在 Sealos 使用阿里云镜像地址

### 使用腾讯云容器镜像服务（TCR）

1. 登录腾讯云容器镜像服务
2. 创建镜像仓库
3. 配置构建规则
4. 在 Sealos 使用腾讯云镜像地址

## 🎯 方案五：直接在 Sealos 使用已有镜像

如果您有其他方式构建的镜像，可以直接在 Sealos 使用：

1. **在"应用部署"界面**
   - 镜像名：输入您的镜像完整地址
   - 例如：`docker.io/username/hospital-schedule:latest`
   - 或：`registry.cn-hangzhou.aliyuncs.com/namespace/image:tag`

2. **配置其他参数**
   - 容器端口：`80`
   - 开启公网访问
   - 配置资源

3. **部署应用**

## 💡 推荐方案

**最简单的方式：**
1. 使用 GitHub Actions 自动构建（方案二）
2. 或使用本地 Docker 构建并推送（方案三）
3. 然后在 Sealos 的"应用部署"界面使用构建好的镜像

**最快速的方式：**
- 如果您有 Docker Hub 账号，使用 GitHub Actions 是最省事的
- 每次推送代码到 GitHub，自动构建并推送镜像
- 然后在 Sealos 直接使用镜像地址即可

## 📝 当前界面说明

您当前在 **"应用部署"** 界面，这个界面是用来：
- ✅ 部署已经构建好的镜像
- ✅ 配置应用运行参数
- ✅ 设置网络和资源

这个界面**不是**用来构建镜像的。

要构建镜像，您需要：
1. 找到 Image Builder（如果存在）
2. 或使用上述替代方案

## 🔗 相关文档

- 详细部署指南：`Sealos部署指南.md`
- 快速开始：`Sealos快速开始.md`
- Docker 安装：`Docker安装指南.md`

---

**建议：如果找不到 Image Builder，使用 GitHub Actions 是最方便的自动化方案！** 🚀

