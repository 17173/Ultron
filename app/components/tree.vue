<style>
.tree,
.tree-item {
  list-style: none;
}
.tree {
  padding: 0;
  color: #666;
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
.hover .tree-node {
  color: #000;
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
    <div class="tree-node" data-file="{{model.fullPath}}" 
      @mouseenter="hoverNode"
      @click="activeNode(model.fullPath, model.name)"
      @dblclick="selectNode(model.fullPath, model.name)"
      @contextmenu.prevent="contextmenu(model)">
      <template v-for="level in model.level">
        <span class="tree-indent"></span>
      </template>
      <i class="fa" :class="{
        'fa-angle-right': !open,
        'fa-angle-down': open
        }" v-if="isFolder"></i>
      <span class="tree-node-name">{{model.name}}</span>
    </div>
    <ul class="tree-children" v-show="open" v-if="isFolder">
      <tree v-for="model in model.children" :model="model"></tree>
    </ul>
  </li>
</template>

<script>
const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

const CLS_ACTIVE = 'active';
const CLS_HOVER = 'hover';

module.exports = {
  replace: true,
  name: 'tree',
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
    hoverNode() {
      var classList = this.$el.classList;

      if (!classList.contains(CLS_ACTIVE)) {
        this.removeCls(CLS_HOVER);
        this.$el.classList.add(CLS_HOVER);
      }
    },
    activeNode(filePath, fileName) {
      if (this.isFolder) {
        this.open = !this.open;
      } else {
        this.removeCls([CLS_HOVER, CLS_ACTIVE]);
        this.$el.classList.add(CLS_ACTIVE);
        var content = ipc.sendSync('readFile', filePath);

        // 向上传递
        this.$dispatch('getCode', content, fileName, filePath);
      }
      
    },
    selectNode(filePath, fileName) {
      //this.$dispatch('selectNode', filePath, fileName);
    },
    removeCls(cls) {
      var treeNodes = document.querySelectorAll('.tree-item')
      var len = treeNodes.length;
      for(let i = 0;i < len;i++) {
        if (Array.isArray(cls)) {
          cls.forEach(item => treeNodes[i].classList.remove(item));
        } else {
          treeNodes[i].classList.remove(cls);
        }
        
      }
    },

    contextmenu(model) {
      var self = this;

      var menu = new Menu();
      menu.append(new MenuItem({ 
        label: '重命名', 
        click() {
          self.$dispatch('renameTreeNode', model, self);
        }
      }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ 
        label: '删除',
        click() {
          self.$dispatch('removeTreeNode', model, self);
        } 
      }));

      menu.popup(remote.getCurrentWindow());
    }
  }
}
</script>
