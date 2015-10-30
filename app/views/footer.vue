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
    行 {{codePosition.line}}, 列 {{codePosition.ch}}
  </footer>
</template>

<script>
module.exports = {
  replace: true,
  props: ['codePosition']
}
</script>
