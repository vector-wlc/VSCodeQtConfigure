@echo off
title qmake and nmake build prompt
set VCINSTALLDIR=D:\Software\Qt\Tools\mingw810_32
set QTDIR=D:\Software\Qt\5.15.0\mingw81_32
set BUILD_DIR=%cd%\build
set PRO_DIR=%cd%
set PATH=%VCINSTALLDIR%\bin;%QTDIR%\bin;%PATH%

if not exist %BUILD_DIR% (
    md %BUILD_DIR%
)
cd build
qmake.exe %PRO_DIR%\VSCodeQtConfigurator.pro -spec win32-g++ "CONFIG+=debug" "CONFIG+=console"
if exist %BUILD_DIR%\debug\VSCodeQtConfigurator.exe del %BUILD_DIR%\debug\VSCodeQtConfigurator.exe
@REM E:\Qt\Tools\QtCreator\bin\jom.exe Debug
%VCINSTALLDIR%\bin\mingw32-make -f Makefile.Debug
cd debug
if not exist %BUILD_DIR%\debug\Qt5Cored.dll (
    windeployqt VSCodeQtConfigurator.exe
)