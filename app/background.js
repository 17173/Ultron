import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
const path = require('path')
const join = path.join

const file = require('./lib/file')
const util = require('./lib/util')
const ultron = require('./lib/ultron')
const updater = require('./lib/updater')

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

  var ret = globalShortcut.register('ctrl+o', () => {
    console.log('ctrl+o is pressed')
  })

  if (!ret) {
    console.log('registration failed')
  }

  const processFiles = (event, filepath) => {
    if (filepath) {
      if (file.exists(join(filepath, MERGE_PATH))) {
        loadFiles(event, filepath)
      } else {
        ultron.merge(filepath, () => {
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
    loadFiles(event, filepath)
  })

  // 读文件
  ipcMain.on('readFile', (event, filepath) => {
    var value = null
    if (file.exists(filepath)) {
      value = file.read(filepath)
    }
    event.returnValue = value
  })

  // 写文件
  ipcMain.on('writeFile', (event, filepath, content) => {
    if (!file.exists(filepath)) return

    file.write(filepath, content)
  })

  // 合并文件
  ipcMain.on('mergeFiles', (event, rootPath) => {
    ultron.merge(rootPath, () => {
      loadFiles(event, rootPath)
    })
  })

  // 删除目录
  ipcMain.on('removeDir', (event, filepath) => {
    file.rmdirSync(filepath)
  })

  // 异步更改文件路径
  ipcMain.on('renameFile', (event, oldPath, newFileName) => {
    let newPath = join(path.dirname(oldPath), newFileName)
    file.rename(oldPath, newPath, (err) => {
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
    ultron.generate(rootPath, () => {
      loadFiles(event, rootPath)
    })
  })

  // 压缩处理过的文件
  ipcMain.on('compressFiles', (event, rootPath) => {
    var curPath = path.join(rootPath, 'out')
    if (!file.exists(curPath)) {
      util.showMessageBox('请先点击生成，后再压缩！')
      return
    }
    ultron.compress(curPath, () => {
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
