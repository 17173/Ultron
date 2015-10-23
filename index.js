'use strict';

var app = require('app');
var ipc = require('ipc');
var dialog = require('dialog');
var BrowserWindow = require('browser-window');
var fs = require('fs');
var path = require('path');
var walkTree = require('walk-folder-tree');

var file = require('./lib/file');

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

  ipc.on('open-dialog', function(event, arg) {
    var filePath = dialog.showOpenDialog({ properties: [ 'openFile', 'openDirectory', 'multiSelections' ]})[0];

    walkTree(filePath, {return: true}).then(function(files) {
      event.sender.send('get-files', path.basename(filePath), files);
    });
  });

  ipc.on('read-file', function(event, filePath) {
    console.log(filePath);
    event.returnValue = file.read(filePath);
  });

});
