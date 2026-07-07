@echo off
cd /d "%~dp0"

git add .

set /p msg=Commit message :

if "%msg%"=="" set msg=Update

git commit -m "%msg%"

git push

pause