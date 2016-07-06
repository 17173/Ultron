import fs from 'fs'
import path from 'path'
import walk from 'walk'
import jetpack from 'fs-jetpack'
import {app} from 'electron'

const util = require('./util')
const logger = require('./logger')
const cheerio = require('cheerio')
const ncp = require('ncp').ncp
const thisPath = path.dirname(__dirname)
const join = path.join
const MERGE = 'merge'
const OUT = 'out'

const DB_PATH = join(app.getPath('userData'), 'db.json')
const pkg = require('../package.json')

let articleModule = pkg.articleMods.filter(item => item.default)[0].value

export default {
  start (rootPath, callback) {
    let self = this
    let mergePath = join(rootPath, MERGE);
		let walker = walk.walk(rootPath, {
			followLinks: false,
			filters: [OUT]
		});

		walker.on('file', function (root, fileStats, next) {
			let filename = fileStats.name;

			if (root == mergePath && !/^inc-.+\.shtml$/.test(filename) && /\.shtml$/.test(filename)) {
        let groupName = filename.substring(0,filename.indexOf('.shtml'));
				var groupPath = join(rootPath, OUT, groupName);
				var content = jetpack.read(path.join(root, filename));
        if (content) {
          content = self.transport(content, filename, groupPath);
  				jetpack.write(join(groupPath, filename), content);
        }
			}
			next();
		});

		walker.on('end', function() {
			util.showMessageBox('模板生成成功，请到目录' + OUT + '下查看！');
			logger.info('生成成功！');
      callback();
		});
  },

  transport (data, filename, groupPath) {
    data = data
      .replace(/(<title>).*(<\/title>)/ig, '$1{{title}}$2')
      .replace(/(<meta\s+name="keywords"\s+content=").*("\s*\/?>)/ig, '$1{{keywords}}$2')
      .replace(/(<meta\s+name="description"\s+content=").*("\s*\/?>)/ig, '$1{{description}}$2');

    // ifCond传递'<' 引起dom节点匹配问题，暂时用转换字符解决
    var $ = cheerio.load(data.replace(/'<'/g, '\'&lt;\''),{decodeEntities: false});

    //添加特殊标示，以便于去除col的样式影响。
    $('body').attr('cms-node', 'made');
    let isArticleList = filename.indexOf('article-list') !== -1
    let isArticleFinal = filename.indexOf('final') !== -1 || filename.indexOf('article') !== -1
    if(isArticleList) {
      // include 文章列表页
      var articleFragment1 = jetpack.read(thisPath + '/static/template/inc-article-list/inc-article-list-1.shtml');
      // ifCond传递'<' 引起dom节点匹配问题，暂时用转换字符解决
      if (articleFragment1) {
        $('div.pagination').length && $('div.pagination').first().after('\r\n' + articleFragment1.replace('\'<\'', '\'&lt;\'') + '\r\n').remove();
        $('div[cms-include="article-list-page"]').length && $('div[cms-include="article-list-page"]').after('\r\n' + articleFragment1.replace('\'<\'', '\'&lt;\'') + '\r\n').remove();
      }
    } else if (isArticleFinal) {
      if (jetpack.exists(DB_PATH)) {
        let dbData = jetpack.read(DB_PATH, 'json')
        if (dbData) {
          articleModule = dbData.articleModule.value
        }
      }
      $('div[cms-include="article"]').after(`<cmsmodule path="global-modules/${articleModule}.shtml"/>`).remove();
    }

    //添加cms标签
    var plum = '<div class="component"></div>';
    var rowWrap = '<div class="row"></div>';
    var componentIds = {};
    var componentRepeat = {};

    $('[cms-data-type]').each(function(i,el){
      var type = $(this).attr('cms-data-type').replace(/^list-\w+$/, 'list-content'),
          cid = $(this).attr('cms-data-component-cid'),
          sameid = $(this).attr('cms-data-component-sameid'),
          nodeType = $(this).attr('cms-node-type');
      if(!!sameid) {
        return true;
      }
      if(!!nodeType) {
        $(this).removeAttr('cms-node-type');
      }
      $(this).removeAttr('cms-data-type').removeAttr('cms-data-component-cid');
      if(type != 'html') {
        componentIds[type] = componentIds[type] || 1;
        var content = $(plum).attr('cms-data-type',type).append($(this).clone());
        if(!!nodeType){
          content.attr('cms-node-type',nodeType);
        }
        $(this).replaceWith(content);
        if(!!cid) {
          componentRepeat[cid] = content;
        }
        var src = join(thisPath, 'static', 'template', 'component', type);
        var componentValue = type + '-' + (!!cid ? cid : componentIds[type]++);
        var dst = join(groupPath, componentValue);
        //var src = thisPath + '/template/component/' + type + '/',dst = groupPath + '/' + type + '-' + (!!cid ? cid : componentIds[type]++) + '/';
        logger.info('复制的源路径: %s', src);
        logger.info('复制的目地路径: %s', dst);
        /** ncp为异步复制，所以回调的函数不能使用同步操作 **/
        ncp(src, dst, function (err) {
          if (err) {
            return logger.error(err);
          }
          fs.readFile(join(src,'component.handlebars'),{'encoding' : 'utf-8'},function(err,contents){
            if (err) {
              return logger.error(err);
            }
            //格式化代码，去掉前缀空白字符
            var htm =  content.html().split(/\r\n/);
            var re = /^(\s+)/;
            var spaces = 0;
            htm[htm.length-1] = htm[htm.length-1].replace(re, function(match, $1) {
              spaces = $1.length;
              return '';
            });
            var regg = new RegExp('^\\s{'+ spaces +'}');
            for(var i = 0;i<htm.length;i++) {
              htm[i] = htm[i].replace(regg,'');
            }
            //写入
            fs.writeFile(dst + '/component.handlebars',contents + '\r\n' + htm.join('\r\n'));
          });
        });
      } else {
        var content = $(plum).attr('cms-data-type',type).append($(this).clone());
        if(!!nodeType){
          content.attr('cms-node-type',nodeType);
        }
        $(this).replaceWith(content);
      }
    });
    //group中有组件时，会覆盖原来内容
    $('[cms-data-component-cid]').each(function(){
      var cid = $(this).attr('cms-data-component-cid');
      $(this).replaceWith(componentRepeat[cid].clone());
    });
    $('[cms-data-component-sameid]').each(function(){
      var sameid = $(this).attr('cms-data-component-sameid');
      $(this).replaceWith(componentRepeat[sameid].clone());
    });
    //包裹框架
    $('[cms-node-type]').each(function(i,el){
      var type = $(this).attr('cms-node-type');
      $(this).removeAttr('cms-node-type');
      var content = $(rowWrap).attr('cms-node-type',type).append($(this).clone());
      $(this).replaceWith(content);
    });
    // ifCond传递'<' 引起dom节点匹配问题，暂时用转换字符解决
    return $.html().replace(/\'\&lt;\'/g,'\'<\'');
  }
}
