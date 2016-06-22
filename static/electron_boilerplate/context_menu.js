// This gives you default context menu (cut, copy, paste)
// in all input fields and textareas across your app.

(function () {
    'use strict';

    var remote = require('electron').remote;
    var Menu = remote.Menu;
    var MenuItem = remote.MenuItem;

    var cut = new MenuItem({
        label: "剪切",
        click: function () {
            document.execCommand("cut");
        }
    });

    var copy = new MenuItem({
        label: "复制",
        click: function () {
            document.execCommand("copy");
        }
    });

    var paste = new MenuItem({
        label: "粘贴",
        click: function () {
            document.execCommand("paste");
        }
    });

    var textMenu = new Menu();
    textMenu.append(cut);
    textMenu.append(copy);
    textMenu.append(paste);

    document.addEventListener('contextmenu', function(e) {

        switch (e.target.nodeName) {
            case 'TEXTAREA':
            case 'INPUT':
                e.preventDefault();
                textMenu.popup(remote.getCurrentWindow());
                break;
        }

    }, false);

}());
