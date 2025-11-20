# ngrok 使用指南

## 📋 使用流程

### 🔧 在本机（开发机器）需要做什么：

#### 步骤1：启动开发服务器

在一个终端中运行：
```bash
npm run dev:h5
```

等待看到类似输出：
```
vite v5.2.8 dev server running at:
  → Local:   http://localhost:5173/
  → Network: http://192.168.41.1:5173/
```

**保持这个终端窗口打开！**

#### 步骤2：启动 ngrok 隧道

在**另一个新的终端**中运行：
```bash
启动ngrok.bat
```

或者手动运行：
```bash
ngrok http 5173
```

#### 步骤3：复制生成的URL

ngrok会显示类似：
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok.io -> http://localhost:5173
```

**复制这个URL！**（例如：`https://abc123.ngrok.io`）

---

### 📱 在其他终端（手机/其他电脑）需要做什么：

#### 步骤1：打开浏览器

在任何设备的浏览器中打开：
- Chrome、Safari、Edge、Firefox 等都可以

#### 步骤2：访问URL

在地址栏输入刚才复制的URL：
```
https://xxxx-xx-xx-xx-xx.ngrok.io
```

**无需密码！** 直接访问即可。

#### 步骤3：开始使用

访问后即可看到您的开发服务器页面，就像在本地访问一样！

---

## 🔄 完整流程示例

### 开发机器（您的电脑）：

**终端1：**
```bash
npm run dev:h5
```

**终端2：**
```bash
启动ngrok.bat
# 或
ngrok http 5173
```

会显示：
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5173
```

### 其他设备（手机/其他电脑）：

1. 打开浏览器
2. 访问：`https://abc123.ngrok.io`
3. 立即可以看到开发服务器！

---

## 💡 重要提示

- ✅ **开发服务器必须一直运行**（终端1）
- ✅ **ngrok隧道必须一直运行**（终端2）
- ✅ **URL是全局的**，任何设备都可以访问
- ✅ **无需配置防火墙**，无需密码
- ✅ **URL每次重启会变化**（免费版）

## 🛑 停止服务

要停止服务：
1. 在ngrok终端按 `Ctrl+C` 停止隧道
2. 在开发服务器终端按 `Ctrl+C` 停止服务器

## 📝 快速参考

| 操作 | 命令 | 位置 |
|------|------|------|
| 启动开发服务器 | `npm run dev:h5` | 开发机器 - 终端1 |
| 启动ngrok | `启动ngrok.bat` 或 `ngrok http 5173` | 开发机器 - 终端2 |
| 访问服务 | 浏览器访问ngrok URL | 任何设备 |

