<style>
.tree,
.tree-item {
  list-style: none;
}
.tree {
  padding: 0;
  color: #555;
  font-size: 15px;
}
.tree-name i {
  margin-right: 6px;
}
.tree-name.active {
  background: #C0C5CE;
  margin: 0 -10px 0 0;
  color: #fff;
  border-right: 2px solid #f30;
}
.tree-item {
  margin: 8px 0;
}
.tree-children {
  padding-left: 16px;
}
</style>

<template>
  <li class="tree-item">
    <div class="tree-name" v-class="active: active" v-on="click: nodeHandle(model.fullPath)">
      <i class="fa" v-class="
        'fa-angle-right': !open,
        'fa-angle-down': open
      " v-if="isFolder"></i>{{model.name}}
    </div>
    <ul class="tree-children" v-show="open" v-if="isFolder">
      <tree v-repeat="model: model.children">
        
      </tree>
    </ul>
  </li>
</template>

<script>
import ipc from 'ipc';

module.exports = {
  replace: true,
  props: ['model','onFile'],
  data() {
    return {
      curFile: '',
      active: false,
      open: false
    }
  },
  computed: {
    isFolder() {
      return this.model.children && this.model.children.length;
    }
  },
  methods: {
    nodeHandle(filePath) {
      if (this.isFolder) {
        this.open = !this.open;
      } else {
        this.active = true;
        var content = ipc.sendSync('read-file', filePath);
        // 向上传递
        this.onFile(content);
      }
      
    }
  }
}
</script>
