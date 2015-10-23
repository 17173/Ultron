Vue.directive('codemirror', {
  twoWay: true,
  bind: function() {
    var mixedMode = {
      name: "htmlmixed",
      scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
        mode: null}]
    };

    this.editor = CodeMirror.fromTextArea(this.$el, {
      mode: mixedMode,
      lineNumbers: true,
      selectionPointer: true
    });
    // model主动赋值标记
    this.silent = false;
    this.handler = function() {
      if (!this.silent) {
        this.set(this.editor.getValue(), true); // 加锁，防止相互赋值
      }
    }.bind(this);
    this.editor.on('change', this.handler);
  },
  update: function(value, oldValue) {
    this.silent = true;
    this.editor.setValue(this.vm.$data[this.raw]);
    this.silent = false;
  }
});
