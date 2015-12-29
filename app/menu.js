const electron = require('electron');

const remote = electron.remote;
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = require('electron').BrowserWindow;

const Menu = electron.Menu;

var menu = new Menu();

var template = [
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: '重做',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: '剪切',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: '复制',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: '粘贴',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: '全选',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '刷新',
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: '全屏',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: '打开控制台',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'F12';
        })(),
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [
      {
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [
      {
        label: '关于 Ultron',
        click() { 
          dialog.showMessageBox({
            title: '关于',
            type: 'info',
            buttons: [],
            message: app.getName() + '\r版本 ' + app.getVersion() 
          });
        }
      }, {
        label: '反馈',
        click() {
          var win = new BrowserWindow({ width: 800, height: 600, show: false });
          win.on('closed', function() {
            win = null;
          });

          win.loadURL('https://github.com/17173/Ultron/issues');
          win.show();
        }
      }
    ]
  },
];

if (process.platform == 'darwin') {
  var name = app.getName();

  template.unshift({
    label: name,
    submenu: [
      {
        label: '关于 ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: '服务',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: '隐藏 ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: '隐藏其它',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: '显示所有',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: '退出',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
