<style>
/*
 * Base structure
 */

/* Move down content because we have a fixed navbar that is 50px tall */
body {
  padding-top: 50px;
}


/*
 * Global add-ons
 */

.sub-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/*
 * Top navigation
 * Hide default border to remove 1px line.
 */
.navbar-fixed-top {
  border: 0;
}

/*
 * Sidebar
 */

/* Hide for mobile, show later */
.sidebar {
  display: none;
}
@media (min-width: 768px) {
  .sidebar {
    position: fixed;
    top: 51px;
    bottom: 0;
    left: 0;
    z-index: 1000;
    display: block;
    padding: 10px;
    overflow-x: hidden;
    overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
    background-color: #E6E9F0;
    border-right: 1px solid #eee;
  }
}

/* Sidebar navigation */
.nav-sidebar {
  margin-right: -11px; /* 20px padding + 1px border */
  margin-bottom: 10px;
  margin-left: -10px;
}
.nav-sidebar > li > a {
  padding-right: 10px;
  padding-left: 10px;
}
.nav-sidebar > .active > a,
.nav-sidebar > .active > a:hover,
.nav-sidebar > .active > a:focus {
  color: #fff;
  background-color: #428bca;
}


/*
 * Main content
 */

.main {
  padding-bottom: 30px;
}
@media (min-width: 768px) {
  .main {

  }
}
.main .page-header {
  margin: 0;
}


/*
 * Placeholder dashboard ideas
 */

.placeholders {
  margin-bottom: 30px;
  text-align: center;
}
.placeholders h4 {
  margin-bottom: 0;
}
.placeholder {
  margin-bottom: 20px;
}
.placeholder img {
  display: inline-block;
  border-radius: 50%;
}

</style>
<template>
  <header-view root-path="{{rootPath}}"></header-view>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-4 col-md-3 sidebar">
        <sidebar-view></sidebar-view>
      </div>
      <div class="col-sm-8 col-sm-offset-4 col-md-10 col-md-offset-3 main">
        <div class="page-header">{{fileName}}</div>
        <textarea id="code"></textarea>
      </div>
    </div>
  </div>
  <footer-view code-position="{{codePosition}}"></footer-view>
</template>
<script>
import headerView from './views/header.vue'
import footerView from './views/footer.vue'
import sidebarView from './views/sidebar.vue'
import ipc from 'ipc'
/*import plugins from 'electron-plugins'

document.addEventListener('DOMContentLoaded', function () {
    var context = { document: document }
    plugins.load(context, function (err, loaded) {
        if(err) return console.error(err)
        console.log('Plugins loaded successfully.')
    })
})

ipc.on('update-available', function () {
    console.log('there is an update available for download')
})
*/
export default {
  data () {
    return {
      filePath: '',
      fileName: 'undefined-1',
      code: '',
      codePosition: {
        line: 1,
        ch: 1
      }
    }
  },
  ready() {
    var self = this;

    this.editor = CodeMirror.fromTextArea(document.getElementById('code'), {
      mode: {
        name: 'htmlmixed',
        scriptTypes: [{
          matches: /\/x-handlebars-template|\/x-mustache/i,
          mode: null
        }]
      },
      keyMap: 'sublime',
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
      showCursorWhenSelecting: true,
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
    this.editor.on('change', function() {
      self.$set('code', self.editor.getValue());
    });
    this.editor.on('cursorActivity', function(instance) {
      var cursor = instance.getCursor();
      var codePosition = {
        line: cursor.line + 1,
        ch: cursor.ch + 1
      };

      self.$set('codePosition', codePosition);
    }); 
    
  },
  created() {
    var self = this;

    this.$on('getCode', function(content, name, filePath) {
      self.$set('fileName', name);
      self.$set('filePath', filePath);
      self.editor.setValue(content);
    });

    this.$on('getRootPath', function(rootPath) {
      self.$set('rootPath', rootPath);
    });

    this.$watch('code', function(newVal) {
      if (this.filePath) {
        ipc.send('writeFile', self.filePath, newVal);
      }
      
    });
  },

  methods: {
    
  },
  directives: {
  },
  components: {
    headerView,
    sidebarView,
    footerView
  }
}
</script>
