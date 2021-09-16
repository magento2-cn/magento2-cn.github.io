require([
    'jquery',
    'knockout',
    'highlight',
    'mousewheel',
    'scrollbar'
], function ($, ko) {
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

        const $search = $('<section id="search"/>').appendTo($sidebar);
        const $nav = $('<section id="nav"/>').appendTo($sidebar);

        let favoursData = JSON.parse(window.localStorage.getItem('notes-favours') || '{}');

        const updateLinks = function () {
            const keyword = viewModel.keyword();
            const links = viewModel.links();
            for (let l = 0; l < links.length; l++) {
                const visible = (keyword == '')
                    ? (links[l]['level'] == 1 || links[l]['parent'] == viewModel.currentPath())
                    : (new RegExp(keyword, 'i')).test(links[l]['title']);
                links[l]['visible'](visible);
            }
        };

        const viewModel = {
            keyword: ko.observable(window.localStorage.getItem('notes-keyword') || ''),
            links: ko.observableArray([]),
            currentPath: ko.observable(null),

            favours: ko.pureComputed(function () {
                const links = viewModel.links();
                let favours = [];
                for (let l = 0; l < links.length; l++) {
                    if (links[l].favoured()) {
                        favours.push(links[l]);
                    }
                }
                return favours;
            }),

            click: function (link) {
                if (link['level'] == 1) {
                    viewModel.currentPath((link['path'] == viewModel.currentPath()) ? null : link['path']);
                    updateLinks();
                    return false;
                }
                return true;
            },

            favour: function (link) {
                link.favoured(!link.favoured());
                if (favoursData[link['path']]) {
                    delete favoursData[link['path']];
                } else {
                    favoursData[link['path']] = true;
                }
                window.localStorage.setItem('notes-favours', JSON.stringify(favoursData));
            }
        };

        $nav.html('<nav class="favours">'
            + '<a class="level-1" data-bind="visible: (favours().length > 0 && keyword() == \'\')"><span>我的收藏</span></a>'
            + '<!-- ko foreach: favours -->'
            + '<a data-bind="attr: {title: title, href: path}, '
            + 'class: (\'favoured level-\' + level), '
            + 'visible: $parent.keyword() == \'\'">'
            + '<span data-bind="text: title"/><span class="favour" data-bind="click: $parent.favour"/>'
            + '</a>'
            + '<!-- /ko -->'
            + '</nav>'
            + '<nav class="links" data-bind="foreach: links">'
            + '<a data-bind="attr: {title: title, href: path}, '
            + 'class: (\'level-\' + level), css: {favoured: favoured, current: (path == $parent.currentPath())}, '
            + 'visible: visible, click: $parent.click">'
            + '<span data-bind="text: title"/><span class="favour" data-bind="click: $parent.favour"/>'
            + '</a>'
            + '</nav>');

        $.ajax({
            url: '/notes/index.json',
            success: function ($source) {
                const collectLinksData = function (tree, parentPath, level) {
                    const keyword = viewModel.keyword();
                    let links = [];
                    for (let c = 0; c < tree.length; c++) {
                        const visible = (keyword == '')
                            ? (level == 1)
                            : (new RegExp(keyword, 'i')).test(tree[c]['title']);
                        links.push({
                            title: tree[c]['title'],
                            path: tree[c]['path'],
                            parent: parentPath,
                            level: level,
                            favoured: ko.observable(favoursData[tree[c]['path']] || false),
                            visible: ko.observable(visible)
                        });
                        if (tree[c]['children']) {
                            links.push.apply(links, collectLinksData(tree[c]['children'], tree[c]['path'], level + 1));
                        }
                    }
                    return links;
                };
                viewModel.links(collectLinksData($source, null, 1));
                $nav.mCustomScrollbar({theme: 'minimal-dark'});
                $win.on('resize', function () {
                    $nav.mCustomScrollbar('update');
                });
            }
        });

        $search.html('<input type="text" placeholder="搜索标题" data-bind="textInput: keyword"/>');
        viewModel.keyword.subscribe(function (keyword) {
            updateLinks();
            window.localStorage.setItem('notes-keyword', keyword);
        });

        ko.applyBindings(viewModel, $sidebar.get(0));
    };

    const initMain = function () {
        window.hljs.highlightAll();
    };

    const initIndex = function () {
        const $sections = $main.find('h2, h3');
        if ($sections.length > 0) {
            $('<h3>本章目录</h3>').appendTo($index);
            const $indexBox = $('<div class="index-box"/>').appendTo($index);

            let idList = [];
            const getUniqueId = function (id) {
                for (let i = 2; i < 9999; i++) {
                    if (idList.indexOf(id) > -1) {
                        id = id + '-' + i;
                    } else {
                        break;
                    }
                }
                idList.push(id);
                return id;
            };

            $sections.each(function () {
                const el = $(this);
                let id = el.attr('id');
                if (!id) {
                    id = getUniqueId(el.text().toLowerCase().replace(/[\s+]/g, '-'));
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
        $footer.html('Copyright &copy; <a target="_blank" href="https://zengliwei.github.io/"><strong>Zengliwei</strong></a>. All rights reserved.');
    };

    initHeader();
    initSidebar();
    initMain();
    initIndex();
    initFooter();

});