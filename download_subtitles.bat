@echo off
chcp 65001 >nul
title Mnet Plus Subtitle Downloader

set "PS1=%~dp0download_subtitles.ps1"

if not exist "%PS1%" (
    echo ==========================================
    echo ERROR: download_subtitles.ps1 was not found.
    echo Please download the latest ZIP from GitHub and keep
    echo download_subtitles.bat and download_subtitles.ps1
    echo in the same folder.
    echo ==========================================
    pause
    exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PS1%"
set EXITCODE=%ERRORLEVEL%

if not "%EXITCODE%"=="0" (
    echo.
    echo The PowerShell downloader exited with code %EXITCODE%.
    pause
)

exit /b %EXITCODE%
