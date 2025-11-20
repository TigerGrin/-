# Docker 安装指南（Windows）

## 📦 方法一：安装 Docker Desktop（推荐）

### 系统要求
- Windows 10 64位：专业版、企业版或教育版（版本 1903 或更高，带 Hyper-V）
- Windows 11 64位：家庭版或专业版
- 启用 Hyper-V 和容器功能
- 至少 4GB RAM

### 安装步骤

#### 1. 下载 Docker Desktop
访问 Docker 官网下载页面：
```
https://www.docker.com/products/docker-desktop/
```
或直接下载：
```
https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
```

#### 2. 运行安装程序
1. 双击下载的 `Docker Desktop Installer.exe`
2. 如果提示需要管理员权限，点击"是"
3. 在安装向导中：
   - ✅ 勾选 "Use WSL 2 instead of Hyper-V"（推荐，如果支持）
   - ✅ 勾选 "Add shortcut to desktop"（可选）
4. 点击 "Ok" 开始安装

#### 3. 完成安装
1. 安装完成后，点击 "Close and restart"
2. 重启计算机（如果需要）

#### 4. 启动 Docker Desktop
1. 重启后，从开始菜单启动 "Docker Desktop"
2. 首次启动可能需要几分钟来初始化
3. 等待 Docker Desktop 图标在系统托盘显示为运行状态（绿色）

#### 5. 验证安装
打开 PowerShell 或命令提示符，运行：
```bash
docker --version
docker run hello-world
```

如果看到版本信息和 "Hello from Docker!" 消息，说明安装成功！

### 常见问题

#### Q1: 提示需要 WSL 2？
**解决方案：**
1. 打开 PowerShell（管理员权限）
2. 运行以下命令启用 WSL：
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
3. 重启计算机
4. 下载并安装 WSL 2 更新包：
   ```
   https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
   ```
5. 设置 WSL 2 为默认版本：
```powershell
wsl --set-default-version 2
```

#### Q2: 提示需要 Hyper-V？
**解决方案：**
1. 打开"控制面板" → "程序" → "启用或关闭 Windows 功能"
2. 勾选：
   - ✅ Hyper-V
   - ✅ 容器
   - ✅ 适用于 Linux 的 Windows 子系统
3. 点击"确定"，重启计算机

#### Q3: Windows 10 家庭版无法使用 Hyper-V？
**解决方案：**
- 使用 WSL 2 后端（推荐）
- 或升级到 Windows 10 专业版

#### Q4: 启动 Docker Desktop 很慢？
**解决方案：**
1. 确保已启用虚拟化（在 BIOS 中）
2. 关闭其他占用资源的程序
3. 增加 Docker Desktop 的内存分配：
   - 打开 Docker Desktop
   - Settings → Resources → Advanced
   - 增加 Memory 到 4GB 或更多

## 🚀 方法二：使用 Sealos 云构建（无需安装 Docker）

如果您不想在本地安装 Docker，可以使用 Sealos 的云构建功能！

### 步骤

#### 1. 准备 Git 仓库
确保您的项目代码已推送到 Git 仓库（GitHub、GitLab、Gitee 等）

#### 2. 在 Sealos 创建镜像构建任务
1. 登录 Sealos 平台
2. 进入 **"镜像构建"** 或 **"Image Builder"**
3. 点击 **"新建构建"** 或 **"创建任务"**

#### 3. 配置构建规则
- **代码仓库**：连接您的 Git 仓库
- **分支**：选择要构建的分支（通常是 `main` 或 `master`）
- **Dockerfile 路径**：`./Dockerfile`
- **构建上下文**：`./`
- **镜像名称**：`hospital-schedule-system`
- **镜像标签**：`latest` 或版本号

#### 4. 开始构建
1. 点击 **"开始构建"**
2. 等待构建完成（通常 3-5 分钟）
3. 构建完成后，镜像会自动推送到 Sealos 的镜像仓库

#### 5. 使用构建的镜像
在创建应用时，直接选择刚才构建的镜像即可！

## 📋 两种方法对比

| 特性 | Docker Desktop | Sealos 云构建 |
|------|---------------|--------------|
| 需要本地安装 | ✅ 是 | ❌ 否 |
| 需要 Git 仓库 | ❌ 否 | ✅ 是 |
| 本地测试 | ✅ 可以 | ❌ 不可以 |
| 构建速度 | 快（本地） | 中等（云端） |
| 适合场景 | 开发调试 | 生产部署 |

## 🎯 推荐方案

- **如果您需要本地开发和测试**：安装 Docker Desktop
- **如果您只想快速部署**：使用 Sealos 云构建（无需安装 Docker）

## ✅ 安装后验证

安装 Docker 后，运行以下命令验证：

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker 是否运行
docker info

# 测试运行容器
docker run hello-world
```

## 📞 获取帮助

- Docker 官方文档：https://docs.docker.com/desktop/install/windows-install/
- Docker 社区：https://forums.docker.com/
- Sealos 文档：https://docs.sealos.io

---

**安装完成后，您就可以使用 `build-and-deploy.bat` 脚本构建镜像了！** 🎉

