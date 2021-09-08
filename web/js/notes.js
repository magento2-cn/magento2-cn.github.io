require([
    'jquery',
    'highlight',
    'mousewheel',
    'scrollbar'
], function ($, highlight) {
    'use strict';

    const $win = $(window);
    const $body = $('body');
    const $main = $body.find('> main');
    const $header = $('<header/>').insertBefore($main);
    const $sidebar = $('<section class="sidebar"/>').insertBefore($main);
    const $index = $('<nav id="index"/>').appendTo($body);
    const $footer = $('<footer/>').appendTo($body);

    const initHeader = function () {
        const $sidebarSwitcher = $('<a id="switcher"></a>').appendTo($header);
        $sidebarSwitcher.on('click', function () {
            $body.hasClass('nav-expanded') ? $body.removeClass('nav-expanded') : $body.addClass('nav-expanded');
        });
    };

    const initSidebar = function () {

        const $search = $('<section id=search/>').appendTo($sidebar);
        const $nav = $('<nav/>').appendTo($sidebar);

        let $navItems;

        const initNav = function () {

            const renderTree = function (tree, $parentNode, level) {
                for (let c = 0; c < tree.length; c++) {
                    const $link = $('<a/>')
                        .attr('title', tree[c].title)
                        .addClass('nav-item')
                        .addClass('level-' + level)
                        .html('<span>' + tree[c].title + '</span>')
                        .appendTo($parentNode);

                    if (tree[c]['children']) {
                        renderTree(tree[c]['children'], $parentNode, level + 1);
                    } else {
                        $link.attr('href', tree[c]['path']);
                    }
                }
            };

            $.ajax({
                url: '/notes/index.json',
                success: function ($source) {
                    renderTree($source, $nav, 1);
                    $navItems = $nav.find('a.nav-item');
                    $nav.mCustomScrollbar({theme: 'minimal-dark'});
                    $win.on('resize', function () {
                        $nav.mCustomScrollbar('update');
                    });
                }
            });
        };

        const initSearch = function () {
            const $searchForm = $('<form/>').appendTo($search);
            const $searchInput = $('<input type="text" placeholder="搜索标题"/>').appendTo($searchForm);

            $searchInput.on('input', function (evt) {
                const q = $searchInput.val().replace(/^s/, '');
                if (q === '') {
                    $navItems.show();
                } else {
                    $navItems.each(function (i, el) {
                        el.innerText.indexOf(q) > -1 ? $(el).show() : $(el).hide();
                    });
                }
            });
        };

        initNav();
        initSearch();
    };

    const initMain = function () {
        window.hljs.highlightAll();
    };

    const initIndex = function () {
        /**
         * @return {string} uuid
         * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
         */
        const uuidv4 = function () {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        };

        const $sections = $main.find('h2, h3');
        if ($sections.length > 0) {
            $('<h3>本章目录</h3>').appendTo($index);
            const $indexBox = $('<div class="index-box"/>').appendTo($index);
            $sections.each(function () {
                const el = $(this);
                let id = el.attr('id');
                if (!id) {
                    id = uuidv4();
                    el.attr('id', id);
                }
                $('<a/>').attr('href', window.location.pathname + '#' + id)
                    .html('<span>' + el.html() + '</span>')
                    .addClass(this.tagName.toLowerCase())
                    .appendTo($indexBox);
            });
            $indexBox.mCustomScrollbar({theme: 'minimal-dark'});
            $win.on('resize', function () {
                $indexBox.mCustomScrollbar('update');
            });
        }
    };

    const initFooter = function () {
        $footer.html('Copyright &copy; <a href="/"><strong>Zengliwei</strong></a>. All rights reserved.');
    };

    initHeader();
    initSidebar();
    initMain();
    initIndex();
    initFooter();

});