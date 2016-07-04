<template>
  <div class="tree-view-resizer" :style="{width: width + 'px'}">
    <ul class="tree">
      <tree :model="treeData" :filepath="filepath"></tree>
    </ul>
    <resizer :size.sync="width" :min-size="168"></resizer>
  </div>
</template>
<script>
  import tree from '../components/tree.vue'
  const resizer = require('vue-resize-handle/unidirectional')
  import {
    setTreeData,
    setRootPath,
    openFileDialog,
    updateDB,
    readFile,
    updateAllFiles
  } from '../vuex/actions'

  const ipc = require('electron').ipcRenderer
  
  module.exports = {
    vuex: {
      getters: {
        treeData: state => state.treeData,
        filepath: state => state.filepath
      },
      actions: {
        setTreeData,
        setRootPath,
        readFile,
        openFileDialog,
        updateDB,
        updateAllFiles
      }
    },
    data () {
      return {
        selectedFiles: [],
        width: 360
      }
    },

    computed: {
      projectName () {
        return this.treeData.name
      }
    },

    ready () {
      ipc.on('getFiles', (event, projectName, files, rootPath) => {
        this.setTreeData({
          name: projectName,
          fullPath: rootPath,
          open: true,
          children: files
        })
        // this.readFile(this.filepath)
        this.setRootPath(rootPath)
        this.updateDB()
      })
    },

    created () {
      var self = this
      this.$on('selectNode', (filepath, filename) => {
        var exist = false
        var files = self.$get('selectedFiles')

        files.forEach(item => {
          if (item.fullPath === filepath) {
            exist = true
            return false
          }
        })

        if (!exist) {
          files.push({
            name: filename,
            fullPath: filepath
          })
          self.$set('selectedFiles', files)
        }
      })
    },

    methods: {
      onResize (event) {
        console.log(event.clientX)
        // this.setTreeWidth(event.clientX)
      }
    },

    components: {
      tree,
      resizer
    }
  }
</script>
<style lang="scss">
.tree {
  &-view {
    &-resizer {
      min-width: 100px;
      display: flex;
      flex: 1;
      flex-direction: column;
      -webkit-user-select: none;
    }
    &-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 4px;
      cursor: col-resize;
      z-index: 3;
    }
  }
}
.project-files {
  margin-top: 20px;
}
.sidebar,
.sidebar h2,
.sidebar h3{
  font-size: 16px;
}
.dnd-file {
  border: 1px dashed #ccc;
  border-radius: 5px;
  background: #fff;
  padding: 20px;
  font-size: 14px;
  text-align: center;

}
.sidebar-title {
  text-transform: uppercase;
  color: #999;
}
.selected-file .fa {
  font-size: 12px;
}
.refresh-file {
  margin-right: 8px;
}
</style>
