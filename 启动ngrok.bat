@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo ngrok 隧道启动脚本
echo ========================================
echo.

REM 检查npm是否已安装
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm未安装
    echo.
    echo npm是Node.js的一部分，请先安装Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装Node.js（会自动安装npm）
    echo 3. 安装完成后重新运行此脚本
    echo.
    echo 或者使用包管理器安装：
    echo - 使用Chocolatey: choco install nodejs
    echo - 使用Winget: winget install OpenJS.NodeJS
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

REM 检查npm版本（验证npm是否正常工作）
echo.
echo 步骤1: 检查npm...
call npm --version 2>&1
set NPM_CHECK_ERROR=!errorlevel!
if !NPM_CHECK_ERROR! neq 0 (
    echo.
    echo [WARNING] npm可能未正确安装
    echo 请检查Node.js安装是否正确
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)
echo [OK] npm已安装
echo.

REM 检查ngrok是否已安装
echo.
echo 步骤2: 检查ngrok是否已安装...
where ngrok >nul 2>&1
set NGROK_INSTALLED=!errorlevel!
if !NGROK_INSTALLED! neq 0 (
    echo 步骤2: 安装ngrok...
    echo 正在安装ngrok，请稍候...
    call npm install -g ngrok
    set NGROK_INSTALL_ERROR=!errorlevel!
    if !NGROK_INSTALL_ERROR! neq 0 (
        echo [ERROR] 安装失败，请检查网络连接
        echo.
        echo 也可以手动安装：
        echo npm install -g ngrok
        echo.
        echo 按任意键退出...
        pause >nul
        exit /b 1
    )
    echo [OK] ngrok安装完成
    echo.
) else (
    echo [OK] ngrok已安装
    echo.
)

echo.
echo 步骤3: 检查ngrok配置...
call ngrok config check >nul 2>&1
set NGROK_CONFIG_ERROR=!errorlevel!
if !NGROK_CONFIG_ERROR! neq 0 (
    echo.
    echo [WARNING] ngrok尚未配置authtoken
    echo.
    echo 请先完成以下步骤：
    echo 1. 访问 https://ngrok.com/ 注册免费账号
    echo 2. 登录后在Dashboard中获取authtoken
    echo 3. 运行以下命令配置：
    echo    ngrok config add-authtoken YOUR_AUTH_TOKEN
    echo.
    echo 配置完成后，重新运行此脚本
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
) else (
    echo [OK] ngrok配置检查通过
    echo.
)

echo.
echo 步骤4: 检查开发服务器是否运行...
netstat -ano | findstr :5173 | findstr LISTENING >nul 2>&1
set SERVER_CHECK_ERROR=!errorlevel!
if !SERVER_CHECK_ERROR! neq 0 (
    echo [WARNING] 端口5173未被占用，请确保开发服务器正在运行
    echo.
    echo 请先启动开发服务器：
    echo npm run dev:h5
    echo.
    echo 然后在另一个终端运行此脚本
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)
echo [OK] 开发服务器正在运行
echo.

echo.
echo 步骤5: 启动ngrok隧道...
echo.
echo ========================================
echo ngrok隧道已启动
echo ========================================
echo.
echo 请查看上方显示的 "Forwarding" URL
echo 格式类似: https://xxxx-xx-xx-xx-xx.ngrok.io
echo.
echo 在任何设备的浏览器中访问该URL即可访问开发服务器
echo.
echo 按 Ctrl+C 停止隧道
echo.
echo ========================================
echo.

ngrok http 5173 --region jp

pause

