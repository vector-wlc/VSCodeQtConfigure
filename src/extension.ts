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

let qtConfigurator = new QtConfigurator();



// 检查当前路径下是否为空路径
function isCanCreateProject(): boolean {
	let workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders === undefined) {
		vscode.window.showErrorMessage("请使用 VSCode 打开一个空文件夹以创建项目");
		return false;
	}
	for (let entry of workspaceFolders) {
		let dirs = fs.readdirSync(entry.uri.fsPath)
		if (dirs.length !== 0) {
			vscode.window.showWarningMessage("推荐使用一个空路径以配置项目");
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
		openLabel: '打开 Qt 安装目录，注意不是套件目录，而是安装目录'
	};

	vscode.window.showOpenDialog(options).then(dir => {
		if (dir && dir[0]) {
			qtConfigurator.setQtDir(dir[0].fsPath);
			if (!qtConfigurator.isGetQtDir()) {
				vscode.window.showErrorMessage("您设置的 Qt 安装路径不正确，请重新执行 QtConfigure : Set Qt Dir 命令设置 Qt 安装路径");
			} else {
				let qtKitDirList = qtConfigurator.getQtKitDirList();
				if (qtKitDirList.length !== 0) {
					let str = "找到以下 Qt 套件 : \n ";
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

function selectQtKit() {

	const options: vscode.QuickPickOptions = {
		title: "请选择 Qt 套件"
	};
	vscode.window.showQuickPick(qtConfigurator.getQtKitDirList(), options).then(qt_kit_name => {
		if (qt_kit_name && qt_kit_name.length != 0) {
			qtConfigurator.setQtKitDir(qt_kit_name.toString());
			qtConfigurator.createQtConfigureFiles();
		}
	});
}

function getQtProjectName() {
	let inputBox = vscode.window.createInputBox();
	inputBox.show();
	inputBox.title = "请输入项目名称";
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

		const result = vscode.workspace.getConfiguration().get('qtConfigure.qtDir');
		if (result) {
			qtConfigurator.setQtDir(<string>result);
		}
		if (!qtConfigurator.isGetQtDir()) {
			vscode.window.showErrorMessage("您尚未选择设置 Qt 安装路径，请运行 QtConfigure : Set Qt Dir 命令设置 Qt 安装路径");
			return;
		}
		getQtProjectName();

	});

	let setQtDir = vscode.commands.registerCommand('qtConfigure.setQtDir', () => {
		getQtDir();
	});

	context.subscriptions.push(newQtProject);
	context.subscriptions.push(setQtDir);
}


// this method is called when your extension is deactivated
export function deactivate() { }
