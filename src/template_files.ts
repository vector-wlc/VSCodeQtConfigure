// *************************
// .vscode/.json
// *************************
// ======================================
export const MINGW_LAUNCH_JSON = "{\n\
    \"version\": \"0.2.0\",\n\
    \"configurations\": [\n\
        {\n\
            \"name\": \"debug\",\n\
            \"type\": \"cppdbg\",\n\
            \"request\": \"launch\",\n\
            \"program\": \"${workspaceRoot}/build/debug/${workspaceRootFolderName}.exe\",\n\
            \"args\": [],\n\
            \"stopAtEntry\": false,\n\
            \"cwd\": \"${workspaceRoot}\",\n\
            \"environment\": [],\n\
            \"externalConsole\": false,\n\
            \"MIMode\": \"gdb\",\n\
            \"miDebuggerPath\": \"__DEBUGGER_PATH__\",\n\
            \"setupCommands\": [\n\
                {\n\
                    \"description\": \"Enable pretty-printing for gdb\",\n\
                    \"text\": \"-enable-pretty-printing\",\n\
                    \"ignoreFailures\": true\n\
                }\n\
            ],\n\
            \"preLaunchTask\": \"debug\"\n\
        }\n\
    ]\n\
}"

export const TASK_JSON = "{\n\
    \"version\": \"2.0.0\",\n\
    \"tasks\": [\n\
        {\n\
            \"label\": \"debug\",\n\
            \"type\": \"shell\",\n\
            \"command\": \"cmd\",\n\
            \"args\": [\n\
                \"/c\",\n\
                \"${workspaceRoot}/scripts/build_debug.bat\",\n\
                \"debug\"\n\
            ],\n\
            \"group\": {\n\
                \"kind\": \"build\",\n\
                \"isDefault\": true\n\
            }\n\
        },\n\
        {\n\
            \"label\": \"release\",\n\
            \"type\": \"shell\",\n\
            \"command\": \"cmd\",\n\
            \"args\": [\n\
                \"/c\",\n\
                \"${workspaceRoot}/scripts/build_release.bat\",\n\
                \"release\"\n\
            ],\n\
            \"group\": {\n\
                \"kind\": \"build\",\n\
                \"isDefault\": true\n\
            }\n\
        }\n\
    ]\n\
}"


export const C_CPP_JSON = "{\n\
    \"configurations\": [\n\
        {\n\
            \"name\": \"windows\",\n\
            \"includePath\": [\n\
                \"__QT_KIT_INCLUDE__\",\n\
                \"${workspaceRoot}/**\"\n\
            ],\n\
            \"cStandard\": \"c11\",\n\
            \"cppStandard\": \"c++17\"\n\
        }\n\
    ],\n\
    \"version\": 4\n\
}"

export const MSVC_LAUNCH_JSON = "{\n\
    \"version\": \"0.2.0\",\n\
    \"configurations\": [\n\
        {\n\
            \"name\": \"Launch\",\n\
            \"type\": \"cppvsdbg\",\n\
            \"request\": \"launch\",\n\
            \"program\": \"${workspaceRoot}/build/debug/${workspaceRootFolderName}.exe\",\n\
            \"args\": [],\n\
            \"stopAtEntry\": false,\n\
            \"cwd\": \"${workspaceRoot}\",\n\
            \"environment\": [],\n\
            \"console\": \"integratedTerminal\",\n\
            \"preLaunchTask\": \"debug\"\n\
        }\n\
    ]\n\
}"


export const MSVC_SETTINGS_JSON = "{\n\
    \"[cpp]\": {\n\
        \"files.encoding\": \"gbk\"\n\
    },\n\
    \"[.h]\": {\n\
        \"files.encoding\": \"gbk\"\n\
    }\n\
}"

// ======================================



// *************************
// scripts/.bat
// *************************
// ======================================

