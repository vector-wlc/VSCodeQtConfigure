/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2021-08-17 10:32:54
 * @Description:
 */

import * as vscode from 'vscode';
import * as fs from "fs";
import * as template_files from "./template_files";


export class QtConfigurator {
    private qtDir: string;
    private isMsvc: boolean;
    private projectDir: string;
    private projectName: string;
    private qtKitDirList: string[];
    private qtSelectedKitDir: string;
    private qtSelectedKitName: string;
    private debuggerName: string;
    private vcvarsallPath: string;

    constructor() {
        this.qtDir = "";
        this.isMsvc = true;
        this.projectDir = "";
        this.projectName = "";
        this.qtKitDirList = [];
        this.qtSelectedKitDir = "";
        this.qtSelectedKitName = "";
        this.debuggerName = "";
        this.vcvarsallPath = "C:\\Program Files (x86)\\Microsoft Visual Studio\\__VS_VERSION__\\Community\\VC\\Auxiliary\\Build\\vcvarsall.bat";
    }

    public setProjectName(projectName: string): void {
        this.projectName = projectName;
    }


    public setProjectDir(projectDir: string): void {
        this.projectDir = projectDir;
    }


    public setQtDir(qtDir: string): void {
        // 寻找 Qt 套件
        this.qtKitDirList = [];
        let one_dirs = fs.readdirSync(qtDir);
        for (let one_dir of one_dirs) {
            if (one_dir[0] >= '0' && one_dir[0] <= '9') {
                let two_dirs = fs.readdirSync(qtDir + "\\" + one_dir);
                for (let two_dir of two_dirs) {
                    if (two_dir.search("mingw") !== -1 || two_dir.search("msvc") !== -1) {
                        this.qtKitDirList.push(qtDir + "\\" + one_dir + "\\" + two_dir);
                    }
                }
            }
        }

        if (this.qtKitDirList.length !== 0) {
            this.qtDir = qtDir;
        }

    }

    public getQtKitDirList(): string[] {
        return this.qtKitDirList;
    }

    public setQtKitDir(qtKitDir: string) {
        this.qtSelectedKitDir = qtKitDir;
        this.qtSelectedKitName = qtKitDir.split("\\").pop()?.toString()!;
    }

    public isGetQtDir(): boolean {
        return this.qtDir !== "";
    }

    private mkDir(dirName: string): boolean {
        if (fs.existsSync(dirName)) {
            return true;
        }
        fs.mkdirSync(dirName);
        return fs.existsSync(dirName);
    }

    private writeFile(fileName: string, content: string): void {

        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
        fs.writeFile(fileName, content, "utf-8", (err) => {
            if (err) {
                vscode.window.showErrorMessage("配置文件 " + fileName + " 失败");
            }
        });
    }

    public createQtConfigureFiles() {
        this.projectDir = vscode.workspace.workspaceFolders![0].uri.fsPath;

        this.mkDir(this.projectDir + "\\.vscode");
        this.mkDir(this.projectDir + "\\scripts");
        this.mkDir(this.projectDir + "\\src");

        this.isMsvc = this.qtSelectedKitDir.search("msvc") !== -1;
        this.createVSCodeJsonFiles();
        this.createBatFiles();
        this.createSrcAndPro();

    }

    private strReplaceAll(str: string, subStr: string, newSubStr: string): string {
        return str.split(subStr).join(newSubStr);
    }

    private createVSCodeJsonFiles() {
        // c_cpp_properties
        let content = template_files.C_CPP_JSON;
        content = this.strReplaceAll(content, "__QT_KIT_INCLUDE__", this.qtSelectedKitDir + "/include/**");
        content = this.strReplaceAll(content, "\\", "/");

        this.writeFile(this.projectDir + "\\.vscode\\c_cpp_properties.json", content);

        // launch.json
        if (this.isMsvc) {
            this.writeFile(this.projectDir + "\\.vscode\\launch.json", template_files.MSVC_LAUNCH_JSON);
        } else {
            content = template_files.MINGW_LAUNCH_JSON;
            this.debuggerName = this.strReplaceAll(this.qtSelectedKitName, "_", "0_");
            let debugger_path = this.qtDir + "\\Tools\\" + this.debuggerName + "\\bin\\gdb.exe";
            content = this.strReplaceAll(content, "__DEBUGGER_PATH__", debugger_path);
            content = this.strReplaceAll(content, "\\", "/");
            this.writeFile(this.projectDir + "\\.vscode\\launch.json", content);
        }

        // tasks
        this.writeFile(this.projectDir + "\\.vscode\\tasks.json", template_files.TASK_JSON);

        // settings
        if (this.isMsvc) {
            this.writeFile(this.projectDir + "\\.vscode\\settings.json", template_files.MSVC_SETTINGS_JSON);
        }

    }

