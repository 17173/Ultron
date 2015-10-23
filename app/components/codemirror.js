module.exports = {
  replace: false,
  props: ['model'],
  ready: function() {
    var vm = this;
    vm.$nextTick(function() {
      var mixedMode = {
        name: 'htmlmixed',
        scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null}]
      };

      var cm = CodeMirror(vm.$el, {
        mode: mixedMode,
        lineNumbers: true,
        selectionPointer: true
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
