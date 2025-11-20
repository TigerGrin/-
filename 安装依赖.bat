@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================
echo 项目依赖安装脚本
echo ========================================
echo.

REM 检查npm是否已安装
echo [1] 检查Node.js和npm...
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Node.js未安装
    echo.
    echo 请先安装Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装Node.js LTS版本（会自动安装npm）
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

REM 检查npm版本
call npm --version >nul 2>&1
set NPM_CHECK_ERROR=!errorlevel!
if !NPM_CHECK_ERROR! neq 0 (
    echo [WARNING] npm可能未正确安装
    echo 请检查Node.js安装是否正确
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm已安装 (版本: !NPM_VERSION!)
echo.

REM 设置淘宝npm镜像源
echo [2] 配置npm镜像源（使用淘宝镜像）...
call npm config set registry https://registry.npmmirror.com
if !errorlevel! neq 0 (
    echo [WARNING] 设置镜像源失败，将使用默认源
) else (
    echo [OK] 已设置为淘宝镜像源
    echo.
)

REM 验证镜像源设置
echo [3] 验证镜像源配置...
call npm config get registry
echo.

REM 检查package.json是否存在
echo [4] 检查项目配置文件...
if not exist "package.json" (
    echo [ERROR] 未找到package.json文件
    echo 请确保在项目根目录运行此脚本
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)
echo [OK] 找到package.json文件
echo.

REM 安装项目依赖
echo [5] 安装项目依赖...
echo 正在安装依赖，请稍候（可能需要几分钟）...
echo.
call npm install
set INSTALL_ERROR=!errorlevel!
if !INSTALL_ERROR! neq 0 (
    echo.
    echo [ERROR] 依赖安装失败
    echo 请检查：
    echo 1. 网络连接是否正常
    echo 2. 镜像源是否可用
    echo 3. 磁盘空间是否充足
    echo.
    echo 也可以手动运行：npm install
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

echo.
echo [6] 安装exceljs库（Excel导出功能所需）...
call npm install exceljs
set EXCELJS_INSTALL_ERROR=!errorlevel!
if !EXCELJS_INSTALL_ERROR! neq 0 (
    echo [WARNING] exceljs安装失败，Excel导出功能可能无法使用
    echo 可以稍后手动运行：npm install exceljs
    echo.
) else (
    echo [OK] exceljs安装完成
    echo.
)

echo.
echo ========================================
echo 安装完成！
echo ========================================
echo.
echo [OK] 所有依赖已成功安装
echo.

REM 询问是否启动开发服务器
echo [7] 是否立即启动开发服务器？
echo.
echo 按Y启动开发服务器，按N退出
choice /C YN /N /M "请选择 (Y/N): "
if !errorlevel! equ 2 (
    echo.
    echo 已取消启动
    echo.
    echo 如需启动开发服务器，请运行：
    echo   npm run dev:h5
    echo.
    echo 如需让其他设备访问，请运行：
    echo   启动ngrok.bat
    echo.
    pause
    exit /b 0
)

echo.
echo ========================================
echo 正在启动开发服务器...
echo ========================================
echo.
echo 开发服务器启动后，您可以在浏览器中访问：
echo   http://localhost:5173/
echo.
echo 如需让其他设备访问，请在另一个终端运行：
echo   启动ngrok.bat
echo.
echo 按 Ctrl+C 停止开发服务器
echo.
echo ========================================
echo.

REM 启动开发服务器
call npm run dev:h5

