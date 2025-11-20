# 使用 ngrok 替代 localtunnel

## 为什么选择 ngrok？

- ✅ 更稳定可靠（不会出现503错误）
- ✅ 不需要 Tunnel Password
- ✅ 直接访问即可
- ✅ 专业服务

## 快速设置步骤

### 步骤1：注册 ngrok 账号（使用GitHub/Google）

1. 访问 https://ngrok.com/
2. 点击 "Sign up with GitHub" 或 "Sign up with Google"
   - **这样可以跳过CAPTCHA验证！**
3. 完成注册

### 步骤2：获取 authtoken

1. 登录后进入 Dashboard
2. 在 "Your Authtoken" 部分复制token

### 步骤3：配置 ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```
将 `YOUR_AUTH_TOKEN` 替换为复制的token

### 步骤4：启动 ngrok

```bash
ngrok http 5173
```

或者双击运行 `启动ngrok.bat`

### 步骤5：使用生成的URL

ngrok会显示类似：
```
Forwarding  https://xxxx-xx-xx-xx-xx.ngrok.io -> http://localhost:5173
```

**直接访问这个URL即可，无需密码！**

## 对比

| 特性 | localtunnel | ngrok |
|------|-------------|-------|
| 稳定性 | ⚠️ 有时503错误 | ✅ 稳定 |
| 需要密码 | ❌ 需要Tunnel Password | ✅ 不需要 |
| 注册难度 | ✅ 简单 | ⚠️ 需要注册 |
| 免费使用 | ✅ 是 | ✅ 是 |

## 建议

**如果 localtunnel 一直503错误，强烈建议使用 ngrok！**

