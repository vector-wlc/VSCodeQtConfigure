@echo off
title qmake and nmake build prompt
set VCINSTALLDIR=__MINGW_PATH__
set QTDIR=__QT_KIT_DIR__
set BUILD_DIR=%cd%\build
set PRO_DIR=%cd%
set PATH=%VCINSTALLDIR%\bin;%QTDIR%\bin;%PATH%


if not exist %BUILD_DIR% (
    md %BUILD_DIR%
)

cd build
qmake.exe %PRO_DIR%\__PROJECT_NAME__.pro -spec win32-g++ __QMAKE_MODE__
if exist %BUILD_DIR%\__BUILD_MODE__\__PROJECT_NAME__.exe del %BUILD_DIR%\__BUILD_MODE__\__PROJECT_NAME__.exe
@REM __JOM_PATH__ -j4
%VCINSTALLDIR%\bin\mingw32-make -f Makefile.__MAKEFILE_MODE__
cd __BUILD_MODE__
if not exist %BUILD_DIR%\__BUILD_MODE__\Qt5Cored.dll (
    windeployqt __PROJECT_NAME__.exe
)