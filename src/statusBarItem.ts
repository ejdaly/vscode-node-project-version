const vscode = require('vscode');
const spawn = require('child_process').spawnSync;

export class StatusBarItem {
		_statusBarItem1: any;
		_statusBarItem2: any;
		_interval: any;

    constructor() {
			this._statusBarItem1 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 999999999);
			this._statusBarItem2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 999999999);
			this._interval = setInterval(() => this.refreshUI(), 10 * 1000);
		
			this.refreshUI();

			vscode.commands.registerCommand('extension.open_package_json', () => {
				const dir = this.getWorkspaceDir();
				if(!dir) return;
				vscode.workspace.openTextDocument(`${dir}/package.json`).then((doc: any) => {
					vscode.window.showTextDocument(doc);
				});
			});

			vscode.commands.registerCommand('extension.open_azure_devops_build', () => {
				const config = vscode.workspace.getConfiguration("node-project-version");
				if(!config) return;
				const build_uri = config.get("build-uri");
				if(!build_uri) return;
				const dir = this.getWorkspaceDir();
				let tags = spawn('git', [ "describe", "--tags" ], { cwd: dir }).output[1];
				tags = tags.toString("utf8");
				let build = (tags.split("+")[1]).trim();
				vscode.env.openExternal(vscode.Uri.parse(`${build_uri}?buildId=${build}&view=ms.vss-releaseManagement-web.deployments-tab`));
			});
			
			this._statusBarItem1.command = 'extension.open_package_json';
			this._statusBarItem1.color = "#fce566";
			
			this._statusBarItem2.command = 'extension.open_azure_devops_build';
			this._statusBarItem2.color = "#3394d6";

			this._statusBarItem1.show();
			this._statusBarItem2.show();
	}
	
	dispose() {
		this._statusBarItem1.dispose();
		this._statusBarItem2.dispose();
		clearInterval(this._interval);
	}
	
	refreshUI() {
		const dir = this.getWorkspaceDir();
		if(!dir) {
			this._statusBarItem1.text = "";
			this._statusBarItem2.text = "";
			return;
		}

		const version = spawn('node', ['-p', `require('./package.json').version`], {cwd: dir}).output[1];
		const name = spawn('node', ['-p', `require('./package.json').name`], {cwd: dir}).output[1];
		this._statusBarItem1.text = `${name}-${version}`.replace(/\n/g, '');

		let tags = spawn('git', [ "describe", "--tags" ], { cwd: dir }).output[1];
		tags = tags.toString("utf8") || "";
		this._statusBarItem2.text = tags.replace(/\n/g, '');
	}

	getWorkspaceDir() {
		const workspaceRoot = vscode.workspace.workspaceFolders[0];
		if(!workspaceRoot) return;
		return workspaceRoot.uri.path;
	}
}
