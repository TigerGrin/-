# 区分公网IP和局域网IP

## 这些IP地址分析

从Vite显示的Network IP地址来看：

### ❌ 不是公网IP的地址：

1. **`192.168.41.1`** - 这是**局域网IP**（私有IP）
   - 192.168.x.x 是私有IP地址段
   - 只在您的本地网络内有效

2. **`172.28.18.247`** - 这也是**局域网IP**（私有IP）
   - 172.16.x.x - 172.31.x.x 是私有IP地址段
   - 可能是Docker或虚拟网络

3. **`26.26.132.80`** - 可能是**VPN或虚拟网络IP**
   - 26.x.x.x 可能是VPN分配的IP

4. **`61.139.2.1`** - 可能看起来像公网IP，但：
   - 如果您的机器在路由器后面，这是路由器分配的IP
   - 不是您机器的真实公网IP

## 什么是公网IP？

公网IP是您在互联网上的唯一标识，由您的ISP（网络服务提供商）分配。

## 如何获取真正的公网IP？

### 方法1：在浏览器中查看（最简单）

打开浏览器，访问以下任一网站：
- https://www.ipify.org/
- https://api.ipify.org
- https://whatismyipaddress.com/

**显示的IP地址才是您的公网IP**，这就是 Tunnel Password！

### 方法2：通过命令行

```powershell
# PowerShell
(Invoke-WebRequest -Uri 'https://api.ipify.org' -UseBasicParsing).Content
```

## 重要区别

| IP类型 | 示例 | 用途 | Tunnel Password |
|--------|------|------|----------------|
| 局域网IP | 192.168.41.1 | 同一WiFi/局域网内访问 | ❌ 不是 |
| VPN IP | 26.26.132.80 | VPN网络内访问 | ❌ 不是 |
| **公网IP** | 123.45.67.89 | 互联网上的唯一标识 | ✅ **是** |

## 总结

- Vite显示的Network IP都是**局域网IP或虚拟网络IP**
- 需要访问网站（如 ipify.org）获取**真正的公网IP**
- **公网IP才是 Tunnel Password**

立即访问 https://www.ipify.org/ 查看您的公网IP！

