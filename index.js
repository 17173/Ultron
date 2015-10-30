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

var mainWindow = null;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', function() {
  mainWindow = new BrowserWindow({ width: 1024, height: 728 });

  //mainWindow.loadUrl('file://' + __dirname + '/app/index.html');
  mainWindow.loadUrl('http://localhost:8080/app/');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  mainWindow.openDevTools();

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
    event.returnValue = file.read(filePath);
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
    ultron.generate(path.join(filePath, 'merge'), function() {
      loadFiles(event, filePath);
    });
  });

  // 压缩处理过的文件
  ipc.on('compressFiles', function(event, filePath) {
    ultron.compress(path.join(filePath, 'merge', 'out'), function() {
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
