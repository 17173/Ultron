<template >
  <header-view></header-view>
  <div class="container-fluid">
    <div class="row">
      <div class="sidebar">
        <sidebar-view></sidebar-view>
      </div>
      <div class="main">
        <div class="page-header">{{filename}}</div>
        <div id="holder" class="holder" v-show="showCode">拖放文件到这里</div>
        <textarea id="code" v-ace="code" :options="aceOptions"></textarea>
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
          <label for="exampleInputEmail1">文章终极页正文模板</label>
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

import dAce from './directives/ace'

import headerView from './views/header.vue'
import footerView from './views/footer.vue'
import sidebarView from './views/sidebar.vue'

import store from './vuex/store'
import {
  initState,
  updateDB,
  removeDir,
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
    let self = this
    return {
      aceOptions: {
        theme: 'ace/theme/github',
        mode: 'ace/mode/html',
        maxLines: 18,
        minLines: 10,
        fontSize: 13,
        tabSize: 2,
        displayIndentGuides: true,
        showInvisibles: false,
        showPrintMargin: false,
        vScrollBarAlwaysVisible: true,
        // 错误提示
        useWorker: false,
        wrap: 'off',
        change (val) {
          self.updateCode(val)
        }
      },
      showFileOption: false,
      showCode: false,
      showModal: false,
      showSetting: false,
      curFileName: '',
      curModel: null,
      initCode: '',
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
    const holder = document.getElementById('holder')
    holder.ondragover = () => {
      return false
    }
    holder.ondragleave = holder.ondragend = () => {
      return false
    }
    holder.ondrop = (e) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        this.showCode = true
        ipc.send('loadFiles', file.path)
      }
      return false
    }

    this.checkUpdate()

    /* this.editor = CodeMirror.fromTextArea(document.getElementById('code'), {
      mode: {
        name: 'htmlmixed',
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }]
      },
      keyMap: 'sublime',
      lineNumbers: true,
      tabSize: 2,
      // autofocus: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-lint-markers', 'CodeMirror-focused', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      styleActiveLine: true,
      matchBrackets: true,
      lint: false,
      autoCloseBrackets: true,
      autoCloseTags: true,
      showCursorWhenSelecting: true,
      highlightSelectionMatches: {
        showToken: /\w/
      },
      matchTags: {
        bothTags: true
      },
      // 显示行末尾多余的空白
      showTrailingSpace: true,
      scrollbarStyle: 'overlay'
    })
    this.editor.on('change', () => {
      let newVal = this.editor.getValue()

      this.updateCode(newVal)
      if (this.initCode !== newVal) {
        this.updateFile()
      }
      this.updateDB()
    })
    this.editor.on('cursorActivity', instance => {
      var cursor = instance.getCursor()
      var codePosition = {
        line: cursor.line + 1,
        ch: cursor.ch + 1
      }
      this.updateCodePosition(codePosition)
    })*/

    this.initState(() => this.$emit('getCode', this.code, this.filename, this.filepath))
  },
  events: {
    showSettingDialog () {
      this.showSetting = true
    },
    getCode (content, name, filepath) {
      let start = new Date().getTime()
      this.setFileStatus(name, filepath)
      this.initCode = content
      this.updateCode(content)
      // this.editor.setValue(content)
      // this.editor.focus()
      let end = new Date().getTime()
      console.log('editor setValue timer:', end - start, 'ms')
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
    }
  },
  directives: {
    dAce
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
