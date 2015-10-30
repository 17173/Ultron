module.exports = {
  replace: false,
  props: ['model'],
  ready: function() {
    var vm = this;
    vm.$nextTick(function() {
      var mixedMode = {
        name: 'htmlmixed',
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }]
      };

      var cm = CodeMirror(vm.$el, {
        mode: mixedMode,
        lineNumbers: true,
        tabSize: 2,
        //autofocus: true,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-lint-markers','CodeMirror-focused', 'CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
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
      cm.on('change', function() {
        vm.model = cm.getValue();
      });

      this.$watch('model', function(value) {
        cm.setValue(value);
      }, {
        immediate: true
      });

    });
  }
};
