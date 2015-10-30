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
        <a class="navbar-brand" href="#">Ultron</a>
      </div>
      <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav navbar-right">
          <li v-show="rootPath"><a href="javascript:;" v-on="click: merge"><i class="fa fa-object-group"></i> 合并</a></li>
          <li v-show="rootPath"><a href="javascript:;" v-on="click: generate"><i class="fa fa-object-ungroup"></i> 生成</a></li>
          <li v-show="rootPath"><a href="javascript:;" v-on="click: compress"><i class="fa fa-file-zip-o"></i> 压缩</a></li>
          <li><a href="javascript:;" v-on="click: showRight = true"><i class="fa fa-question"></i> 帮助</a></li>
        </ul>

      </div>
    </div>
  </nav>
</template>
<script>
  import ipc from 'ipc'

  export default {
    props: ['rootPath'],
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
    }
  }
</script>
