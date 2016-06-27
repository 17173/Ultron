<template>
  <div class="explore">
    <span class="text-uppercase">explore</span> 
    <span class="pull-right" @click="openFileDialog"><i class="fa fa-files-o"></i> 打开</span>
    <span class="pull-right refresh-file" v-show="open" @click="updateAllFiles"><i class="fa fa-refresh"></i> 刷新</span>
  </div>
  <!-- <div class="working-files">
    <h3 class="sidebar-title">open files</h3>
    <ul class="list-unstyled selected-file" v-repeat="selectedFile in selectedFiles">
      <li><i class="fa fa-close"></i> {{selectedFile.name}}</li>
    </ul>
  </div> -->

  <div class="project-files">
    <h3 class="sidebar-title">folders</h3>
    <ul class="tree">
      <tree :model="treeData"></tree>
    </ul>
  </div>
</template>
<script>
  import tree from '../components/tree.vue'

  import {
    setTreeData,
    setRootPath,
    openFileDialog,
    updateDB,
    updateAllFiles
  } from '../vuex/actions'

  const ipc = require('electron').ipcRenderer
  
  module.exports = {
    vuex: {
      getters: {
        treeData: state => state.treeData,
        open: state => state.open
      },
      actions: {
        setTreeData,
        setRootPath,
        openFileDialog,
        updateDB,
        updateAllFiles
      }
    },
    data () {
      return {
        selectedFiles: []
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
          children: files
        })
        this.setRootPath(rootPath)
        this.updateDB()
      })
    },

    created () {
      var self = this
      this.$on('selectNode', (filePath, fileName) => {
        var exist = false
        var files = self.$get('selectedFiles')

        files.forEach(item => {
          if (item.fullPath === filePath) {
            exist = true
            return false
          }
        })

        if (!exist) {
          files.push({
            name: fileName,
            fullPath: filePath
          })
          self.$set('selectedFiles', files)
        }
      })
    },

    components: {
      tree
    }
  }
</script>
<style>
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
