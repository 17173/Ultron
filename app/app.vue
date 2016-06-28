<template >
  <header-view></header-view>
  <div class="container-fluid">
    <div class="row">
      <div class="sidebar">
        <sidebar-view></sidebar-view>
      </div>
      <div class="main">
        <div class="page-header">{{filename}}</div>
        <textarea id="code"></textarea>
      </div>
    </div>
  </div>
  <footer-view></footer-view>
  <file-option :show.sync="showFileOption" :file-name.sync="curFileName"></file-option>
  <modal :show.sync="showModal" title="提示信息" content="不能删除 merge 目录！"></modal>
  <modal :show.sync="showSetting" title="设置">
    <div slot="bd">
      <form>
        <fieldset class="form-group">
          <label>文章终极页正文模板</label>
          <select class="form-control">
            <option value="article-zhuanqu-v3">article-zhuanqu-v3.shtml</option>
            <option value="article-zhuanqu-v2">article-zhuanqu-v2.shtml</option>
          </select>
        </fieldset>
      </form>
    </div>
    <div slot="ft">
      <button type="button" class="btn btn-primary">保存</button>
    </div>
  </modal>
</template>
<script>
import fileOption from './components/option.vue'
import modal from './components/modal.vue'

import headerView from './views/header.vue'
import footerView from './views/footer.vue'
import sidebarView from './views/sidebar.vue'

import store from './vuex/store'
import {
  initState,
  updateDB,
  removeDir,
  readFile,
  setFileStatus,
  setRootPath,
  renameFile,
  updateFile,
  updateCode,
  updateCodePosition,
  checkUpdate
} from './vuex/actions'

const ipc = require('electron').ipcRenderer

const MERGE = 'merge'

export default {
  store: store,
  vuex: {
    getters: {
      filepath: state => state.filepath,
      filename: state => state.filename,
      code: state => state.code,
      rootPath: state => state.rootPath,
      codePosition: state => state.codePosition
    },
    actions: {
      initState,
      updateDB,
      readFile,
      setFileStatus,
      setRootPath,
      renameFile,
      removeDir,
      updateFile,
      updateCode,
      updateCodePosition,
      checkUpdate
    }
  },

  data () {
    return {
      aceOptions: {
        theme: 'ace/theme/github',
        mode: 'ace/mode/html',
        maxLines: Infinity,
        minLines: 10,
        fontSize: 13,
        tabSize: 2,
        displayIndentGuides: true,
        showInvisibles: false,
        showPrintMargin: false,
        vScrollBarAlwaysVisible: true,
        // 错误提示
        useWorker: false,
        wrap: 'on'
      },
      showFileOption: false,
      showCode: false,
      showModal: false,
      showSetting: false,
      curFileName: '',
      curModel: null,
      oldFileName: ''
    }
  },
  created () {
    ipc.on('renameFileSuccess', (event, newPath) => {
      var model = this.$get('curModel')
      model.fullPath = newPath
      self.updateTreeData(model)
    })
  },
  ready () {
    this.checkUpdate()
    let editor = this.editor = ace.edit(document.getElementById('code'))

    editor.setOptions(this.aceOptions)
    editor.$blockScrolling = Infinity
    editor.on('change', () => {
      this.updateCode(editor.getValue())
      this.updateFile()
      this.updateDB()
    })
    editor.session.selection.on('changeCursor', () => {
      let pos = editor.getCursorPosition()

      pos.row = pos.row + 1
      pos.column = pos.column + 1
      this.updateCodePosition(pos)
    })
    editor.moveCursorTo(0, 0)
    this.initState(() => this.renderEditor())
  },
  events: {
    showSettingDialog () {
      this.showSetting = true
    },
    onTreeClick (filepath, filename) {
      this.readFile(filepath)

      this.setFileStatus(filename, filepath)
      this.renderEditor()
      this.updateDB()
    },

    removeTreeNode (model, vm) {
      if (MERGE === model.name) {
        this.$set('showModal', true)
        return false
      }
      this.removeDir(model.fullPath)
      vm.$el.remove()
    },

    renameTreeNode (model, vm) {
      this.$set('curFileName', model.name)
      this.$set('curModel', model)
      this.$set('oldFileName', model.name)
      this.$set('showFileOption', true)
    },

    saveFileName () {
      var model = this.$get('curModel')

      model.name = this.curFileName
      this.renameFile(model.fullPath, this.curFileName)
    }
  },
  methods: {
    // 更新树节点路径
    updateTreeData (model) {
      var self = this
      if (model.children.length) {
        model.children.forEach(item => {
          item.fullPath = `${model.fullPath}/${item.name}`
          self.updateTreeData(item)
        })
      }
    },

    renderEditor () {
      let t1 = new Date().getTime()
      this.editor.setValue(this.code)
      this.editor.moveCursorTo(0, 0)
      let t2 = new Date().getTime()
      console.info('%c[ultron info] ace.setValue spend %d ms', 'color: #f00', t2 - t1)
    }
  },
  components: {
    modal,
    fileOption,
    headerView,
    sidebarView,
    footerView
  }
}
</script>
<style>
/*
 * Base structure
 */

/* Move down content because we have a fixed navbar that is 50px tall */
body {
  padding-top: 50px;
}


/*
 * Global add-ons
 */

.sub-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/*
 * Top navigation
 * Hide default border to remove 1px line.
 */
.navbar-fixed-top {
  border: 0;
}

/*
 * Sidebar
 */

/* Hide for mobile, show later */
.sidebar {
  display: none;
  width: 26%;
}
.sidebar, .main {
  float: left;
}
@media (min-width: 768px) {
  .sidebar {
    position: fixed;
    top: 51px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 10px;
    overflow-x: hidden;
    overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
    background-color: #E6E9F0;
    border-right: 1px solid #eee;
  }
}

/* Sidebar navigation */
.nav-sidebar {
  margin-right: -11px; /* 20px padding + 1px border */
  margin-bottom: 10px;
  margin-left: -10px;
}
.nav-sidebar > li > a {
  padding-right: 10px;
  padding-left: 10px;
}
.nav-sidebar > .active > a,
.nav-sidebar > .active > a:hover,
.nav-sidebar > .active > a:focus {
  color: #fff;
  background-color: #428bca;
}


/*
 * Main content
 */

.main {
  padding-bottom: 30px;
  margin-left: 26%;
  width: 74%;
}
@media (min-width: 768px) {
  .main {

  }
}
.main .page-header {
  margin: 0;
  padding-left: 4px;
  padding-top: 4px;
  font-weight: 700;
}


/*
 * Placeholder dashboard ideas
 */

.placeholders {
  margin-bottom: 30px;
  text-align: center;
}
.placeholders h4 {
  margin-bottom: 0;
}
.placeholder {
  margin-bottom: 20px;
}
.placeholder img {
  display: inline-block;
  border-radius: 50%;
}
.holder {
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 80px;
  text-align: center;
  font-size: 20px;
}

</style>
