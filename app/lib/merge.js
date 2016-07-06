import path from 'path'
import walk from 'walk'
import jetpack from 'fs-jetpack'

const join = path.join;
const MERGE = 'merge'

export default {
  start(rootPath, callback) {
    var walker = walk.walk(rootPath, {
      followLinks: false,
      filters: [MERGE]
    });

    walker.on('file', (root, fileStats, next) => {
      var filename = fileStats.name;
      if (root == rootPath && !/^inc-.+\.shtml$/.test(filename) && /\.shtml$/.test(filename)) {
        var groupPath = join(rootPath, MERGE);
        jetpack.dir(groupPath);
        var content = jetpack.read(path.join(root, filename));
        if (content) {
          content = this.transport(content, filename, rootPath);
          jetpack.write(path.join(groupPath, filename), content);
        }
      }
      next();
    });

    walker.on('end', () => {
      callback();
    });
  },

  transport(data, filename, rootPath) {
    var reg = /<!--#include virtual="(.+\.shtml)".*?-->/ig;
    return data.replace(reg, (match, $1) => {
      if($1.indexOf('inc-site') !== -1) {
        return match;
      }
      var incDir = $1.lastIndexOf('/');
      var incPre = $1.substring(0 , incDir);
      var tempData = jetpack.read(path.join(rootPath, $1));
      //inc文件中再引入inc的情况
      tempData = tempData.replace(reg, (match, $1) => {
        if($1.indexOf('inc-site')!=-1) {
          return match;
        }
        if(!$1.indexOf('/')){
          return jetpack.read(path.join(rootPath, $1));
        }
        var s = incPre ? incPre + '/' + $1 : $1;
        var curData = jetpack.read(path.join(rootPath, s));
        //三层嵌套inc情况---后续需要优化这个算法
        curData = curData.replace(reg, (match, $1) => {
          if($1.indexOf('inc-site') !== -1) {
            return match;
          }
          if(!$1.indexOf('/')){
            return jetpack.read(path.join(rootPath, $1));
          }
          var s = incPre ? incPre + '/' + $1 : $1;
          return jetpack.read(path.join(rootPath, s));
        });
        return curData;
      });

      return tempData;
    });

  }
}
