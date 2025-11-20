@echo off
chcp 65001 >nul
echo ========================================
echo 网络连接测试工具
echo ========================================
echo.
echo 此脚本用于测试从其他终端访问开发服务器
echo.
echo 请在其他终端（手机或其他电脑）上运行此脚本
echo.
pause

echo.
echo [1] 测试网络连通性（ping）...
ping -n 4 192.168.41.1
echo.

echo [2] 测试端口连通性（需要PowerShell 5.0+）...
powershell -Command "try { $result = Test-NetConnection -ComputerName 192.168.41.1 -Port 5173 -InformationLevel Quiet -WarningAction SilentlyContinue; if ($result) { Write-Host '✓ 端口5173可以访问' } else { Write-Host '✗ 端口5173无法访问' } } catch { Write-Host '✗ 无法测试端口（可能需要PowerShell 5.0+）' }"
echo.

echo [3] 测试HTTP连接...
curl -s -o nul -w "HTTP状态码: %%{http_code}\n" http://192.168.41.1:5173/
if %errorlevel% == 0 (
    echo ✓ HTTP连接成功
) else (
    echo ✗ HTTP连接失败
)
echo.

echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 如果所有测试都失败，请检查：
echo 1. 设备是否连接到同一WiFi/局域网
echo 2. 路由器是否启用了AP隔离
echo 3. 防火墙是否阻止了连接
echo.
echo 如果ping成功但端口不通，请检查防火墙设置
echo 如果ping不通，请检查网络连接和路由器设置
echo.
pause

