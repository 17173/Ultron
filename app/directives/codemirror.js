Vue.directive('codemirror', {
  twoWay: true,
  bind: function() {
    var mixedMode = {
      name: 'htmlmixed',
      scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
        mode: null}]
    };

    this.editor = CodeMirror.fromTextArea(this.el, {
      mode: mixedMode,
      lineNumbers: true,
      tabSize: 2,
      autofocus: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      styleActiveLine: true,
      matchBrackets: true,
      lint: false,
      autoCloseBrackets: true,
      highlightSelectionMatches: {
        showToken: /\w/
      },
      matchTags: {
        bothTags: true
      },
      //显示行末尾多余的空白
      showTrailingSpace: true,
      scrollbarStyle: 'overlay'
    });
    // model主动赋值标记
    //this.silent = false;
    this.handler = function() {
      //if (!this.silent) {
      this.$set(this.raw, this.editor.getValue());
        //this.$set(this.editor.getValue(), true); // 加锁，防止相互赋值
      //}
    }.bind(this);
    this.editor.on('change', this.handler);
  },
  update: function(value, oldValue) {
    //this.silent = true;
    this.editor.setValue(this.vm.$data[this.raw]);
    //this.silent = false;
  }
});
