@echo off
chcp 65001 >nul
echo 🚀 开始构建和部署流程...

REM 配置变量（请根据实际情况修改）
set IMAGE_NAME=hospital-schedule-system
set IMAGE_TAG=latest
set REGISTRY=

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker 未安装，请先安装 Docker
    exit /b 1
)

echo 📦 步骤 1: 构建 Docker 镜像...
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 镜像构建失败
    exit /b 1
)

echo ✅ 镜像构建成功

REM 如果提供了镜像仓库地址，则推送镜像
if not "%REGISTRY%"=="" (
    echo 📤 步骤 2: 推送镜像到仓库...
    set FULL_IMAGE_NAME=%REGISTRY%/%IMAGE_NAME%:%IMAGE_TAG%
    docker tag %IMAGE_NAME%:%IMAGE_TAG% %FULL_IMAGE_NAME%
    docker push %FULL_IMAGE_NAME%
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 镜像推送失败
        exit /b 1
    )
    
    echo ✅ 镜像推送成功: %FULL_IMAGE_NAME%
    echo.
    echo 📝 请在 Sealos 应用管理中使用以下镜像地址：
    echo    %FULL_IMAGE_NAME%
) else (
    echo ⚠️  未配置镜像仓库地址，跳过推送步骤
    echo.
    echo 📝 本地镜像已构建完成：%IMAGE_NAME%:%IMAGE_TAG%
    echo    如需推送到仓库，请修改脚本中的 REGISTRY 变量
)

echo.
echo 🎉 构建完成！
echo.
echo 📖 下一步：
echo    1. 登录 Sealos 平台
echo    2. 进入应用管理，创建新应用
echo    3. 使用上述镜像地址部署应用
echo    4. 开启公网访问，获取访问链接
echo.
echo    详细步骤请参考：Sealos部署指南.md

pause

