<!--
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2021-08-17 22:07:29
 * @Description: 
-->
# QtConfigurator README

<strong>这不是 Qt 官方工具！！！x3</strong>

在 VSCode 中生成 Qt 项目配置文件，可独立运行调试 Qt 项目

## Features

* Command: "QtConfigure : New Project" 生成 Qt 项目配置文件

* Command: "QtConfigure : Set Qt Dir" 选择 Qt 安装目录，注意是安装目录，而不是 Qt 套件目录，
该扩展会根据 Qt 安装路径搜索相应的 Qt 套件以及编译器

* Build Debug:
在编译运行 Debug 时，请将`./.vscode/launch.json` 中的有关内容修改如下:`"program": "${workspaceRoot}/build/debug/${workspaceRootFolderName}.exe"    "preLaunchTask": "debug"`

* Build Release:
在编译运行 Release 时，请将`./.vscode/launch.json` 中的有关内容修改如下 :`"program": "${workspaceRoot}/build/release/${workspaceRootFolderName}.exe"    "preLaunchTask": "release"`

## Requirements

* 需要安装 Qt

## Extension Settings

* `qtConfigure.qtDir` :  设置 Qt 安装路径
* `qtConfigure.vcvarsallPath` : 设置 Visual Studio vcvarsall.bat (环境变量配置工具) 路径
