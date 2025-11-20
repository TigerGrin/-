# localtunnel Tunnel Password 说明

## 什么是 Tunnel Password？

Tunnel Password 是您运行 localtunnel 的机器的**公网IP地址**。

## 如何获取 Tunnel Password？

### 方法1：自动获取（推荐）

运行 `启动localtunnel.bat` 脚本，它会自动显示您的公网IP。

### 方法2：手动获取

在浏览器中访问以下任一网站：
- https://www.ipify.org/
- https://api.ipify.org
- https://ifconfig.me

会显示您的公网IP地址，这就是 Tunnel Password。

### 方法3：通过命令行获取

```powershell
# PowerShell
(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content
```

## 如何使用？

1. **启动 localtunnel**：
   ```bash
   lt --port 5173
   ```

2. **获取生成的URL**：
   会显示类似：`https://puny-roses-stare.loca.lt`

3. **在其他设备访问时**：
   - 打开浏览器，访问生成的URL
   - 会看到一个安全页面
   - 在 "Tunnel Password" 输入框中输入您的公网IP地址
   - 点击 "Click to Submit"
   - 即可访问您的开发服务器

## 注意事项

- ✅ Tunnel Password 就是您的公网IP地址
- ✅ 每个公共IP每7天只需要输入一次（浏览器会记住）
- ✅ 如果您使用VPN，Tunnel Password 是VPN的公网IP
- ✅ 这个机制是为了防止滥用，保护您的服务

## 示例

假设您的公网IP是 `123.45.67.89`，localtunnel生成的URL是 `https://puny-roses-stare.loca.lt`：

1. 在其他设备访问：`https://puny-roses-stare.loca.lt`
2. 在密码框输入：`123.45.67.89`
3. 点击提交
4. 即可访问开发服务器

