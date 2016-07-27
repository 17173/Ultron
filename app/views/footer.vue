<style>
.footer {
  width: 100%;
  height: 30px;
  line-height: 30px;
  background: #DFE1E8;
  color: #999;
  padding: 0 10px;
  font-size: 11px;
}
</style>

<template>
  <footer class="footer">
    {{filepath}} {{codePosition.row}}:{{codePosition.column}}
  </footer>
</template>

<script>
module.exports = {
  vuex: {
    getters: {
      filepath: state => state.filepath,
      codePosition: state => state.codePosition
    }
  }
}
</script>
