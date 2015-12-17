'use strict';

var app = require('app');
var ipc = require('ipc');
var dialog = require('dialog');
var BrowserWindow = require('browser-window');
var path = require('path');

var file = require('./lib/file');
var util = require('./lib/util');
var ultron = require('./lib/ultron');

require('crash-reporter').start();
/*require('electron-debug')({
    showDevTools: true
});
*/
var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 1024, height: 728 });

  mainWindow.loadUrl('file://' + __dirname + '/main.html');
  //mainWindow.loadUrl('http://localhost:8080/app/main.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  require('./menu');

  //mainWindow.openDevTools();

  // 打开文件浏览框
  ipc.on('openDialog', function(event) {
    var filePath = dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]})[0];
    
    loadFiles(event, filePath);
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

  // 生产处理过的文件
  // TODO 能同步新增或删除的文件
  ipc.on('generateFiles', function(event, filePath) {
    var curPath = filePath.indexOf('merge') > -1 ? filePath : path.join(filePath, 'merge');
    ultron.generate(curPath, function() {
      loadFiles(event, filePath);
    });
  });

  // 压缩处理过的文件
  ipc.on('compressFiles', function(event, filePath) {
    var curPath = filePath.indexOf('merge') > -1 ? path.join(filePath, 'out') : path.join(filePath, 'merge', 'out');
    if (!file.exists(curPath)) {
      util.showMessageBox('请先合并，再生产，后再压缩！');
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
