import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import jetpack from 'fs-jetpack'
const path = require('path')
const join = path.join

const util = require('./lib/util')

import merge from './lib/merge'
import generate from './lib/generate'
import compress from './lib/compress'

import updater from './lib/updater'

const MERGE_PATH = 'merge'

let mainWindow = null

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 1024, height: 728 })

  const mainURL = process.env.HOT
    ? `http://localhost:${process.env.PORT}/main.html`
    : 'file://' + path.join(__dirname, 'main.html')

  mainWindow.loadURL(mainURL)

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  require('./menu')

  const processFiles = (event, filepath) => {
    if (filepath) {
      if (jetpack.exists(join(filepath, MERGE_PATH))) {
        loadFiles(event, filepath)
      } else {
        console.log(merge)
        merge.start(filepath, () => {
          loadFiles(event, filepath)
        })
      }
    }
  }

  // 打开文件浏览框
  ipcMain.on('openDialog', (event) => {
    var filepath = dialog.showOpenDialog({properties: [ 'openFile', 'openDirectory', 'multiSelections' ]})
    var curPath = filepath && filepath[0]

    processFiles(event, curPath)
  })

  ipcMain.on('loadFiles', (event, filepath) => {
    processFiles(event, filepath)
  })

  // 更新文件
  ipcMain.on('updateFiles', (event, filepath) => {
    processFiles(event, filepath)
  })

  // 读文件
  ipcMain.on('readFile', (event, filepath) => {
    var value = null
    if (jetpack.exists(filepath)) {
      value = jetpack.read(filepath)
    }
    event.returnValue = value
  })

  // 写文件
  ipcMain.on('writeFile', (event, filepath, content) => {
    if (!jetpack.exists(filepath)) return

    jetpack.write(filepath, content)
  })

  // 合并文件
  ipcMain.on('mergeFiles', (event, rootPath) => {
    merge.start(rootPath, () => {
      loadFiles(event, rootPath)
    })
  })

  // 删除目录
  ipcMain.on('removeDir', (event, filepath) => {
    jetpack.remove(filepath)
  })

  // 异步更改文件路径
  ipcMain.on('renameFile', (event, oldPath, newFileName) => {
    let newPath = join(path.dirname(oldPath), newFileName)
    jetpack.renameAsync(oldPath, newFileName, (err) => {
      if (err) {
        console.log(err)
        return false
      }
      event.sender.send('renameFileSuccess', newPath)
    })
  })

  // 生产处理过的文件
  // TODO 能同步新增或删除的文件
  ipcMain.on('generateFiles', (event, rootPath) => {
    generate.start(rootPath, () => {
      loadFiles(event, rootPath)
    })
  })

  // 压缩处理过的文件
  ipcMain.on('compressFiles', (event, rootPath) => {
    var curPath = path.join(rootPath, 'out')
    if (!jetpack.exists(curPath)) {
      util.showMessageBox('请先点击生成，后再压缩！')
      return
    }
    compress.start(curPath, () => {
      loadFiles(event, rootPath)
    })
  })

  // 检查软件更新
  ipcMain.on('checkUpdate', (event) => {
    updater.checkUpdate(event)
  })
})

// 载入文件
function loadFiles (event, filepath) {
  console.log('explore filepath ', filepath)
  if (!filepath) return
  var files = util.dirToTree(filepath)

  if (!files) {
    return false
  }
  event.sender.send('getFiles', path.basename(filepath), files, filepath)
}
