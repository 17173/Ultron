<template>
  <header-view></header-view>
  <div class="ultron-workspace">
    <div class="ultron-workspace-axis">
      <ultron-panel class="left">
        <sidebar-view></sidebar-view>
      </ultron-panel>
      <ultron-panel class="vertical">
        <div class="ultron-code-container">
          <textarea id="code"></textarea>
        </div>
      </ultron-panel>
    </div>
    <footer-view></footer-view>
  </div>
  <file-option :show.sync="showFileOption" :file-name.sync="curFileName"></file-option>
  <modal :show.sync="showModal" title="提示信息" content="不能删除 merge 目录！"></modal>
  <modal :show.sync="showSetting" title="设置" :has-footer="false">
    <div slot="bd">
      <form>
        <fieldset class="form-group">
          <label>文章终极页正文模板</label>
          <multiselect
            :selected="articleModule"
            :options="articleMods"
            :on-change="onChangeArticle"
            :multiple="false"
            :searchable="false"
            placeholoder="请选择"
            label="label"
            key="value"
          >
          </multiselect>
        </fieldset>
      </form>
    </div>
  </modal>
</template>
<script>
import Multiselect from 'vue-multiselect'
import fileOption from './components/option.vue'
import modal from './components/modal.vue'
import ultronPanel from './components/panel.vue'

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
  setArticleModule,
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
      codePosition: state => state.codePosition,
      articleModule: state => state.articleModule
    },
    actions: {
      initState,
      updateDB,
      readFile,
      setFileStatus,
      setRootPath,
      setArticleModule,
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
      articleMods: [],
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
    this.silent = false
    ipc.on('renameFileSuccess', (event, newPath) => {
      var model = this.$get('curModel')
      model.fullPath = newPath
      this.updateTreeData(model)
    })
    ipc.on('afterCheckUpdate', (event, articleMods) => {
      this.articleMods = articleMods
      if (!this.articleModule) {
        let articleModule = articleMods.filter(item => item.default)[0]
        this.setArticleModule(articleModule)
        this.updateDB()
      }
    })
  },
  ready () {
    this.checkUpdate()

    this.initEditor()

    this.initState(() => this.renderEditor(), () => this.updateDB())
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

    initEditor () {
      let editor = this.editor = ace.edit(document.getElementById('code'))

      editor.setOptions({
        theme: 'ace/theme/github',
        mode: 'ace/mode/html',
        maxLines: Infinity,
        minLines: 10,
        fontSize: 13,
        tabSize: 2,
        displayIndentGuides: true,
        showInvisibles: false,
        showPrintMargin: false,
        vScrollBarAlwaysVisible: false,
        // 错误提示
        useWorker: false,
        wrap: 'off'
      })
      editor.$blockScrolling = Infinity
      editor.on('change', () => {
        if (this.silent || !this.filepath) return
        console.log('editor change and cursor position: ', this.editor.getCursorPosition())
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
      // editor.moveCursorTo(0, 0)
    },

    renderEditor () {
      let t1 = new Date().getTime()
      this.silent = true
      this.editor.setValue(this.code)
      this.editor.moveCursorTo(0, 0)
      this.silent = false
      let t2 = new Date().getTime()
      console.info('%c[ultron info] ace.setValue spend %d ms', 'color: #f00', t2 - t1)
    },

    onChangeArticle (obj) {
      if (!obj) return
      console.log('change article value ', obj)
      this.setArticleModule(obj)
      this.updateDB()
    }
  },
  components: {
    modal,
    ultronPanel,
    Multiselect,
    fileOption,
    headerView,
    sidebarView,
    footerView
  }
}
</script>
<style lang="scss">
/*
 * Base structure
 */

/* Move down content because we have a fixed navbar that is 50px tall */
html, body {
  height: 100%;
}
body {
  padding-top: 54px;
}

/*
 * Top navigation
 * Hide default border to remove 1px line.
 */
.navbar-fixed-top {
  border: 0;
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
.ultron {
  &-workspace {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;

    &-axis {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
  }
  &-code {
    &-container {
      overflow: auto;
    }
  }
}
</style>
