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
    {{filename}} {{codePosition.row}}:{{codePosition.column}}
  </footer>
</template>

<script>
module.exports = {
  vuex: {
    getters: {
      filename: state => state.filename,
      codePosition: state => state.codePosition
    }
  }
}
</script>
