@echo off
chcp 65001 >nul
title Mnet Plus Subtitle Downloader

echo ==========================================
echo      Mnet Plus Subtitle Downloader
echo ==========================================
echo.
echo This tool will download:
echo   - Korean subtitles (ko)
echo   - English subtitles (en)
echo   - Simplified Chinese subtitles (zh_CN)
echo.
echo Output folder: subtitles
echo.

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python was not found.
    echo Please install Python 3.10 or newer from:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

set /p VIDEO_URL=Paste Mnet Plus video URL here: 

if "%VIDEO_URL%"=="" (
    echo.
    echo [ERROR] No URL entered.
    pause
    exit /b 1
)

echo.
echo Downloading subtitles...
echo.

python "%~dp0mnetplus_subs.py" "%VIDEO_URL%" --langs ko,en,zh_CN --out-dir "%~dp0subtitles"
set EXITCODE=%ERRORLEVEL%

echo.
if not "%EXITCODE%"=="0" (
    echo ==========================================
    echo Download failed. Error details are shown above.
    echo Please take a screenshot of the full window if you need help.
    echo ==========================================
    pause
    exit /b %EXITCODE%
)

echo ==========================================
echo Done!
echo Subtitles saved to:
echo %~dp0subtitles
echo ==========================================
echo.

explorer "%~dp0subtitles"
pause
