# Windows防火墙配置脚本
# 以管理员权限运行此脚本以允许端口5173通过防火墙

Write-Host "正在配置Windows防火墙规则..." -ForegroundColor Green

# 删除可能存在的旧规则
Remove-NetFirewallRule -DisplayName "Vite Dev Server TCP" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "Vite Dev Server UDP" -ErrorAction SilentlyContinue

# 添加入站规则（TCP）
New-NetFirewallRule -DisplayName "Vite Dev Server TCP" `
    -Direction Inbound `
    -LocalPort 5173 `
    -Protocol TCP `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "允许Vite开发服务器TCP连接"

# 添加入站规则（UDP，用于HMR）
New-NetFirewallRule -DisplayName "Vite Dev Server UDP" `
    -Direction Inbound `
    -LocalPort 5173 `
    -Protocol UDP `
    -Action Allow `
    -Profile Domain,Private,Public `
    -Description "允许Vite开发服务器UDP连接（HMR）"

Write-Host "防火墙规则配置完成！" -ForegroundColor Green
Write-Host "请确保其他设备与开发机器在同一局域网内。" -ForegroundColor Yellow

