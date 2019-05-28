require.config( {
    waitSeconds: 0,
    paths: {
        jquery: 'web/js/jquery',
        text: 'web/js/text',
        markdown: 'web/js/showdown.min',
        mousewheel: 'web/js/jquery.mousewheel-3.0.6.min',
        scrollbar: 'web/js/jquery.mCustomScrollbar.min',
        progress: 'web/js/reading-progress'
    },
    shim: {
        mousewheel: {
            deps: [ 'jquery' ]
        },
        scrollbar: {
            deps: [ 'jquery', 'mousewheel' ]
        }
    }
} );

/**
 * Additional processing
 * 
 * @param {Object} $
 */
require( [ 'jquery' ], function( $ ) {

    /**
     * Add direction flag in scroll event
     * down: 1, up: -1
     */
    let scrollTop = $( document ).scrollTop();
    $( document ).on( 'scroll', function( evt ) {
        let tmpScrollTop = $( document ).scrollTop();
        evt.dir = tmpScrollTop > scrollTop ? 1 : -1;
        scrollTop = tmpScrollTop;
    } );

} );

/**
 * Web page rendering
 * 
 * @param {Object} $
 * @param {String} index
 * @param {Object} markdown
 */
require( [ 'jquery', 'text!index.json', 'markdown', 'mousewheel', 'progress' ], function( $, index, markdown ) {

    const elBody = $( 'body' );
    const elHeader = $( 'body > header' );
    const elMain = $( 'body > main' );
    const elFooter = $( 'body > footer' );

    const markdownConverter = new markdown.Converter();
    const indexData = JSON.parse( index );
    const baseUrl = window.location.origin;

    /**
     * @argument {Object} opts 
     */
    const buildMenu = function( opts ) {

        opts = $.extend( true, {
            data: [ ],
            container: null,
            clsActive: 'active',
            clsCurrent: 'current',
            clsHover: 'hover',
            clsParent: 'parent'
        }, opts );

        const generateMenuHtml = function( data, level ) {
            level = level || 1;
            let html = '<ul>';
            for ( let i in data ) {
                data[i].title;
                html += '<li class="item' + (data[i].children ? (' ' + opts.clsParent) : '') + '">' +
                        '<a href="' + (data[i].href || 'javascript:;') + '"><span>' + data[i].title + '</span></a>';
                if ( data[i].children ) {
                    html += generateMenuHtml( data[i].children, level + 1 );
                }
                html += '</li>';
            }
            html += '</ul>';
            return html;
        };

        let menu = $( opts.container ).html( generateMenuHtml( opts.data ) );

        menu.find( 'li' ).on( 'mouseenter', function() {
            $( this ).addClass( opts.clsHover );
        } ).on( 'mouseleave', function() {
            $( this ).removeClass( opts.clsHover );
        } );

        menu.find( 'a' ).each( function() {
            if ( window.location.href.indexOf( this.href ) === 0 ) {
                let el = $( this );
                el.parent( 'li' ).addClass( opts.clsCurrent ).parents( 'li' ).addClass( opts.clsActive );
            }
        } );

    };

    const updateStage = function( evt ) {
        let scrollTop = $( document ).scrollTop();
        if ( elBody.hasClass( 'home' ) && scrollTop < headerH ) {
            elHeader.addClass( 'hide-bg' );
        } else {
            elHeader.removeClass( 'hide-bg' );
        }
        if ( evt && evt.dir === 1 && scrollTop > headerH ) { // close
            elHeader.addClass( 'close' );
            $( document ).trigger( 'close_header' );
        } else if ( evt && evt.dir === -1 ) {
            $( document ).trigger( 'open_header' );
            elHeader.removeClass( 'close' );
        }
    };

    const initHeader = function() {
        elHeader.html( '<div class="box"><div class="content"><div class="logo"><a href="index.html"><img src="web/images/logo.png" /></a></div><nav></nav></div></div>' );
        buildMenu( {
            data: indexData.main,
            container: elHeader.find( 'nav' )
        } );
        headerH = elHeader.outerHeight();
    };

    const initMain = function() {
        let elArticleSource = elMain.find( '#article-source' );
        if ( elArticleSource.length > 0 ) {
            let elArticle = elMain.find( 'article' );
            elArticle.addClass( 'has-content' )
                    .append( '<div class="content">' + markdownConverter.makeHtml( elArticleSource.text() ) + '</div><div class="index"></div>' );
            elArticleSource.remove();

            let elIndexer = elArticle.find( '> .index' );
            elArticle.find( '> .content' ).readingProgress( {
                elProgressBox: elIndexer,
                onInitialized: function( elProgressBox ) {
                    elProgressBox.find( 'li.idx a' ).before( '<div class="progress"></div>' );
                },
                onUpdate: function( indexElms ) {
                    for ( let i = 0; i < indexElms.length; i++ ) {
                        indexElms[i].find( '.progress' ).css( 'width', indexElms[i].data( 'read-progress' ) + '%' );
                    }
                }
            } );
            $( document ).on( 'close_header', function() {
                elIndexer.addClass( 'top' );
            } );
            $( document ).on( 'open_header', function() {
                elIndexer.removeClass( 'top' );
            } );
        }

        let elNav = elMain.find( '> aside' );
        if ( elNav.length > 0 ) {
            let paths = window.location.href.substr( baseUrl.length ).replace( /^\/*(.*)/, '$1' ).split( '/' );
            if ( paths.length >= 2 ) {
                $.ajax( {
                    url: baseUrl + '/' + paths[0] + '/' + paths[1] + '/index.json',
                    dataType: 'json',
                    success: function( result ) {
                        elNav.html( '<nav></nav>' );
                        buildMenu( {
                            data: result,
                            container: elNav.find( 'nav' )
                        } );
                        $( document ).on( 'close_header', function() {
                            elNav.addClass( 'top' );
                        } );
                        $( document ).on( 'open_header', function() {
                            elNav.removeClass( 'top' );
                        } );
                    }
                } );
            }
        }
    };

    const initFooter = function() {
        elFooter.html( '<div class="box"><div class="copyright">Copyright &copy; ' + (new Date).getFullYear() + ' Magento 2 笔记</div></div>' );
    };

    let headerH;

    initHeader();
    initMain();
    initFooter();
    updateStage();

    $( document ).on( 'scroll', updateStage );

} );