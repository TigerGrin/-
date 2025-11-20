# 使用ngrok快速解决网络访问问题

## 什么是ngrok？

ngrok是一个内网穿透工具，可以将本地服务器暴露到公网，无需配置防火墙和网络。

## 安装和使用

### 步骤1：安装ngrok

```bash
# 方法1：使用npm（推荐）
npm install -g ngrok

# 方法2：从官网下载
# 访问 https://ngrok.com/download
# 下载Windows版本并解压
```

### 步骤2：注册账号（免费）

1. 访问 https://ngrok.com/
2. 注册免费账号
3. 获取authtoken（在Dashboard中）

### 步骤3：配置ngrok

```bash
# 设置authtoken（首次使用）
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 步骤4：启动隧道

```bash
# 在开发服务器运行的同时，打开新终端运行：
ngrok http 5173
```

### 步骤5：使用生成的URL

ngrok会显示类似：
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok.io -> http://localhost:5173
```

在任何设备的浏览器中访问 `https://xxxx-xx-xx-xx-xx.ngrok.io` 即可。

## 优点

- ✅ 无需配置防火墙
- ✅ 无需配置网络
- ✅ 任何设备都可以访问（包括手机）
- ✅ 自动HTTPS支持
- ✅ 实时日志查看

## 注意事项

- 免费版URL每次重启会变化
- 免费版有连接数限制
- 如果只是临时使用，完全够用

