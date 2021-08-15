@echo off

set QT_DIR=__QT_KIT_DIR__
set SRC_DIR=%cd%
set BUILD_DIR=%cd%\build

if not exist %QT_DIR% exit
if not exist %SRC_DIR% exit
if not exist %BUILD_DIR% md %BUILD_DIR%

cd /d %BUILD_DIR%

call "C:\Program Files (x86)\Microsoft Visual Studio\__VS_VERSION__\Community\VC\Auxiliary\Build\vcvarsall.bat" __EXEC_BITS__

%QT_DIR%\bin\qmake.exe %SRC_DIR%\__PROJECT_NAME__.pro -spec win32-msvc  __QMAKE_MODE__
if exist %BUILD_DIR%\__BUILD_MODE__\__PROJECT_NAME__.exe del %BUILD_DIR%\__BUILD_MODE__\__PROJECT_NAME__.exe
nmake __MAKEFILE_MODE__
if not exist %BUILD_DIR%\__BUILD_MODE__\Qt5Cored.dll (
  %QT_DIR%\bin\windeployqt.exe %BUILD_DIR%\__BUILD_MODE__\__PROJECT_NAME__.exe
)
