# GitHub Actions 快速配置（3 步）

## ⚡ 3 分钟快速配置

### 步骤 1：注册 Docker Hub 账号（如果还没有）

访问 https://hub.docker.com/ 注册账号（免费）

### 步骤 2：配置 GitHub Secrets

1. 打开您的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 添加两个密钥：

   **密钥 1：**
   - Name: `DOCKER_USERNAME`
   - Value: 您的 Docker Hub 用户名

   **密钥 2：**
   - Name: `DOCKER_PASSWORD`
   - Value: 您的 Docker Hub 密码
     - 或访问令牌（推荐）：
       - 登录 Docker Hub
       - Account Settings → Security → New Access Token
       - 创建并复制令牌

### 步骤 3：推送代码

```bash
git add .github/workflows/build.yml
git commit -m "Add GitHub Actions workflow"
git push origin main
```

## ✅ 完成！

推送后，GitHub Actions 会自动开始构建。您可以：

1. 在 GitHub 仓库页面点击 **Actions** 查看构建进度
2. 构建成功后，镜像会推送到 Docker Hub
3. 在 Sealos 使用镜像地址部署应用

## 🔍 在 Sealos 使用

镜像地址格式：
```
docker.io/<您的DockerHub用户名>/hospital-schedule-system:latest
```

在 Sealos "应用部署" 界面：
- 镜像名：`yourusername/hospital-schedule-system:latest`
- 容器端口：`80`
- 开启公网访问

详细说明请查看：`GitHub Actions配置指南.md`

