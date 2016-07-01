import Vue from 'vue'
import Vuex from 'vuex'
import jetpack from 'fs-jetpack'
import {ipcRenderer, remote} from 'electron'

Vue.use(Vuex)

const userPath = remote.app.getPath('userData')
console.log('userData path %s', userPath)
const state = {
  treeData: {},
  filepath: '',
  filename: 'untitled',
  rootPath: '',
  code: '',
  codePosition: {
    row: 1,
    column: 1
  },
  articleModule: null
}

const mutations = {
  INIT_STATE (state, success, error) {
    let data = jetpack.read(`${userPath}/db.json`, 'json')
    if (data) {
      console.log('userData: ', data)
      state.filepath = data.filepath
      state.filename = data.filename
      state.rootPath = data.rootPath
      state.code = data.code
      state.treeData = data.treeData || {}
      state.articleModule = data.articleModule
      console.log('init articleModule:', state.articleModule)
      !state.treeData.hasOwnProperty('open') && ipcRenderer.send('loadFiles', data.rootPath)
      typeof success === 'function' && success()
    } else {
      typeof error === 'function' && error()
    }
  },
  UPDATE_DB (state) {
    jetpack.write(`${userPath}/db.json`, {
      rootPath: state.rootPath,
      filepath: state.filepath,
      filename: state.filename,
      code: state.code,
      treeData: state.treeData,
      articleModule: state.articleModule
    })
  },
  SET_ARTICLE_MODULE (state, val) {
    console.log('set articleModule value', val)
    state.articleModule = val
  },
  SET_ROOT_PATH (state, rootPath) {
    state.rootPath = rootPath
  },
  OPEN_FILE_DIALOG () {
    ipcRenderer.send('openDialog')
  },
  SET_TREE_DATA (state, data) {
    state.treeData = data
  },
  UPDATE_FILE (state) {
    ipcRenderer.send('writeFile', state.filepath, state.code)
  },

  DELETE_DIR (state, filepath) {
    ipcRenderer.send('removeDir', filepath)
  },

  UPDATE_ALL_FILES (state) {
    ipcRenderer.send('updateFiles', state.rootPath)
  },

  FILE_STATUS (state, filename, filepath) {
    state.filepath = filepath
    state.filename = filename
  },
  RENAME_FILE (state, filepath, newName) {
    ipcRenderer.send('renameFile', filepath, newName)
  },
  READ_FILE (state, filepath) {
    state.code = ipcRenderer.sendSync('readFile', filepath)
  },
  UPDATE_CODE (state, code) {
    state.code = code
  },
  CHECK_UPDATE (state) {
    ipcRenderer.send('checkUpdate')
  },
  UPDATE_CODE_POSITION (state, codePosition) {
    state.codePosition.row = codePosition.row
    state.codePosition.column = codePosition.column
  },

  MERGE_FILES (state) {
    ipcRenderer.send('mergeFiles', state.rootPath)
  },

  GENERATE_FILES (state) {
    ipcRenderer.send('generateFiles', state.rootPath)
  },

  COMPRESS_FILES (state) {
    ipcRenderer.send('compressFiles', state.rootPath)
  }
}

export default new Vuex.Store({
  state,
  mutations
})
