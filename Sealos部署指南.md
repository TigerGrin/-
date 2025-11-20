# Sealos 部署指南

本指南将帮助您将医院实习排班系统部署到 Sealos 平台，实现长期运行和公网访问。

## 前置准备

1. **Sealos 账号**：确保您已经注册并登录 Sealos 平台
2. **项目代码**：确保项目代码已推送到 Git 仓库（GitHub、GitLab 等）

## 部署步骤

### 方法一：使用 Sealos 应用管理部署（推荐）

#### 1. 登录 Sealos 平台
访问 [Sealos 官网](https://cloud.sealos.io/) 并登录您的账号。

#### 2. 创建应用
1. 进入 Sealos 桌面
2. 点击左侧菜单的 **"应用管理"** 或 **"App Launchpad"**
3. 点击 **"新建应用"** 或 **"创建应用"**

#### 3. 配置应用信息
- **应用名称**：`hospital-schedule-system`（或您喜欢的名称）
- **镜像地址**：需要先构建 Docker 镜像（见下方说明）
- **CPU**：建议 0.5 核或以上
- **内存**：建议 512MB 或以上
- **实例数量**：1（可根据需要调整）

#### 4. 配置网络
- **容器端口**：`80`
- **协议**：`HTTP`
- **开启公网访问**：✅ 勾选
- 系统会自动生成一个公网域名，例如：`your-app-xxx.cloud.sealos.io`

#### 5. 环境变量（可选）
如果需要动态配置后端 API 地址，可以添加环境变量：
- `VITE_API_BASE_URL` = `https://eflfbpmxcpqg.sealoshzh.site/api`

#### 6. 部署应用
点击 **"部署应用"** 或 **"确认"** 按钮，等待部署完成。

### 方法二：使用 Sealos CLI 部署

#### 1. 安装 Sealos CLI
```bash
# macOS/Linux
curl -sfL https://raw.githubusercontent.com/labring/sealos/main/scripts/install.sh | sh

# Windows (使用 Git Bash 或 WSL)
# 下载对应版本：https://github.com/labring/sealos/releases
```

#### 2. 登录 Sealos
```bash
sealos login
```

#### 3. 构建并推送镜像
```bash
# 构建 Docker 镜像
docker build -t your-registry/hospital-schedule:latest .

# 登录到 Sealos 镜像仓库（如果需要）
# sealos login registry

# 推送镜像
docker push your-registry/hospital-schedule:latest
```

#### 4. 使用 YAML 部署
创建 `sealos-deploy.yaml` 文件（见下方），然后执行：
```bash
sealos apply -f sealos-deploy.yaml
```

### 方法三：使用 DevBox 开发并发布

#### 1. 创建 DevBox 项目
1. 登录 Sealos 桌面
2. 点击 **"DevBox"**
3. 点击 **"新建项目"**
4. 选择运行环境（Node.js 18）
5. 配置资源（CPU、内存）
6. 开启公网访问，设置端口为 `5173`（开发模式）

#### 2. 连接开发环境
1. 在 DevBox 项目列表中找到您的项目
2. 选择 IDE（如 Cursor）进行远程开发
3. 安装 DevBox 插件并连接

#### 3. 构建和发布
```bash
# 在 DevBox 终端中执行
npm install
npm run build:h5

# 发布版本
# 在 DevBox 项目详情页面，点击"发布版本"
```

#### 4. 部署上线
1. 在版本历史中找到发布的版本
2. 点击 **"上线"** 按钮
3. 按照向导配置应用设置
4. 部署完成后访问公网地址

## Docker 镜像构建

### 本地构建测试
```bash
# 构建镜像
docker build -t hospital-schedule:latest .

# 本地运行测试
docker run -p 8080:80 hospital-schedule:latest

# 访问 http://localhost:8080 测试
```

### 推送到镜像仓库
```bash
# 登录到镜像仓库（Docker Hub、阿里云、腾讯云等）
docker login

# 标记镜像
docker tag hospital-schedule:latest your-username/hospital-schedule:latest

# 推送镜像
docker push your-username/hospital-schedule:latest
```

## 配置文件说明

### Dockerfile
- 使用多阶段构建，先构建应用，再使用 nginx 提供服务
- 构建产物位于 `/app/dist/build/h5`
- 使用 nginx:alpine 作为运行环境

### nginx.conf
- 配置了静态文件服务
- 支持 SPA 路由（所有路由返回 index.html）
- 配置了 API 代理（可选，如果前端需要代理后端请求）
- 启用了 gzip 压缩和静态资源缓存

### .dockerignore
- 排除不需要的文件，减小镜像体积

## 访问应用

部署完成后，您可以通过以下方式访问：

1. **公网地址**：Sealos 自动生成的域名，例如：
   ```
   https://your-app-xxx.cloud.sealos.io
   ```

2. **自定义域名**（可选）：
   - 在应用详情页面配置自定义域名
   - 需要将域名 CNAME 解析到 Sealos 提供的地址

## 更新应用

### 方法一：重新部署
1. 修改代码后，重新构建镜像
2. 在 Sealos 应用管理界面，点击 **"更新"** 或 **"重新部署"**
3. 输入新的镜像地址和标签

### 方法二：使用 CI/CD
可以配置 GitHub Actions 或 GitLab CI，实现自动构建和部署。

## 常见问题

### 1. 应用无法访问
- 检查应用状态是否为 "Running"
- 确认已开启公网访问
- 检查容器端口配置是否正确（应为 80）

### 2. API 请求失败
- 检查后端服务是否正常运行
- 确认 API 地址配置正确
- 检查 CORS 配置

### 3. 路由刷新 404
- 确认 nginx.conf 中已配置 SPA 路由支持
- 检查 `try_files` 配置是否正确

### 4. 静态资源加载失败
- 检查 `publicPath` 配置（应为 `./`）
- 确认构建产物路径正确

## 资源监控

在 Sealos 应用管理界面，您可以：
- 查看 CPU、内存使用情况
- 查看日志输出
- 查看访问统计
- 配置自动扩缩容

## 成本说明

Sealos 提供免费额度，超出后按使用量计费。建议：
- 开发环境使用较小的资源配置
- 生产环境根据实际访问量调整资源
- 定期检查资源使用情况

## 技术支持

如遇到问题，可以：
1. 查看 Sealos 官方文档
2. 在 Sealos 社区寻求帮助
3. 联系 Sealos 技术支持

---

**祝您部署顺利！** 🚀

