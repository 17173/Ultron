<style>
  .navbar {
    margin: 0;
  }
</style>
<template>
  <nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">奥创</a>
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav navbar-right">
          <li v-show="rootPath"><a href="javascript:;" v-on="click: merge"><i class="fa fa-object-group"></i> 合并</a></li>
          <li v-show="rootPath"><a href="javascript:;" v-on="click: generate"><i class="fa fa-object-ungroup"></i> 生成</a></li>
          <li v-show="rootPath"><a href="javascript:;" v-on="click: compress"><i class="fa fa-file-zip-o"></i> 压缩</a></li>
          <li><a href="javascript:;" v-on="click:showRight = true"><i class="fa fa-question"></i> 帮助</a></li>
        </ul>

      </div>
    </div>
  </nav>
  <aside-modal show="{{@showRight}}" placement="right" header="帮助" width="350">
    <!-- <h4>快捷键</h4>
    <table class="table table-border">
      <tr>
        <td>ctrl+o</td>
        <td>打开目录</td>
      </tr>
    </table> -->
    <h4>组件类型</h4>
    <table class="table table-border">
      <tr>
        <td>类型名</td>
        <td>属性及值</td>
      </tr>
      <tr>
        <td>html</td>
        <td>cms-data-type="html"</td>
      </tr>
      <tr>
        <td>列表</td>
        <td>cms-data-type="list-content"</td>
      </tr>
      <tr>
        <td>组图</td>
        <td>cms-data-type="gallery"</td>
      </tr>
      <tr>
        <td>菜单</td>
        <td>cms-data-type="menu"</td>
      </tr>
      <tr>
        <td>排行榜</td>
        <td>cms-data-type="board"</td>
      </tr>
      <tr>
        <td>图片</td>
        <td>cms-data-type="image"</td>
      </tr>
      <tr>
        <td>视频</td>
        <td>cms-data-type="video"</td>
      </tr>
      <tr>
        <td>组合组件</td>
        <td>cms-data-type="group"</td>
      </tr>
      <tr>
        <td>切换</td>
        <td>cms-data-type="tab"</td>
      </tr>
      
    </table>
  </aside-modal>
</template>
<script>
  import ipc from 'ipc'
  import asideModal from '../components/aside.vue'

  export default {
    props: ['rootPath'],
    data: function() {
      return {
        showRight: false
      };
    },
    methods: {
      merge() {
        ipc.send('mergeFiles', this.rootPath);
      },

      generate() {
        ipc.send('generateFiles', this.rootPath);
      },

      compress() {
        ipc.send('compressFiles', this.rootPath);
      }

      
    },
    components: {
      asideModal
    }
  }
</script>
