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

</style>
<template>
  <div class="explore"><span class="text-uppercase">explore</span> <span class="pull-right"><i class="fa fa-files-o" v-on="click: openFiles"></i> </span></div>
  <div class="working-files">
    <h3 class="sidebar-title">open files</h3>
  </div>

  <div class="project-files">
    <h3 class="sidebar-title">folders</h3>
    <ul class="tree">
      <tree model="{{treeData}}" on-file="{{onTreeFile}}"></tree>
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
  import ipc from 'ipc';
  
  import tree from '../components/tree.vue';
  
  module.exports = {
    props: ['onCurrentFile']，
    data() {
      return {
        projectName: '',
        treeData: {},
        open: false
      }
    },

    ready() {
      var self = this;
      ipc.on('get-files', function(projectName, files) {
        self.$set('projectName', projectName);
        self.$set('open', true);
        self.$set('treeData', {
          name: projectName,
          children: self.parseFiles(files)
        });
      });

    },
    replace: true,

    methods: {
      onTreeFile(content) {
        // 向上传递
        this.onCurrentFile(content);
      },
      parseFiles(files) {
        var self = this;
        var fileObject = {};
        var result = [];
        files.forEach(function(file) {
          var fullPath = file.fullPath.split(/[\/\\]/);
          var fileName = file.name;
          var rootIndex = fullPath.indexOf(fileName);
          var parentPath = fullPath[rootIndex - 1];

          if (parentPath === self.$get('projectName')) {
            result.push({
              directory: file.directory,
              children: [],
              fullPath: file.fullPath,
              name: fileName
            });
          } else {
            result.forEach(function(parentFile, index, array) {
              if (parentPath === parentFile.name) {
                parentFile.children.push({
                  directory: file.directory,
                  children: [],
                  fullPath: file.fullPath,
                  name: fileName
                });
                return false;
              }
            });
          }
          
        });

        return result;
      },
      openFiles() {
        ipc.send('open-dialog');
      },
      dropHandle(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files;

        if (files.length) {
          files = files[0];
          console.log(files.path, files);
          this.projectName = files.name;
          this.open = true;
        }
      },
      dragoverHandle(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
      }
    },

    components: {
      tree
    }
  }
</script>