    private createBatFiles() {
        let content = this.isMsvc ? template_files.MSVC_BAT : template_files.MINGW_BAT;
        content = this.strReplaceAll(content, "__QT_KIT_DIR__", this.qtSelectedKitDir);
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);

        if (this.isMsvc) {
            let _vcvarsallPath = vscode.workspace.getConfiguration().get('qtConfigure.vcvarsallPath');
            if (_vcvarsallPath) {
                this.vcvarsallPath = <string>_vcvarsallPath;
            }
            let is_x64 = this.qtSelectedKitName.search("_64") !== -1;
            if (this.vcvarsallPath.search("__VS_VERSION__") != -1) {
                let vs_version = this.strReplaceAll(this.qtSelectedKitName, "msvc", "");
                vs_version = this.strReplaceAll(vs_version, "_64", "");
                this.vcvarsallPath = this.strReplaceAll(this.vcvarsallPath, "__VS_VERSION__", vs_version)
                vscode.workspace.getConfiguration().update('qtConfigure.vcvarsallPath', this.vcvarsallPath, true);
            }
            content = this.strReplaceAll(content, "__VCVARSALL_PATH__", this.vcvarsallPath);
            content = this.strReplaceAll(content, "__EXEC_BITS__", is_x64 ? "x64" : "x86");
        } else { // MinGW
            let MingwPath = this.qtDir + "\\Tools\\" + this.debuggerName;
            let jomPath = this.qtDir + "\\Tools\\QtCreator\\bin\\jom.exe";

            content = this.strReplaceAll(content, "__MINGW_PATH__", MingwPath);
            content = this.strReplaceAll(content, "__JOM_PATH__", jomPath);
        }

        // debug
        let buildDebugStr = content;
        buildDebugStr = this.strReplaceAll(buildDebugStr, "__QMAKE_MODE__", "\"CONFIG+=debug\" \"CONFIG+=console\"");
        buildDebugStr = this.strReplaceAll(buildDebugStr, "__BUILD_MODE__", "debug");
        buildDebugStr = this.strReplaceAll(buildDebugStr, "__MAKEFILE_MODE__", "Debug");
        this.writeFile(this.projectDir + "\\scripts\\build_debug.bat", buildDebugStr);

        // release
        let buildReleaseStr = content;
        buildReleaseStr = this.strReplaceAll(buildReleaseStr, "__QMAKE_MODE__", "\"CONFIG+=release\"");
        buildReleaseStr = this.strReplaceAll(buildReleaseStr, "__BUILD_MODE__", "release");
        buildReleaseStr = this.strReplaceAll(buildReleaseStr, "__MAKEFILE_MODE__", "Release");
        if (this.isMsvc) {
            buildReleaseStr = this.strReplaceAll(buildReleaseStr, "Qt5Cored.dll", "Qt5Core.dll");
        }
        this.writeFile(this.projectDir + "\\scripts\\build_release.bat", buildReleaseStr);
    }


    private createSrcAndPro() {
        let content = template_files.MAIN_CPP;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        this.writeFile(this.projectDir + "\\src\\main.cpp", content);

        content = template_files.PROEJCT_CPP;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        this.writeFile(this.projectDir + "\\src\\" + this.projectName + ".cpp", content);

        content = template_files.PROEJCT_H;
        content = this.strReplaceAll(content, "__PROJECT_NAME__", this.projectName);
        this.writeFile(this.projectDir + "\\src\\" + this.projectName + ".h", content);

        this.writeFile(this.projectDir + "\\" + this.projectName + ".pro", template_files.QT_PRO);
    }
}