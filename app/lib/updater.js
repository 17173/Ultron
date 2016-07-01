const fs = require('fs');
const os = require('os');
const path = require('path');
const join = path.join;
const http = require('http');

import {app, dialog, clipboard, ipcMain} from 'electron'

const logger = require('./logger');

const HOST = '7xpmmd.dl1.z0.glb.clouddn.com';
const DOWNLOAD_DIR = os.tmpdir();
const INSTALL_NAME = 'Ultron Setup.exe';
const options = {
	hostname: HOST,
	path: '/package.json',
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	}
};

module.exports = {
	checkUpdate(event) {
		logger.info('Checking update info...');

		var req = http.request(options, (res) => {
		  res.on('data', (pkg) => {
		  	if (!pkg) {
		  		return
		  	}
		  	pkg = JSON.parse(pkg)
		  	var version = pkg.version
		  	// console.log('checkUpdate ', callback)
		  	// typeof callback === 'function' && callback(pkg.articleMods)
		  	event.sender.send('afterCheckUpdate', pkg.articleMods)

		  	logger.info('latest version: %s', version);
		  	logger.info('current version: %s', app.getVersion());

		  	if (version && version > app.getVersion() ) { 
		  		clipboard.writeText(join(HOST, version, INSTALL_NAME));
		  		dialog.showMessageBox({
		  			type: 'info',
		  			buttons:['确定'],
		  			title: '更新软件',
		  			message: '有版本更新，下载地址已复制到粘贴板，请直接粘贴到浏览器地址栏下载',
		  			detail: '建议更新到最新的版本 ' + version
		  		});
		  	}
		  });
		  res.on('end', () => console.log('No more data in response.'));
		});

		req.on('error', (e) => logger.error('problem with request: %s', e.message));
		req.end();
	},
	update(fileUrl, version) {
		logger.info('下载地址：%s', fileUrl);
		logger.info('Upgrading to new version...');
		
		var file = fs.createWriteStream(join(DOWNLOAD_DIR, INSTALL_NAME));
		console.log(join(DOWNLOAD_DIR, INSTALL_NAME));
		var req = http.request({
			hostname: HOST,
			path: '/' + version + '/' + INSTALL_NAME,
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-msdownload'
			}
		}, (res) => {
			console.log(res);
		  res.on('data', (chunk) => {
		  	file.write(chunk);
		  });

		});

		req.on('error', (e) => logger.error('problem with request: %s', e.message));
		req.on('end', () => file.end());
		req.end();
	}
};
