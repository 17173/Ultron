import Vue from 'vue'
import Vuex from 'vuex'
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
  open: false
}

const mutations = {
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
