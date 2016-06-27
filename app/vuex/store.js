import Vue from 'vue'
import Vuex from 'vuex'
import jetpack from 'fs-jetpack'
import {ipcRenderer} from 'electron'

Vue.use(Vuex)

const state = {
  treeData: {},
  filepath: '',
  filename: 'untitled',
  rootPath: '',
  code: '',
  codePosition: {
    line: 1,
    ch: 1
  },
  articleModule: 'article-zhuanqu-v3',
  open: false
}

const mutations = {
  INIT_STATE (state, callback) {
    let data = jetpack.read('db.json', 'json')
    if (data) {
      state.filepath = data.filepath
      state.filename = data.filename
      state.rootPath = data.rootPath
      state.code = data.code
      state.articleModule = data.articleModule
      ipcRenderer.send('loadFiles', data.rootPath)
      callback()
    }
  },
  UPDATE_DB (state) {
    jetpack.write('db.json', {
      rootPath: state.rootPath,
      filepath: state.filepath,
      filename: state.filename,
      code: state.code,
      articleModule: state.articleModule
    })
  },
  SET_ROOT_PATH (state, rootPath) {
    state.rootPath = rootPath
  },
  OPEN_FILE_DIALOG () {
    ipcRenderer.send('openDialog')
  },
  SET_TREE_DATA (state, data) {
    state.treeData = data
    state.open = true
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
  GET_FILE (state, filepath) {
    state.code = ipcRenderer.sendSync('readFile', filepath)
  },
  UPDATE_CODE (state, code) {
    state.code = code
  },
  CHECK_UPDATE (state) {
    ipcRenderer.send('checkUpdate')
  },
  UPDATE_CODE_POSITION (state, codePosition) {
    state.codePosition = codePosition
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
