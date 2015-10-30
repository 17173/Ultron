'use strict'
var os = require('os');
var fs = require('fs');
var path = require('path');
var url = require('url');
var exec = require('child_process').exec;
var http = require('http');
//var ncp = require('ncp').ncp;
//var Decompress = require('decompress');

// App variables
var packageInfoUrl = 'http://10.5.121.139/cmstemplate/cmsTemplate.json';
var fileUrl = 'http://10.5.121.139/cmstemplate/cmsTemplate.zip';
var DOWNLOAD_DIR = os.tmpdir().replace(/\\/g,'/')+'/';
var saveFileName = DOWNLOAD_DIR + url.parse(fileUrl).pathname.split('/').pop();
var ROOT_DIR = path.dirname(__dirname);
var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'),'utf-8'));
var cmsTemplateUpdater = module.exports = {
	currentVersion:CONFIG.version,
	latestVersion:'',
	hasNewVersion:function(cb){
		console.log('Checking update info...');

		http.get(packageInfoUrl, function(res) {
			res.setEncoding('utf8');
			res.on('data',function(data){
				var packageInfo = JSON.parse(data);
				cmsTemplateUpdater.latestVersion = packageInfo.version;
				if(cmsTemplateUpdater.latestVersion>cmsTemplateUpdater.currentVersion){
					if (cb && (typeof cb==='function')) {
						cmsTemplateUpdater.update(cb);
					}else{
						cmsTemplateUpdater.update();
					}
				}
			});
		}).on('error', function(e) {
			console.log(e);
		});
	},
	update:function(callback){
		console.log('Upgrading to new version...');

		var file = fs.createWriteStream(saveFileName);
		http.get(fileUrl, function(res) {
		    res.on('data', function(data) {
		            file.write(data);
	        }).on('end', function() {
	            file.end();
	        	/*var decompress = new Decompress()
				    .src(saveFileName)
				    .dest(DOWNLOAD_DIR)
				    .use(Decompress.zip());

				decompress.decompress(function(){
					ncp(DOWNLOAD_DIR+'cmsTemplate',EXE_DIR,function(){
	            		console.log('Upgrade complete!\nNew function will work in next run.');
	            	});
				});*/
				exec(ROOT_DIR + '\\7z.exe x ' + saveFileName + ' -o' + ROOT_DIR + ' -r -aoa',function(error,stdout,stderr){
					if (error) {
						return console.error(error);
					}
					callback();
				});
	        });
	    }).on('error', function(e) {
			console.log(e);
		});

	}
}