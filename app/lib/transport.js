/**
 * 转换 shtml 文件内容为 handlebars 模板
 */
'use strict';

const path = require('path'),
  join = path.join,
  fs = require('fs'),
  cheerio = require('cheerio'),
  ncp = require('ncp').ncp,
  thisPath = path.dirname(__dirname);

const logger = require('./logger');

module.exports = {
  init: function(data,fileName,fileGroupPath,root, execType) {
    this.data = data;
    this.fileName = fileName;
    this.fileGroupPath = fileGroupPath;
    this.root = root;
    if(execType == 'merge') {
      this.setInclude();
    } else {
      this.setTitle();
      this.setMeta();
      this.setTypeInclude();
    }
    return this.data;
  },

  setTitle: function() {
    this.data = this.data.replace(/(<title>).*(<\/title>)/ig, '$1{{title}}$2');
  },

  setMeta: function() {
    this.data = this.data.replace(/(<meta\s+name="keywords"\s+content=").*("\s*\/?>)/ig, '$1{{keywords}}$2')
                         .replace(/(<meta\s+name="description"\s+content=").*("\s*\/?>)/ig, '$1{{description}}$2');
  },

  // TODO 判断是 include inc 目录下的文件
  setInclude: function() {
    var reg = /<!--#include virtual="(.+\.shtml)".*?-->/ig, self = this;
    this.data = this.data.replace(reg, function(match, $1) {
      if($1.indexOf('inc-site')!=-1) {
        return match;
      }
      var inc_dir = $1.lastIndexOf('/');
      var inc_pre = $1.substring(0 , inc_dir);
      var tem_data = fs.readFileSync(path.join(self.root, $1), {encoding:'utf8'});
      //inc文件中再引入inc的情况
      tem_data = tem_data.replace(reg, function(match, $1){
        if($1.indexOf('inc-site')!=-1) {
          return match;
        }
        if(!$1.indexOf('/')){
          return fs.readFileSync(path.join(self.root, $1), {encoding:'utf8'});
        }
        var s = inc_pre ? inc_pre + '/' + $1 : $1;
        var te_data = fs.readFileSync(path.join(self.root, s), {encoding:'utf8'});
        //三层嵌套inc情况---后续需要优化这个算法
        te_data = te_data.replace(reg, function(match, $1){
          if($1.indexOf('inc-site')!=-1) {
            return match;
          }
          if(!$1.indexOf('/')){
            return fs.readFileSync(path.join(self.root, $1), {encoding:'utf8'});
          }
          var s = inc_pre ? inc_pre + '/' + $1 : $1;
          return fs.readFileSync(path.join(self.root, s), {encoding:'utf8'});
        });
        return te_data;
      });

      return tem_data;
    });
    //inc文件包含inc的情况
    /* this.data = this.data.replace(reg, function(match, $1) {
       if($1.indexOf('inc-site')!=-1) {
         return match;
       }
       var s = 'inc/'+ $1;
       return fs.readFileSync(path.join(self.root, s), {encoding:'utf8'});
     });*/
  },

  setTypeInclude: function(){
    // ifCond传递'<' 引起dom节点匹配问题，暂时用转换字符解决
    var $ = cheerio.load(this.data.replace(/'<'/g, '\'&lt;\''),{decodeEntities: false}),
        self = this;
    //添加特殊标示，以便于去除col的样式影响。
    $('body').attr('cms-node', 'made');
    if(this.fileName.indexOf('article-list') !== -1) {
      // include 文章列表页
      var article_fragment_1 = fs.readFileSync(thisPath + '/static/template/inc-article-list/inc-article-list-1.shtml', {encoding:'utf8'});
      // ifCond传递'<' 引起dom节点匹配问题，暂时用转换字符解决
      $('div.pagination').length && $('div.pagination').first().after('\r\n' + article_fragment_1.replace('\'<\'', '\'&lt;\'') + '\r\n').remove();
      $('div[cms-include="article-list-page"]').length && $('div[cms-include="article-list-page"]').after('\r\n' + article_fragment_1.replace('\'<\'', '\'&lt;\'') + '\r\n').remove();
    } else if (this.fileName.indexOf('article') !== -1) {
      /*// include 文章终极页
      var article_fragment_1 = fs.readFileSync(thisPath + '/template/inc-article/inc-article-1.shtml', {encoding:'utf8'}),
          article_fragment_2 = fs.readFileSync(thisPath + '/template/inc-article/inc-article-2.shtml', {encoding:'utf8'}),
          article_fragment_3 = fs.readFileSync(thisPath + '/template/inc-article/inc-article-3.shtml', {encoding:'utf8'});
      //console.log(article_fragment_3);
      $('head link').filter(function(i,el){
        return $(this).attr('href').indexOf('reset')!=-1;
      }).after('\r\n' + article_fragment_1 + '\r\n');

      $('head script').last().after('\r\n' + article_fragment_2 + '\r\n');*/

      $('div[cms-include="article"]').after('<cmsmodule path="global-modules/article-zhuanqu-v3.shtml"/>').remove();
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
        var dst = join(self.fileGroupPath, componentValue);
        //var src = thisPath + '/template/component/' + type + '/',dst = self.fileGroupPath + '/' + type + '-' + (!!cid ? cid : componentIds[type]++) + '/';
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
        //file.copy(thisPath + '/template/component/' + type, 'out/group/' + type + '-' + (i + 1));
      } else {
        var content = $(plum).attr('cms-data-type',type).append($(this).clone());
        if(!!nodeType){
          content.attr('cms-node-type',nodeType);
        }
        $(this).replaceWith(content);
        //$(this).html($(plum).attr('cms-data-type',type).append($(this).html()));
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
    this.data = $.html().replace(/\'\&lt;\'/g,'\'<\'');

  }
};
