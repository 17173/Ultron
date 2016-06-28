<style>
.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 30px;
  z-index: 1001;
  background: #DFE1E8;
  padding: 4px;
  color: #999;
}
</style>

<template>
  <footer class="footer">
    行 {{codePosition.row}}, 列 {{codePosition.column}}
  </footer>
</template>

<script>
module.exports = {
  vuex: {
    getters: {
      codePosition: state => state.codePosition
    }
  }
}
</script>
