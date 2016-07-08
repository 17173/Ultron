
import fs from 'fs'
import path from 'path'
import jetpack from 'fs-jetpack'
const Zip = require('node-native-zip')

const util = require('./util')
const logger = require('./logger')

const join = path.join

// 删除 handlebars 文件的注释
const removeComment = (filepath) => {
  var handlebars = jetpack.read(join(filepath, 'component.handlebars'))
  handlebars = handlebars.replace(/<!--<div[\s\S]*?div>-->/, '')
  fs.writeFileSync(join(filepath, 'component.handlebars'), handlebars)
}

// 找到组件并压缩
const findComponents = (filepath, components) => {
  fs.readdirSync(filepath)
    .forEach(name => {
      var fullPath = join(filepath, name)
      var isDir = fs.statSync(fullPath).isDirectory()

      if (isDir) {
        if (components.indexOf(name.replace(/\-\d+$/, '')) === -1) {
          findComponents(fullPath, components)
        } else {
          var archive = new Zip()
          removeComment(fullPath)
          var files = fs.readdirSync(fullPath).map((filename) => {
            return {
              name: filename,
              path: join(fullPath, filename)
            }
          })
          archive.addFiles(files, (err) => {
            if (err) {
              return logger.info('err while adding files', err)
            }

            var buff = archive.toBuffer()

            fs.writeFile(join(filepath, name + '.zip'), buff, () => {
              logger.info('已压缩组件' + name)
            })
          })
        }
      }
    })
}

export default {
  start (filepath, callback) {
    fs.readdir(join(path.dirname(__dirname), 'static', 'template', 'component'), (err, components) => {
      if (err) {
        return logger.info('err while reading files', err)
      }
      components = components.filter((name) => {
        return name !== '.DS_Store'
      })

      findComponents(filepath, components)
      callback()
      util.showMessageBox('组件压缩成功！')
    })
  }
}
