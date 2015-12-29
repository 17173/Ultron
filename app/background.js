'use strict';

const electron = require('electron');

const ipc = electron.ipcMain;
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const globalShortcut = electron.globalShortcut;

const path = require('path');
const join = path.join;

const file = require('./lib/file');
const util = require('./lib/util');
const ultron = require('./lib/ultron');

const MERGE_PATH = 'merge';

let mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 1024, height: 728 });

  mainWindow.loadURL('file://' + __dirname + '/main.html');
  //mainWindow.loadURL('http://localhost:8080/app/main.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  require('./menu');

  var ret = globalShortcut.register('ctrl+o', function() {
    console.log('ctrl+o is pressed');
  });

  if (!ret) {
    console.log('registration failed');
  }

  // 打开文件浏览框
  ipc.on('openDialog', function(event) {
    var filePath = dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]});
    var curPath = filePath && filePath[0];
    
    if (curPath) {
      if (file.exists(join(curPath, MERGE_PATH))) {
        loadFiles(event, curPath);
      } else {
        ultron.merge(curPath, function() {
          loadFiles(event, curPath);
        });
      }
    }
  });

  // 更新文件
  ipc.on('updateFiles', function(event, filePath) {
    loadFiles(event, filePath);
  });

  // 读文件
  ipc.on('readFile', function(event, filePath) {
    var value = null;
    if (file.exists(filePath)) {
      value = file.read(filePath);
    }
    event.returnValue = value;
  });

  // 写文件
  ipc.on('writeFile', function(event, filePath, content) {
    file.write(filePath, content);
  });

  // 合并文件
  ipc.on('mergeFiles', function(event, rootPath) {
    ultron.merge(rootPath, function() {
      loadFiles(event, rootPath);
    });
    
  });

  // 删除目录
  ipc.on('removeDir', (event, filePath) => {
    file.rmdirSync(filePath);
  });

  // 异步更改文件路径
  ipc.on('renameFile', (event, oldPath, newFileName) => {
    console.log(typeof callback);
    let newPath = join(path.dirname(oldPath), newFileName);
    file.rename(oldPath, newPath, function(err) {
      if (err) {
        console.log(err);
        return false;
      }
      event.sender.send('renameFileSuccess', newPath);
    });
  });

  // 计算路径，供 render process
  ipc.on('computePath', (event, oldPath, newFileName) => {
    event.returnValue = join(path.dirname(oldPath), newFileName);
  })

  ipc.on('joinPath', (event, filePath, fileName) => {
    event.returnValue = join(filePath, fileName);
  })


  // 生产处理过的文件
  // TODO 能同步新增或删除的文件
  ipc.on('generateFiles', function(event, rootPath) {
    ultron.generate(rootPath, function() {
      loadFiles(event, rootPath);
    });
  });

  // 压缩处理过的文件
  ipc.on('compressFiles', function(event, rootPath) {
    var curPath = path.join(rootPath, 'out');
    if (!file.exists(curPath)) {
      util.showMessageBox('请先点击生成，后再压缩！');
      return;
    }
    ultron.compress(curPath, function() {
      loadFiles(event, rootPath);
    });
  });

});

// 载入文件
function loadFiles(event, filePath) {
  var files = util.dirToTree(filePath);

  if (!files) {
    return false;
  }
  event.sender.send('getFiles', path.basename(filePath), files, filePath);
}
