<template>
  <nav class="navbar navbar-dark bg-inverse navbar-fixed-top">
    <div class="container-fluid">
      <a class="navbar-brand" href="#"><img class="electron-icon" :src="logoUrl"><span class="project-name">奥创</span></a>
      <div class="btn-group">
        <button type="button" class="btn btn-link" @click="openFileDialog"><i class="fa fa-files-o"></i> 打开</button>
        <button type="button" class="btn btn-link" v-show="rootPath" @click="updateAllFiles"><i class="fa fa-refresh"></i> 刷新</button>
      </div>
      <ul class="nav navbar-nav pull-right">
        <li class="nav-item" v-show="rootPath"><a class="nav-link" href="javascript:;" @click="generateFiles"><i class="fa fa-object-ungroup"></i> 生成</a></li>
        <li class="nav-item" v-show="rootPath"><a class="nav-link" href="javascript:;" @click="compressFiles"><i class="fa fa-file-zip-o"></i> 压缩</a></li>
        <li class="nav-item" v-show="previewUrl"><a class="nav-link" :href="previewUrl" target="_blank"><i class="fa fa-eye"></i> 预览</a></li>
        <li class="nav-item"><a class="nav-link" href="javascript:;" @click="showRight = true"><i class="fa fa-question"></i> 帮助</a></li>
        <li class="nav-item"><a class="nav-link" href="javascript:;" @click="onSetting"><i class="fa fa-wrench"></i> 设置</a></li>
      </ul>
    </div>
  </nav>
  <aside-modal :show.sync="showRight" placement="right" header="帮助">
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
        <td>图片</td>
        <td>cms-data-type="image"</td>
      </tr>
      <tr>
        <td>视频</td>
        <td>cms-data-type="video"</td>
      </tr>
      <tr>
        <td>Tab</td>
        <td>cms-data-type="tab"</td>
      </tr>
      <tr>
        <td>排行榜</td>
        <td>cms-data-type="board"</td>
      </tr>
      <tr>
        <td>投票</td>
        <td>cms-data-type="gallery"</td>
      </tr>
      <tr>
        <td>第三方</td>
        <td>cms-data-type="gallery"</td>
      </tr>
      <tr>
        <td>菜单</td>
        <td>cms-data-type="menu"</td>
      </tr>
      <tr>
        <td>组合组件</td>
        <td>cms-data-type="group"</td>
      </tr>
    </table>
  </aside-modal>
</template>
<script>
  import asideModal from '../components/aside.vue'
  import {
    mergeFiles,
    generateFiles,
    openFileDialog,
    updateAllFiles,
    compressFiles
  } from '../vuex/actions'

  const ipc = require('electron').ipcRenderer

  const PREVIEW_FILE = '页面预览.txt'

  export default {
    vuex: {
      getters: {
        rootPath: state => state.rootPath
      },
      actions: {
        openFileDialog,
        updateAllFiles,
        mergeFiles,
        generateFiles,
        compressFiles
      }
    },
    data () {
      return {
        logoUrl: 'static/img/electron-icon.svg',
        previewUrl: '',
        showRight: false
      }
    },

    created () {
      this.$watch('rootPath', newVal => {
        this.$set('previewUrl', ipc.sendSync('readFile', newVal + '/' + PREVIEW_FILE))
      })
    },
    methods: {
      onSetting () {
        this.$dispatch('showSettingDialog')
      }
    },
    components: {
      asideModal
    }
  }
</script>
<style>
  .navbar {
    margin: 0;
  }
  .navbar .electron-icon {
    height: 20px;
    display: inline-block;
    margin-right: 0.4em;
  }
  .navbar .btn-group {
    margin-left: 60px;
  }
  .navbar .btn-link {
    color: rgba(255,255,255,.75);
    text-decoration: none;
    outline: none;
  }
</style>
