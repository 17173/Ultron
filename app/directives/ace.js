import Vue from 'vue'
Vue.directive('ace', {
  twoWay: true,
  params: ['options'],
  bind () {
    let editor = this.editor = ace.edit(this.el)
    editor.setOptions(this.params.options)

    editor.on('change', () => {
      this.params.options.change(editor.getValue())
    })
  },

  update (value) {
    this.el.value = value
    this.editor.setValue(value)
  },

  unbind () {
    this.editor.destroy()
  }
})
