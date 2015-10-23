'use strict';

var fs = require('fs');
var path = require('path');
var util = require('./util');
var exec = require('child_process').exec;
var zip = require('node-native-zip');

// App variables
var ROOT_DIR = path.dirname(__dirname);
var compress = module.exports = {
	componentNames : [],
	init:function(compress_dir){
		var self = this;
		fs.readdir(path.join(__dirname,'template/component'),function(err, files){
			// del /q .\sub\a.zip & 7z a ./sub/a.zip ./sub/* -x!*.zip
			self.componentNames = files;
			var compress_exe_path = path.join(ROOT_DIR ,'7z');
			var compress_paths = self.getAllPath(compress_dir);
      console.log(compress_paths);
			for(var i = 0, len = compress_paths.length; i < len; i++){
				self.removeNote(compress_paths[i].fullPath);
				var saveFileName = '"' + path.join(compress_paths[i].fullPath , compress_paths[i].dirName) + '.zip"';
				var fromFilePath = '"' + path.join(compress_paths[i].fullPath, '*') + '"';
				//若需要删除原zip才将注释取消
				var exec_command = /*'del /q ' + saveFileName + ' & ' + */compress_exe_path + ' a -tzip ' + saveFileName + ' ' + fromFilePath + ' -x!*.zip';
				exec(exec_command, function(error,stdout,stderr){
					if (error) {
						return console.error(error);
					}
				});
			}
			window.showDialog('压缩组件成功，请到各目录下查看！');
		});
	},
	getAllPath:function(compress_dir){
		var allPath = [],self = this;
		var tem = this.scanFolder(compress_dir);
		for(var i = 0, len = tem.length; i < len; i++){
			var fullPath = path.join(compress_dir, tem[i]);
			if(this.scanFolder(fullPath).length==0){
				if(util.isPart(tem[i], self.componentNames)){
					allPath[allPath.length] = {
						fullPath:fullPath,
						dirName: tem[i]
					}
				}
			}else{
				allPath = allPath.concat(self.getAllPath(fullPath));
			}
		}
		return allPath;
	},
	scanFolder: function(_path) {
		var files = fs.readdirSync(_path);
		var folders = [];
		files.forEach(function(item){
			var tmpPath = path.join(_path , item),
				stat = fs.statSync(tmpPath);
			if(stat.isDirectory()){
				folders[folders.length] = item;
			}
		});
		return folders;
	},
	//删除注释
	removeNote: function(_path) {
		var handlebars = fs.readFileSync(path.join(_path, 'component.handlebars'), {encoding:'utf8'});
		handlebars = handlebars.replace(/<!--<div[\s\S]*?div>-->/, '');
		fs.writeFileSync(path.join(_path, 'component.handlebars'),handlebars);
	}
}
