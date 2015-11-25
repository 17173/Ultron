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
.tree-node {
  padding: 8px 0;
}

.tree-node i {
  margin-right: 6px;
}
.active .tree-node {
  background: #C0C5CE;
  margin: 0 -10px;
  padding:8px 0 8px 10px;
  color: #fff;
}
.tree-indent {
  width: 20px;
  display: inline-block;
}
.tree-children {
  padding: 0;
  margin: 0;
}
</style>

<template>
  <li class="tree-item">
    <div class="tree-node" data-file="{{model.fullPath}}" v-on="
      click: activeNode(model.fullPath, model.name),
      dblclick: selectNode(model.fullPath, model.name)
      ">
      <template v-repeat="model.level">
        <span class="tree-indent"></span>
      </template>
      <i class="fa" v-class="
        'fa-angle-right': !open,
        'fa-angle-down': open
      " v-if="isFolder"></i>
      <span class="tree-node-name">{{model.name}}</span>
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
  props: ['model'],
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
  ready() {
  },
  methods: {
    activeNode(filePath, fileName) {
      if (this.isFolder) {
        this.open = !this.open;
      } else {
        this.removeActive();
        this.$el.classList.add('active');
        var content = ipc.sendSync('readFile', filePath);

        // 向上传递
        this.$dispatch('getCode', content, fileName, filePath);
      }
      
    },
    selectNode(filePath, fileName) {
      //this.$dispatch('selectNode', filePath, fileName);
    },
    removeActive() {
      var i = 0;
      var treeNodes = document.querySelectorAll('.tree-item')
      var len = treeNodes.length;
      for(i;i < len;i++) {
        treeNodes[i].classList.remove('active');
      }
    }
  }
}
</script>
