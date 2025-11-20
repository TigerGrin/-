# 获取 Tunnel Password（公网IP）的方法

## Tunnel Password 是什么？

Tunnel Password 就是您运行 localtunnel 的机器的**公网IP地址**。

## 如何获取？

### 方法1：在浏览器中访问（最简单）

打开浏览器，访问以下任一网站，会显示您的公网IP：
- https://www.ipify.org/
- https://api.ipify.org
- https://whatismyipaddress.com/
- https://ifconfig.me

显示的IP地址就是 Tunnel Password。

### 方法2：查看 localtunnel 输出

启动 localtunnel 时，它可能会显示相关信息，或者您可以查看终端输出。

### 方法3：如果您使用VPN

如果您连接了VPN，Tunnel Password 是VPN的公网IP，不是本地IP。

## 使用步骤

1. **获取公网IP**（Tunnel Password）
2. **启动 localtunnel**：`lt --port 5173`
3. **复制生成的URL**（如：`https://puny-roses-stare.loca.lt`）
4. **在其他设备访问**：
   - 打开浏览器，访问URL
   - 在密码框输入您的公网IP
   - 点击提交即可访问

## 重要提示

- ✅ 每个公共IP每7天只需要输入一次（浏览器会记住）
- ✅ 如果使用VPN，使用VPN的公网IP
- ✅ 这个机制是为了防止滥用

