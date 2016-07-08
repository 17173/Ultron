/**
 * [exports description]
 * @type {Object}
 */

const fs = require('fs')
const path = require('path')
const join = path.join

const dialog = require('electron').dialog

module.exports = {
  existElement (target, objects) {
    var ret = false
    if (objects instanceof Array) {
      for (var i = 0, len = objects.length; i < len; i++) {
        if (objects[i] === target) {
          ret = true
          break
        }
      }
    } else {
      if (objects[target]) {
        ret = true
      }
    }
    return ret
  },
  showMessageBox (msg) {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['确定'],
      message: msg
    })
  },
  isPart (target, arr) {
    var ret = false
    for (var i = 0, len = arr.length; i < len; i++) {
      if (!target.indexOf(arr[i])) {
        ret = true
        break
      }
    }
    return ret
  },

  // 根据路径获取树节点数据
  dirToTree (filePath) {
    var results = []
    var isDir = fs.statSync(filePath).isDirectory()
    var rootLength = filePath.length
    if (isDir) {
      dirToTree(filePath, results, rootLength)
      return results
    } else {
      this.showMessageBox('请打开文件夹！')
      return false
    }
  }
}

var dirToTree = (filePath, dirs, rootLength) => {
  var isDir = fs.statSync(filePath).isDirectory()
  var arrayFiles = []

  if (isDir) {
    fs.readdirSync(filePath)
    .filter(name => {
      return name !== '.DS_Store'
    })
    .forEach(name => {
      var fullPath = join(filePath, name)
      var level = fullPath.slice(rootLength).split(/[\/\\]/).length - 1
      if (fs.statSync(filePath).isDirectory()) {
        dirs.push({
          name: name,
          level: level,
          fullPath: fullPath,
          open: false,
          children: []
        })
      } else {
        arrayFiles.push({
          name: name,
          level: level,
          fullPath: fullPath
        })
      }
    })
    dirs.forEach(item => {
      dirToTree(item.fullPath, item.children, rootLength)
    })
    dirs = dirs.concat(arrayFiles)
  }
}
