@echo off
chcp 65001 >nul
echo ========================================
echo 网络问题快速解决方案
echo ========================================
echo.
echo 根据ping结果，您的设备可能不在同一局域网段
echo.
echo 解决方案：
echo.
echo [方案1] 尝试使用其他IP地址访问
echo   请在浏览器中尝试：
echo   http://26.26.132.80:5173/
echo   http://172.28.18.247:5173/
echo   http://61.139.2.1:5173/
echo.
echo [方案2] 使用ngrok（推荐）
echo   1. 安装: npm install -g ngrok
echo   2. 注册账号: https://ngrok.com/
echo   3. 配置: ngrok config add-authtoken YOUR_TOKEN
echo   4. 启动: ngrok http 5173
echo   5. 使用生成的URL访问
echo.
echo [方案3] 检查VPN连接
echo   如果开发机器连接了VPN，请：
echo   1. 断开VPN
echo   2. 让其他终端也连接VPN
echo   3. 或使用VPN网络内的IP地址
echo.
echo ========================================
pause

