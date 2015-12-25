<style>
  .file-option {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    z-index: 1002;
    background: #DFE1E8;
    color: #999;
    padding-left: 10px;
  }
  .file-option input {
    border: 0;
    background: transparent;
  }
  .file-option input:focus {
    outline: none;
  }
</style>

<template>
  <div class="file-option"
    @keyup.esc="close"
    @keyup.enter="save"
    v-show="show">
    新的名称：<input type="text" v-model="fileName">
  </div>
</template>

<script>
module.exports = {
  replace: true,
  data() {
    return {
      oldFileName: ''
    }
  },
  props: {
    show: {
      type: Boolean,
      require: true,
      twoWay: true
    },
    fileName: {
      type: String,
      default: ''
    },
  },

  methods: {
    close() {
      this.$set('show', false);
    },
    save() {
      this.$dispatch('saveFileName');
    }
  }
}
</script>
