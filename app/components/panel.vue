<template>
  <div class="ultron-panel-container">
    <div class="ultron-panel">
      <slot></slot>
    </div>
  </div>
</template>
<style lang="scss">
  .ultron {
    &-panel {
      display: flex;
      flex-direction: column;
      position: relative;
      &-container {
        display: flex;
        flex-direction: column;
        flex: 1;
        &.left {
          flex: none;
          background-color: #E6E9F0;
        }
      }
    }
  }
</style>
