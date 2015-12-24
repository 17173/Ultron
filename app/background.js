'use strict';

const electron = require('electron');

const ipc = electron.ipcMain;
const app = electron.app;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;

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

  //mainWindow.loadURL('file://' + __dirname + '/main.html');
  mainWindow.loadURL('http://localhost:8080/app/main.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  require('./menu');

  // 打开文件浏览框
  ipc.on('openDialog', function(event) {
    var filePath = dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]});
    var curPath = filePath[0];
    
    if (filePath && curPath) {
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
  ipc.on('mergeFiles', function(event, filePath) {
    ultron.merge(filePath, function() {
      loadFiles(event, filePath);
    });
    
  });

  // 删除目录
  ipc.on('removeDir', (event, filePath) => {
    file.rmdirSync(filePath);
  });

  // 生产处理过的文件
  // TODO 能同步新增或删除的文件
  ipc.on('generateFiles', function(event, rootPath) {
    //var curPath = filePath.indexOf('merge') > -1 ? filePath : path.join(filePath, 'merge');
    ultron.generate(rootPath, function() {
      loadFiles(event, rootPath);
    });
  });

  // 压缩处理过的文件
  ipc.on('compressFiles', function(event, filePath) {
    var curPath = filePath.indexOf('merge') > -1 ? path.join(filePath, 'out') : path.join(filePath, 'merge', 'out');
    if (!file.exists(curPath)) {
      util.showMessageBox('请先生产，后再压缩！');
      return;
    }
    ultron.compress(curPath, function() {
      loadFiles(event, filePath);
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
