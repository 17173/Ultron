/**
 * 文件操作
 * 大部份参考 https://github.com/gruntjs/grunt/blob/master/lib/grunt/file.js
 */

const fs = require('fs'),
    iconv = require('iconv-lite'),
    rimraf = require('rimraf'),
    path = require('path');

const pathSeparatorRe = /[\/\\]/g;

const logger = require('./logger');

const file = module.exports = {
  defaultEncoding: 'utf8',
  preserveBOM: false,
  data: [],
  exists: function() {
    var filepath = path.join.apply(path, arguments);

    return fs.existsSync(filepath);
  },
  isDir: function() {
    var filepath = path.join.apply(path, arguments);
    
    return this.exists(filepath) && fs.statSync(filepath).isDirectory();    
  },

  isFile: function() {
    var filepath = path.join.apply(path, arguments);
    
    return this.exists(filepath) && fs.statSync(filepath).isFile();  
  },

  read: function(filepath, options) {
    let start = new Date().getTime()
    options = options || {};
    var contents;
    logger.info('Reading ' + filepath + '...');
    
    try {
      contents = fs.readFileSync(String(filepath));
      if (options.encoding !== null) {
        contents = iconv.decode(contents, options.encoding || file.defaultEncoding);

        // Strip any BOM that might exist.
        if (!file.preserveBOM && contents.charCodeAt(0) === 0xFEFF) {
          contents = contents.substring(1);
        }
        let end = new Date().getTime()
        console.log('time:', end - start, 'ms')
        return contents;
      }
    } catch(e) {
      throw logger.error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ')');
    }
  },
  write: function(filepath, contents, options) {
    options = options || {}; 
    logger.info('Writing ' + filepath + '...');
    // Create path, if necessary.
    file.mkdir(path.dirname(filepath));
    try {
      // If contents is already a Buffer, don't try to encode it. If no encoding
      // was specified, use the default.
      if (!Buffer.isBuffer(contents)) {
        contents = iconv.encode(contents, options.encoding || file.defaultEncoding);
      }
      
      fs.writeFileSync(filepath, contents);
      return true;
    } catch(e) {
      throw console.error('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
    }
    
  },

  /**
   * 创建目录
   * @param  {[type]} dirpath [description]
   * @return {[type]}         [description]
   */
  mkdir: function(dirpath, mode) {
    // Set directory mode in a strict-mode-friendly way.
    if (mode === null) {
      mode = parseInt('0777', 8) & (~process.umask());
    }
    var self = this;
    dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
      parts += part + '/';
      var subpath = path.resolve(parts);
      if (!self.exists(subpath)) {
        try {
          fs.mkdirSync(subpath, mode);
        } catch(e) {
          throw logger.error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
        }
      }
      return parts;
    }, '');

  }
};

// 递归复制文件
file.copy = function copy(srcpath, destpath) {
  if (file.isDir(srcpath)) {
    file.mkdir(destpath);

    fs.readdirSync(srcpath).forEach(function(filepath) {
      copy(path.join(srcpath, filepath), path.join(destpath, filepath));
    });
  } else {
    file._copy(srcpath, destpath);
  }
};

/*
// 递归复制文件
file.copy2 = function copy2( src, dst, callback ){
  fs.exists( dst, function( exists ){
    // 已存在
    if( exists ){
      callback( src, dst );
    }
    // 不存在
    else{
      fs.mkdir( dst, function(){
        callback( src, dst );
      });
    }
  });
};

var copy3 = function( src, dst ){
  // 读取目录中的所有文件/目录
  fs.readdir( src, function( err, paths ){
    if( err ){
      throw err;
    }

    paths.forEach(function( path ){
      var _src = src + '/' + path,
      _dst = dst + '/' + path,
      readable, writable;
      stat( _src, function( err, st ){
        if( err ){
          throw err;
        }
        // 判断是否为文件
        if( st.isFile() ){
          // 创建读取流
          readable = fs.createReadStream( _src );
          // 创建写入流
          writable = fs.createWriteStream( _dst );
          // 通过管道来传输流
          readable.pipe( writable );
        }
        // 如果是目录则递归调用自身
        else if( st.isDirectory() ){
          exists( _src, _dst, copy3 );
        }
      });
    });
  });
};
*/


/**
 * 复制单个文件
 * 
 * @param  {[type]} srcpath  [description]
 * @param  {[type]} destpath [description]
 * @return {[type]}          [description]
 */
file._copy = function(srcpath, destpath) {
  var contents = file.read(srcpath);
  //var contents = fs.createReadStream( srcpath );

  if (contents === false) {
    logger.warn('Write aborted.');
  } else {
    //var writable = fs.createWriteStream( destpath );
    //contents.pipe( writable );
    file.write(destpath, contents);
  }
};

// 递归删除目录和文件
file.remove = function(filepath) {
  filepath = String(filepath);

  logger.info('Deleting ' + filepath + '...');

  if (!file.exists(filepath)) {
    logger.warn('Cannot delete nonexistent file.');
    return false;
  }

  if (file.isPathCwd(filepath)) {
    logger.warn('Cannot delete the current working directory.');
    return false;
  } else if (!file.isPathInCwd(filepath)) {
    logger.warn('Cannot delete files outside the current working directory.');
    return false;
  }

  try {
    // Actually delete. Or not.
    rimraf.sync(filepath);
    return true;
  } catch(e) {
    throw logger.error('Unable to delete "' + filepath + '" file (' + e.message + ').');
  }

};

// 删除目录
file.rmdirSync = (filepath) => {

  logger.info('Deleting ' + filepath + '...');

  if (!file.exists(filepath)) {
    logger.warn('Cannot delete nonexistent file.');
    return false;
  }

  try {
    // Actually delete. Or not.
    rimraf.sync(filepath);
    return true;
  } catch(e) {
    throw logger.error('Unable to delete "' + filepath + '" file (' + e.message + ').');
  }
}

file.rename = (oldPath, newPath, callback) => {
  fs.rename(oldPath, newPath, callback);
}

// Is a given file path absolute?
file.isPathAbsolute = function() {
  var filepath = path.join.apply(path, arguments);
  return path.resolve(filepath) === filepath.replace(/[\/\\]+$/, '');
};

// Do all the specified paths refer to the same path?
file.arePathsEquivalent = function(first) {
  first = path.resolve(first);
  for (var i = 1; i < arguments.length; i++) {
    if (first !== path.resolve(arguments[i])) { return false; }
  }
  return true;
};

// Are descendant path(s) contained within ancestor path? Note: does not test
// if paths actually exist.
file.doesPathContain = function(ancestor) {
  ancestor = path.resolve(ancestor);
  var relative;
  for (var i = 1; i < arguments.length; i++) {
    relative = path.relative(path.resolve(arguments[i]), ancestor);
    if (relative === '' || /\w+/.test(relative)) { return false; }
  }
  return true;
};

// Test to see if a filepath is the CWD.
file.isPathCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.arePathsEquivalent(fs.realpathSync(process.cwd()), fs.realpathSync(filepath));
  } catch(e) {
    return false;
  }
};

// Test to see if a filepath is contained within the CWD.
file.isPathInCwd = function() {
  var filepath = path.join.apply(path, arguments);
  try {
    return file.doesPathContain(fs.realpathSync(process.cwd()), fs.realpathSync(filepath));
  } catch(e) {
    return false;
  }
};

