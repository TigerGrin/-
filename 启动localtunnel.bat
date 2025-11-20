@echo off
chcp 65001 >nul
echo ========================================
echo localtunnel 隧道启动脚本（增强版）
echo ========================================
echo.

REM 检查localtunnel是否已安装
where lt >nul 2>&1
if %errorlevel% neq 0 (
    echo [1] 安装localtunnel...
    call npm install -g localtunnel
    if %errorlevel% neq 0 (
        echo [错误] 安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo [✓] 安装完成
    echo.
)

echo [2] 检查开发服务器是否运行...
netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 端口5173未被占用，请确保开发服务器正在运行
    echo.
    echo 请先启动开发服务器：
    echo npm run dev:h5
    echo.
    echo 然后在另一个终端运行此脚本
    echo.
    pause
    exit /b 1
)

echo [3] Tunnel Password（公网IP）...
echo.
echo ═══════════════════════════════════════════════════════
echo 重要提示：
echo Tunnel Password = 您的公网IP地址：60.191.16.173
echo ═══════════════════════════════════════════════════════
echo.
echo 在其他设备访问时，请输入：60.191.16.173
echo.

echo.
echo [4] 启动localtunnel隧道...
echo.
echo ========================================
echo localtunnel隧道已启动
echo ========================================
echo.
echo 请查看上方显示的URL
echo 格式类似: https://xxxx-xx-xx-xx-xx.loca.lt
echo.
echo ⚠️ 重要：访问URL时，需要输入Tunnel Password
echo Tunnel Password = 您的公网IP地址（见上方）
echo.
echo 在任何设备的浏览器中：
echo 1. 访问生成的URL
echo 2. 输入Tunnel Password（公网IP）
echo 3. 点击"Click to Submit"
echo 4. 即可访问开发服务器
echo.
echo 按 Ctrl+C 停止隧道
echo.
echo ========================================
echo.

lt --port 5173

pause
