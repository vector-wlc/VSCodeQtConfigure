@echo off
title qmake and nmake build prompt
set VCINSTALLDIR=E:\Qt\Tools\mingw810_32
set QTDIR=E:\Qt\5.15.0\mingw81_32
set BUILD_DIR=%cd%\build
set PRO_DIR=%cd%
set PATH=%VCINSTALLDIR%\bin;%QTDIR%\bin;%PATH%


cd build
qmake.exe %PRO_DIR%\VSCode_MinGW.pro -spec win32-g++ "CONFIG+=debug" "CONFIG+=console"
@REM E:\Qt\Tools\QtCreator\bin\jom.exe Debug
%VCINSTALLDIR%\bin\mingw32-make -f Makefile.Debug

cd debug
if not exist %BUILD_DIR%\debug\Qt5Cored.dll (
    windeployqt VSCode_MinGW.exe
)