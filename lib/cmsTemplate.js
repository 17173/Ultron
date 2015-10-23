#!/usr/bin/env node
'use strict';

var path = require('path'),
	//updater = require('./updater.js'),
	walk = require('walk');

var file = require('./file'),
	transport = require('./transport'),
	log = require('./log');

//updater.hasNewVersion();

module.exports = {
	init:function(ROOT){
		var dest = 'out';

		var walker = walk.walk(ROOT, {
			followLinks: false,
			filters: [dest]
		});

		walker.on('file', function (root, fileStats, next) {
			var filename = fileStats.name;
			if (root == ROOT && !/^inc-.+\.shtml$/.test(filename) && /\.shtml$/.test(filename)) {
				var groupPath = ROOT + '/' + dest + '/' + filename.substring(0,filename.indexOf('.shtml'));
				file.mkdir(groupPath);
				var content = file.read(path.join(root, filename));
				content = transport.init(content,filename,groupPath,ROOT, '');
				file.write(path.join(groupPath, filename), content);
			}
			next();
		});

		walker.on('end', function() {
			file.data.forEach(function(filename) {
				console.log('end: ' + filename);
			});
			window.showDialog('模板生成成功，请到该路径下查看！');
			log.info('成功！');
		});
	},
	merge:function(ROOT){
		var dest = 'merge';

		var walker = walk.walk(ROOT, {
			followLinks: false,
			filters: [dest]
		});

		walker.on('file', function (root, fileStats, next) {
			var filename = fileStats.name;
			if (root == ROOT && !/^inc-.+\.shtml$/.test(filename) && /\.shtml$/.test(filename)) {
				var groupPath = ROOT + '/' + dest;
				file.mkdir(groupPath);
				var content = file.read(path.join(root, filename));
				content = transport.init(content,filename,groupPath,ROOT, 'merge');
				file.write(path.join(groupPath, filename), content);
			}
			next();
		});

		walker.on('end', function() {
			file.data.forEach(function(filename) {
				console.log('end: ' + filename);
			});
			window.showDialog('模板合并成功，请到该路径下查看！');
			log.info('成功！');
		});
	}
}

