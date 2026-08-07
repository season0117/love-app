@echo off
echo ====================================
echo   恋爱记 - 启动服务器
echo ====================================
echo.
echo [1/2] 启动后端服务器...
start "LoveApp-Backend" /B node backend\server.js
timeout /t 2 /nobreak >nul
echo [2/2] 创建公网隧道...
echo.
echo 公网地址: http://loveapp.serveo.net
echo 把这个链接发给你的对象！
echo.
echo 保持此窗口打开，关闭窗口 = App下线
echo ====================================
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R loveapp.serveo.net:80:localhost:3456 serveo.net
pause
