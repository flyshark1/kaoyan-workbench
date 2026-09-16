@echo off
chcp 65001 >nul
setlocal

set "GH=C:\Program Files\GitHub CLI\gh.exe"
set "APPDIR=%~dp0"
set "MAIN=%USERPROFILE%\Desktop\28考研工作台.html"

echo ========================================
echo   28考研工作台 · 更新线上版本
echo ========================================
echo.

if not exist "%MAIN%" (
  echo [错误] 找不到主文件：%MAIN%
  echo 请确认桌面上的「28考研工作台.html」还在。
  pause
  exit /b 1
)

cd /d "%APPDIR%"

echo [1/4] 同步主文件到 index.html ...
copy /Y "%MAIN%" ".\index.html" >nul
if errorlevel 1 (
  echo [错误] 复制失败。
  pause
  exit /b 1
)

echo [2/4] 检查改了什么 ...
git add -A
git status --short

git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo 没有检测到任何改动，无需更新。
  pause
  exit /b 0
)
echo.

echo [3/4] 提交 ...
set "MSG=更新工作台内容 %DATE% %TIME%"
git commit -m "%MSG%" >nul
if errorlevel 1 (
  echo [错误] 提交失败。请把上面的信息截图发我。
  pause
  exit /b 1
)

echo [4/4] 推送到 GitHub ...
git push
if errorlevel 1 (
  echo.
  echo [错误] 推送失败。常见原因：
  echo   - 登录过期：运行 "%GH%" auth login 重新登录
  echo   - 网络不通：检查能否访问 github.com
  pause
  exit /b 1
)

echo.
echo ========================================
echo   完成！约 1-2 分钟后刷新线上地址：
echo   https://flyshark1.github.io/kaoyan-workbench/
echo ========================================
echo.
pause
