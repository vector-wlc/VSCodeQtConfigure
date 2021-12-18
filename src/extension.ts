/*
 * @Coding: utf-8
 * @Author: vector-wlc
 * @Date: 2021-08-16 23:22:55
 * @Description: 
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QtConfigurator } from './qt_configurator';
import * as fs from "fs";
import * as os from "os";


let qtConfigurator = new QtConfigurator();

// 1. 检查当前操作系统是否是 win32 或者 linux
// 2. 检查当前路径下是否为空路径
function isCanCreateProject(): boolean {
	let platform = os.platform().toString();
	if (platform !== "win32" && platform !== "linux") {
		vscode.window.showWarningMessage("目前尚不支持的操作系统");
		return true;
	}
	let workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders === undefined) {
		vscode.window.showErrorMessage("请使用 VSCode 打开一个空文件夹以创建项目 (Please use vscode to open an empty folder to create the project)");
		return false;
	}
	for (let entry of workspaceFolders) {
		let dirs = fs.readdirSync(entry.uri.fsPath)
		if (dirs.length !== 0) {
			vscode.window.showWarningMessage("推荐使用一个空路径以配置项目 (It is recommended to use an empty path to configure the project)");
			return true;
		}
	}

	return true;
}

function getQtDir() {
	const options: vscode.OpenDialogOptions = {
		canSelectFolders: true,
		canSelectFiles: false,
		canSelectMany: false,
		openLabel: '打开 Qt 安装目录 (Open the Qt installation directory)'
	};

	vscode.window.showOpenDialog(options).then(dir => {
		if (dir && dir[0]) {
			qtConfigurator.setQtDir(dir[0].fsPath);
			if (!qtConfigurator.isGetQtDir()) {
				vscode.window.showErrorMessage("您设置的 Qt 安装路径不正确，请重新执行 QtConfigure : Set Qt Dir 命令设置 Qt 安装路径\
				(The Qt installation path you set is incorrect. Please re execute QtConfigure : Set Qt Dir command to set the Qt installation path)");
			} else {
				let qtKitDirList = qtConfigurator.getQtKitDirList();
				if (qtKitDirList.length !== 0) {
					let str = "找到以下 Qt 套件 (Find the following Qt kits): \n ";
					for (let qtKitDir of qtKitDirList) {
						str += qtKitDir + "\n";
					}
					vscode.window.showInformationMessage(str);
				}
			}
			vscode.workspace.getConfiguration().update('qtConfigure.qtDir', dir[0].fsPath, true);
		}
	});
}

function selectQtUi() {
	const options: vscode.QuickPickOptions = {
		title: "请选择是否带有 UI 文件 (Please select whether there is UI file)"
	};
	vscode.window.showQuickPick(["yes", "no"], options).then(result => {
		if (result && result.length != 0) {
			qtConfigurator.setQtUi(result === "yes");
			qtConfigurator.createQtConfigureFiles();
		}
	});
}

function selectQtKit() {
	const options: vscode.QuickPickOptions = {
		title: "请选择 Qt 套件 (Please select Qt Kit)"
	};
	vscode.window.showQuickPick(qtConfigurator.getQtKitDirList(), options).then(qtKitName => {
		if (qtKitName && qtKitName.length != 0) {
			qtConfigurator.setQtKitDir(qtKitName.toString());
			selectBuildTools();
		}
	});
}

function selectBuildTools() {
	const options: vscode.QuickPickOptions = {
		title: "请选择构建工具 (Please select a build tool )"
	};
	vscode.window.showQuickPick(["CMake", "QMake"], options).then(buildTools => {
		if (buildTools && buildTools.length != 0) {
			qtConfigurator.setBuildTools(buildTools.toString());
			selectQtUi();
		}
	});
}

function getQtProjectName() {
	let inputBox = vscode.window.createInputBox();
	inputBox.show();
	inputBox.title = "请输入项目名称 (Please enter project name)";
	let value: string;
	inputBox.onDidAccept((e) => {
		value = inputBox.value;
		qtConfigurator.setProjectName(inputBox.value)
		inputBox.hide();
		selectQtKit();
	});
}

export function activate(context: vscode.ExtensionContext) {
	let newQtProject = vscode.commands.registerCommand('qtConfigure.newQtProject', () => {
		if (!isCanCreateProject()) {
			return;
		}
		if (!qtConfigurator.isGetQtDir()) {
			const result = vscode.workspace.getConfiguration().get('qtConfigure.qtDir');
			if (result) {
				qtConfigurator.setQtDir(<string>result);
			}
			if (!qtConfigurator.isGetQtDir()) {
				vscode.window.showErrorMessage("您尚未选择设置 Qt 安装路径，请运行 QtConfigure : Set Qt Dir 命令设置 Qt 安装路径\
				 (You have not selected to set Qt installation path. Please run 'QtConfigure : Set Qt Dir command' to set QT installation path)");
				return;
			}
		}
		getQtProjectName();

	});

	let setQtDir = vscode.commands.registerCommand('qtConfigure.setQtDir', () => {
		getQtDir();
	});

	let openQtDesigner = vscode.commands.registerCommand('qtConfigure.openQtDesigner', () => {
		qtConfigurator.openDesigner();
	});

	let openQtAssistant = vscode.commands.registerCommand('qtConfigure.openQtAssistant', () => {
		qtConfigurator.openAssistant();
	});

	let closeTerminal = vscode.window.onDidCloseTerminal(t => {
		if (t.name == "qtTerminal") {
			qtConfigurator.closeTerminal();
		}
	});

	context.subscriptions.push(newQtProject);
	context.subscriptions.push(setQtDir);
	context.subscriptions.push(closeTerminal);
	context.subscriptions.push(openQtDesigner);
	context.subscriptions.push(openQtAssistant);
}


// this method is called when your extension is deactivated
export function deactivate() { }