export const MSVC_BAT = "@echo off\n\
\n\
set QT_DIR=__QT_KIT_DIR__\n\
set SRC_DIR=%cd%\n\
set BUILD_DIR=%cd%\\build\n\
\n\
if not exist %QT_DIR% exit\n\
if not exist %SRC_DIR% exit\n\
if not exist %BUILD_DIR% md %BUILD_DIR%\n\
\n\
cd /d %BUILD_DIR%\n\
\n\
call \"__VCVARSALL_PATH__\" __EXEC_BITS__\n\
\n\
%QT_DIR%\\bin\\qmake.exe %SRC_DIR%\\__PROJECT_NAME__.pro -spec win32-msvc  __QMAKE_MODE__\n\
if exist %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe del %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe\n\
nmake __MAKEFILE_MODE__\n\
if not exist %BUILD_DIR%\\__BUILD_MODE__\\Qt5Cored.dll (\n\
  %QT_DIR%\\bin\\windeployqt.exe %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe\n\
)"

export const MINGW_BAT = "@echo off\n\
title qmake and nmake build prompt\n\
set MINGW_PATH=__MINGW_PATH__\n\
set QT_DIR=__QT_KIT_DIR__\n\
set BUILD_DIR=%cd%\\build\n\
set PRO_DIR=%cd%\n\
set PATH=%MINGW_PATH%\\bin;%QT_DIR%\\bin;%PATH%\n\
\n\
\n\
if not exist %BUILD_DIR% (\n\
    md %BUILD_DIR%\n\
)\n\
\n\
cd build\n\
qmake.exe %PRO_DIR%\\__PROJECT_NAME__.pro -spec win32-g++ __QMAKE_MODE__\n\
if exist %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe del %BUILD_DIR%\\__BUILD_MODE__\\__PROJECT_NAME__.exe\n\
@REM __JOM_PATH__ -j4\n\
%MINGW_PATH%\\bin\\mingw32-make -f Makefile.__MAKEFILE_MODE__\n\
cd __BUILD_MODE__\n\
if not exist %BUILD_DIR%\\__BUILD_MODE__\\Qt5Core.dll (\n\
    windeployqt __PROJECT_NAME__.exe\n\
)"


// *************************
// src/.h .cpp
// *************************
// ======================================
export const MAIN_CPP = "#include \"__PROJECT_NAME__.h\"\n\
\n\
#include <QApplication>\n\
#pragma comment(lib, \"user32.lib\")\n\
\n\
int main(int argc, char *argv[])\n\
{\n\
    QApplication a(argc, argv);\n\
    __PROJECT_NAME__ w;\n\
    w.show();\n\
    return a.exec();\n\
}"


export const PROEJCT_CPP = "#include \"__PROJECT_NAME__.h\"\n\
\n\
__PROJECT_NAME__::__PROJECT_NAME__(QWidget* parent)\n\
    : QMainWindow(parent)\n\
{\n\
}\n\
\n\
__PROJECT_NAME__::~__PROJECT_NAME__()\n\
{\n\
}"


export const PROEJCT_H = "#pragma once\n\
#include <QMainWindow>\n\
// #pragma execution_character_set(\"utf-8\") \n\
\n\
class __PROJECT_NAME__ : public QMainWindow {\n\
    Q_OBJECT\n\
\n\
public:\n\
__PROJECT_NAME__(QWidget* parent = nullptr);\n\
    ~__PROJECT_NAME__();\n\
};"

export const QT_PRO = "QT += core gui widgets\n\
\n\
CONFIG += c++17\n\
\n\
# You can make your code fail to compile if it uses deprecated APIs.\n\
# In order to do so, uncomment the following line.\n\
#DEFINES += QT_DISABLE_DEPRECATED_BEFORE=0x060000    # disables all the APIs deprecated before Qt 6.0.0\n\
\n\
SOURCES += \\\n\
    $$files($$PWD/src/*.cpp)\n\
\n\
HEADERS += \\\n\
    $$files($$PWD/src/*.h)\n\
\n\
# Default rules for deployment.\n\
qnx: target.path = /tmp/$${TARGET}/bin\n\
else: unix:!android: target.path = /opt/$${TARGET}/bin\n\
!isEmpty(target.path): INSTALLS += target"