#!/usr/bin/env node
'use strict';

const path = require('path'),
	join = path.join,
	fs = require('fs'),
	Zip = require('node-native-zip'),
	walk = require('walk');

const file = require('./file'),
	transport = require('./transport'),
	util = require('./util'),
	log = require('./log');

const OUT = 'out';
const MERGE = 'merge';

module.exports = {
	// 生成已配置的组件和页面
	generate:function(ROOT, callback){
		var mergePath = join(ROOT, MERGE);
		var walker = walk.walk(ROOT, {
			followLinks: false,
			filters: [OUT]
		});

		walker.on('file', function (root, fileStats, next) {
			var filename = fileStats.name;

			if (root == mergePath && !/^inc-.+\.shtml$/.test(filename) && /\.shtml$/.test(filename)) {
				var groupPath = ROOT + '/' + OUT + '/' + filename.substring(0,filename.indexOf('.shtml'));
				file.mkdir(groupPath);
				var content = file.read(path.join(root, filename));
				content = transport.init(content,filename,groupPath,ROOT, '');
				file.write(path.join(groupPath, filename), content);
			}
			next();
		});

		walker.on('end', function() {
			file.data.forEach(function(filename) {
				console.log('生产模板： ' + filename);
			});

			callback();
			util.showMessageBox('模板生成成功，请到目录' + OUT + '下查看！');
			log.info('生成成功！');
		});
	},

	// 合并本地 inc 文件
	merge:function(ROOT, callback){
		var walker = walk.walk(ROOT, {
			followLinks: false,
			filters: [MERGE]
		});

		walker.on('file', function (root, fileStats, next) {
			var filename = fileStats.name;
			if (root == ROOT && !/^inc-.+\.shtml$/.test(filename) && /\.shtml$/.test(filename)) {
				var groupPath = ROOT + '/' + MERGE;
				file.mkdir(groupPath);
				var content = file.read(path.join(root, filename));
				content = transport.init(content,filename,groupPath,ROOT, 'merge');
				file.write(path.join(groupPath, filename), content);
			}
			next();
		});

		walker.on('end', function() {
			file.data.forEach(function(filename) {
				console.log('读取 inc: ' + filename);
			});

			callback();
			log.info('合并成功！');
		});
	},

	// 压缩组件
	compress: function(filePath, callback) {
		fs.readdir(path.join(path.dirname(__dirname), 'template', 'component'), function(err, components){
			if (err) {
				return console.log('err while reading files', err);
			}
			components = components.filter(function(name) {
				return name !== '.DS_Store';
			});

			findComponents(filePath, components);

			callback();
			util.showMessageBox('组件压缩成功！');
		});

	}
};

// 删除 handlebars 文件的注释
var removeComment = function(filePath) {
	var handlebars = fs.readFileSync(join(filePath, 'component.handlebars'), {encoding:'utf8'});
	handlebars = handlebars.replace(/<!--<div[\s\S]*?div>-->/, '');
	fs.writeFileSync(join(filePath, 'component.handlebars'),handlebars);
};

// 找到组件并压缩
var findComponents = function(filePath, components) {
	fs.readdirSync(filePath)
		.forEach(function(name) {
			var fullPath = join(filePath, name);
			var isDir = fs.statSync(fullPath).isDirectory();

			if (isDir) {
				if (components.indexOf(name.replace(/\-\d+$/, '')) === -1) {
					findComponents(fullPath, components);
				} else {
					var archive = new Zip();
					removeComment(fullPath);
					var files = fs.readdirSync(fullPath).map(function(filename) {
						return {
							name: filename,
							path: join(fullPath, filename)
						};
					});
					archive.addFiles(files, function(err) {
						if (err) {
							return console.log('err while adding files', err);
						}
						    
				    var buff = archive.toBuffer();
				    
				    fs.writeFile(join(filePath, name + '.zip'), buff, function () {
				      log.info('已压缩组件' + name);
				    });
					});
				}
			}
		});
};

