# 在 ngrok Dashboard 中获取 Authtoken

## 位置说明

您当前看到的页面就是 ngrok Dashboard！

## 获取 Authtoken 的步骤

### 方法1：通过左侧导航栏（推荐）

1. **查看左侧导航栏**
2. **找到 "Getting Started" 部分**
3. **点击 "Your Authtoken"**
   - 应该在 "Setup & Installation" 下面
4. **复制显示的 authtoken**

### 方法2：直接访问

如果找不到，可以直接访问：
```
https://dashboard.ngrok.com/get-started/your-authtoken
```

## 配置 authtoken

获取到 authtoken 后，在终端运行：

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

将 `YOUR_AUTH_TOKEN` 替换为您复制的token。

## 然后启动 ngrok

```bash
ngrok http 5173
```

或者双击运行 `启动ngrok.bat`

## 提示

- authtoken 是一串类似 `2xxxxx_xxxxxxxxxxxxx` 的字符串
- 配置一次后，以后直接使用 `ngrok http 5173` 即可
- 不需要每次都输入密码

