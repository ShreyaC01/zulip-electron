'use strict';
const os = require('os');
const electron = require('electron');
const {dialog} = require('electron');

const ConfigUtil = require(__dirname + '/../renderer/js/utils/config-util.js');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;
const appName = app.getName();

class AppMenu {
	getHistorySubmenu() {
		return [{
			label: 'Back',
			accelerator: process.platform === 'darwin' ? 'Command+Left' : 'Alt+Left',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('back');
				}
			}
		}, {
			label: 'Forward',
			accelerator: process.platform === 'darwin' ? 'Command+Right' : 'Alt+Right',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('forward');
				}
			}
		}];
	}

	getViewSubmenu() {
		return [{
			label: 'Reload',
			accelerator: 'CommandOrControl+R',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('reload-viewer');
				}
			}
		}, {
			label: 'Hard Reload',
			accelerator: 'CommandOrControl+Shift+R',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('hard-reload');
				}
			}
		}, {
			type: 'separator'
		}, {
			role: 'togglefullscreen'
		}, {
			label: 'Zoom In',
			accelerator: 'CommandOrControl+=',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('zoomIn');
				}
			}
		}, {
			label: 'Zoom Out',
			accelerator: 'CommandOrControl+-',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('zoomOut');
				}
			}
		}, {
			label: 'Actual Size',
			accelerator: 'CommandOrControl+0',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('zoomActualSize');
				}
			}
		}, {
			type: 'separator'
		}, {
			label: 'Toggle Tray Icon',
			click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.webContents.send('toggletray');
				}
			}
		}, {
			label: 'Toggle Sidebar',
			accelerator: 'CommandOrControl+S',
			click(item, focusedWindow) {
				if (focusedWindow) {
					const newValue = !ConfigUtil.getConfigItem('show-sidebar');
					focusedWindow.webContents.send('toggle-sidebar', newValue);
					ConfigUtil.setConfigItem('show-sidebar', newValue);
				}
			}
		}, {
			label: 'Toggle DevTools for Zulip App',
			accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
			click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.webContents.toggleDevTools();
				}
			}
		}, {
			label: 'Toggle DevTools for Active Tab',
			accelerator: process.platform === 'darwin' ? 'Alt+Command+U' : 'Ctrl+Shift+U',
			click(item, focusedWindow) {
				if (focusedWindow) {
					AppMenu.sendAction('tab-devtools');
				}
			}
		}];
	}

	getHelpSubmenu() {
		return [{
			label: `${appName} Website`,
			click() {
				shell.openExternal('https://zulipchat.com/help/');
			}
		}, {
			label: `${appName + 'Desktop'} - ${app.getVersion()}`,
			enabled: false
		}, {
			label: 'Report an Issue...',
			click() {
				const body = `
					<!-- Please succinctly describe your issue and steps to reproduce it. -->
					-
					${app.getName()} ${app.getVersion()}
					Electron ${process.versions.electron}
					${process.platform} ${process.arch} ${os.release()}`;
				shell.openExternal(`https://github.com/zulip/zulip-electron/issues/new?body=${encodeURIComponent(body)}`);
			}
		}];
	}

	getDarwinTpl() {
		return [{
			label: `${app.getName()}`,
			submenu: [{
				label: 'Zulip Desktop',
				click(item, focusedWindow) {
					console.log(this);
					if (focusedWindow) {
						AppMenu.sendAction('open-about');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: 'Settings',
				accelerator: 'Cmd+,',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('open-settings');
					}
				}
			}, {
				label: 'Keyboard Shortcuts',
				accelerator: 'Cmd+K',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('shortcut');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: 'Clear Cache',
				click() {
					AppMenu.clearCache();
				}
			}, {
				label: 'Log Out',
				accelerator: 'Cmd+L',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('log-out');
					}
				}
			}, {
				type: 'separator'
			}, {
				role: 'services',
				submenu: []
			}, {
				type: 'separator'
			}, {
				role: 'hide'
			}, {
				role: 'hideothers'
			}, {
				role: 'unhide'
			}, {
				type: 'separator'
			}, {
				role: 'quit'
			}]
		}, {
			label: 'Edit',
			submenu: [{
				role: 'undo'
			}, {
				role: 'redo'
			}, {
				type: 'separator'
			}, {
				role: 'cut'
			}, {
				role: 'copy'
			}, {
				role: 'paste'
			}, {
				role: 'pasteandmatchstyle'
			}, {
				role: 'delete'
			}, {
				role: 'selectall'
			}]
		}, {
			label: 'View',
			submenu: this.getViewSubmenu()
		}, {
			label: 'History',
			submenu: this.getHistorySubmenu()
		}, {
			role: 'window',
			submenu: [{
				role: 'minimize'
			}, {
				role: 'close'
			}, {
				type: 'separator'
			}, {
				role: 'front'
			}]
		}, {
			role: 'help',
			submenu: this.getHelpSubmenu()
		}];
	}

	getOtherTpl() {
		return [{
			label: 'File',
			submenu: [{
				label: 'Zulip Desktop',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('open-about');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: 'Settings',
				accelerator: 'Ctrl+,',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('open-settings');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: 'Keyboard Shortcuts',
				accelerator: 'Ctrl+K',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('shortcut');
					}
				}
			}, {
				type: 'separator'
			}, {
				label: 'Clear Cache',
				click() {
					AppMenu.clearCache();
				}
			}, {
				label: 'Log Out',
				accelerator: 'Ctrl+L',
				click(item, focusedWindow) {
					if (focusedWindow) {
						AppMenu.sendAction('log-out');
					}
				}
			}, {
				type: 'separator'
			}, {
				role: 'quit',
				accelerator: 'Ctrl+Q'
			}]
		}, {
			label: 'Edit',
			submenu: [{
				role: 'undo'
			}, {
				role: 'redo'
			}, {
				type: 'separator'
			}, {
				role: 'cut'
			}, {
				role: 'copy'
			}, {
				role: 'paste'
			}, {
				role: 'pasteandmatchstyle'
			}, {
				role: 'delete'
			}, {
				type: 'separator'
			}, {
				role: 'selectall'
			}]
		}, {
			label: 'View',
			submenu: this.getViewSubmenu()
		}, {
			label: 'History',
			submenu: this.getHistorySubmenu()
		}, {
			role: 'help',
			submenu: this.getHelpSubmenu()
		}];
	}

	static sendAction(action, ...params) {
		const win = BrowserWindow.getAllWindows()[0];

		if (process.platform === 'darwin') {
			win.restore();
		}

		win.webContents.send(action, ...params);
	}

	static clearCache() {
		const win = BrowserWindow.getAllWindows()[0];
		const ses = win.webContents.session;
		ses.clearCache(() => {
			dialog.showMessageBox({type: 'info', buttons: [], message: 'Cache cleared!'});
		});
	}

	getMenu() {
		const tpl = process.platform === 'darwin' ? this.getDarwinTpl() : this.getOtherTpl();
		return electron.Menu.buildFromTemplate(tpl);
	}
}

module.exports = new AppMenu();
