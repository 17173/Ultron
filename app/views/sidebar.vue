<style>
.explore {
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
<template>
  <div class="explore">
    <span class="text-uppercase">explore</span> 
    <span class="pull-right"><i class="fa fa-files-o" @click="openFiles"></i> </span>
    <span class="pull-right refresh-file" v-show="open"><i class="fa fa-refresh" @click="updateFiles"></i></span>
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

  <!-- <div class="no-files" v-if="!open">
    <div class="dnd-file" v-on="
      dragover: dragoverHandle,
      drop: dropHandle
    ">
    将文件拖放到此处
    </div>
  </div> -->
</template>
<script>
  import tree from '../components/tree.vue';

  const ipc = require('electron').ipcRenderer;
  
  module.exports = {
    data() {
      return {
        rootPath: '',
        projectName: '',
        treeData: {},
        selectedFiles: [],
        open: false
      }
    },

    ready() {
      var self = this;
      ipc.on('getFiles', function(event, projectName, files, rootPath) {
        self.$set('projectName', projectName);
        self.$set('rootPath', rootPath);
        self.$set('open', true);
        self.$set('treeData', {
          name: projectName,
          children: files
        });

        self.$dispatch('getRootPath', rootPath);
      });

    },

    created() {
      var self = this;
      this.$on('selectNode', function(filePath, fileName) {
        var exist = false;
        var files = self.$get('selectedFiles');

        files.forEach(function(item) {
          if (item.fullPath === filePath) {
            exist = true;
            return false;
          }
        });

        if (!exist) {
          files.push({
            name: fileName,
            fullPath: filePath
          });
          self.$set('selectedFiles', files);
        }
      });
    },

    methods: {
      updateFiles() {
        ipc.send('updateFiles', this.rootPath);
      },
      
      openFiles() {
        ipc.send('openDialog');
      },
      dropHandle(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files;

        if (files.length) {
          files = files[0];
          this.projectName = files.name;
          this.open = true;
        }
      },
      dragoverHandle(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
      },

    },

    components: {
      tree
    }
  }
</script>
