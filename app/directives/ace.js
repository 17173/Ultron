import Vue from 'vue'
Vue.directive('ace', {
  twoWay: true,
  params: ['options'],
  bind () {
    let editor = this.editor = ace.edit(this.el)
    editor.setOptions(this.params.options)
    editor.$blockScrolling = Infinity
    this.silent = false
    this.handler = () => {
      if (!this.silent) {
        console.log('change')
        this.params.options.change(editor.getValue())
      }
    }
    editor.on('change', this.handler)
    editor.session.selection.on('changeCursor', () => {
      let pos = editor.getCursorPosition()

      pos.row = pos.row + 1
      pos.column = pos.column + 1
      this.params.options.changeCursor(pos)
    })
    editor.focus()
  },

  update (value) {
    console.log('update')
    this.silent = true
    this.editor.setValue(value)
    // this.editor.clearSelection()
    this.silent = false
  },

  unbind () {
    this.editor.destroy()
  }
})
