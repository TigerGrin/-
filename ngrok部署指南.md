# ngrok 快速部署指南

## ✅ 第1步：ngrok已安装

ngrok已经通过npm安装完成！

## 📝 第2步：注册账号并获取authtoken

1. **访问官网注册**：
   - 打开 https://ngrok.com/
   - 点击 "Sign up" 注册免费账号
   - 使用邮箱注册即可

2. **获取authtoken**：
   - 登录后进入 Dashboard
   - 在 "Your Authtoken" 部分复制token

3. **配置ngrok**：
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
   将 `YOUR_AUTH_TOKEN` 替换为复制的token

## 🚀 第3步：启动开发服务器

在一个终端中启动开发服务器：
```bash
npm run dev:h5
```

## 🌐 第4步：启动ngrok隧道

在**另一个终端**中运行：
```bash
ngrok http 5173
```

或者直接双击运行 `启动ngrok.bat`

## 📱 第5步：使用生成的URL

ngrok会显示类似：
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok.io -> http://localhost:5173
```

在任何设备的浏览器中访问 `https://xxxx-xx-xx-xx-xx.ngrok.io` 即可！

## 💡 提示

- ✅ 免费版URL每次重启会变化
- ✅ 免费版有连接数限制（通常够用）
- ✅ 支持HTTPS自动
- ✅ 无需配置防火墙
- ✅ 任何设备都可以访问

## 🔧 故障排除

如果遇到问题：
1. 确保开发服务器正在运行（端口5173）
2. 确保authtoken配置正确
3. 检查网络连接

