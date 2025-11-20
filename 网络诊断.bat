@echo off
chcp 65001 >nul
echo ========================================
echo Vite开发服务器网络访问诊断工具
echo ========================================
echo.

echo [1] 检查端口5173是否被占用...
netstat -ano | findstr :5173
if %errorlevel% == 0 (
    echo ✓ 端口5173正在使用中
) else (
    echo ✗ 端口5173未被占用，请确保开发服务器正在运行
    echo.
    pause
    exit /b 1
)

echo.
echo [2] 检查当前IP地址...
ipconfig | findstr /i "IPv4"
echo.

echo [3] 检查防火墙规则（需要管理员权限）...
netsh advfirewall firewall show rule name="Vite Dev Server TCP" >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ 已找到防火墙规则
    netsh advfirewall firewall show rule name="Vite Dev Server TCP"
) else (
    echo ✗ 未找到防火墙规则，需要添加规则
    echo.
    echo 请以管理员身份运行以下命令添加防火墙规则：
    echo netsh advfirewall firewall add rule name="Vite Dev Server TCP" dir=in action=allow protocol=TCP localport=5173
    echo netsh advfirewall firewall add rule name="Vite Dev Server UDP" dir=in action=allow protocol=UDP localport=5173
)

echo.
echo [4] 测试本地连接...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ 本地连接正常
) else (
    echo ✗ 本地连接失败
)

echo.
echo [5] 检查监听端口绑定...
netstat -ano | findstr :5173 | findstr LISTENING
echo.
echo 注意：应该看到 "0.0.0.0:5173" 表示监听所有网络接口
echo 如果只看到 "127.0.0.1:5173" 则需要修改Vite配置

echo.
echo ========================================
echo 诊断完成！
echo ========================================
echo.
echo 如果防火墙规则不存在，请：
echo 1. 以管理员身份运行此脚本
echo 2. 或手动运行 firewall-setup.ps1
echo.
echo 如果问题仍然存在，请检查：
echo - 所有设备是否在同一局域网
echo - 路由器是否启用了AP隔离
echo - 杀毒软件是否阻止了连接
echo - 尝试使用局域网IP访问（如：http://192.168.41.1:5173/）
echo.
pause
