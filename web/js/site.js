require.config( {
    waitSeconds: 0,
    paths: {
        jquery: 'web/js/jquery',
        text: 'web/js/text',
        markdown: 'web/js/showdown.min',
        mousewheel: 'web/js/jquery.mousewheel-3.0.6.min',
        scrollbar: 'web/js/jquery.mCustomScrollbar.min'
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
 */
require( [ 'jquery', 'text!index.json', 'mousewheel' ], function( $, index ) {

    const header = $( 'body > header' );
    const mainMenu = $( 'body > header > nav' );
    const main = $( 'body > main' );
    const footer = $( 'body > footer' );
    const footerMenu = $( 'body > footer > nav' );

    const indexData = JSON.parse( index );

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
            if ( this.href === window.location.href ) {
                let el = $( this );
                el.parent( 'li' ).addClass( opts.clsCurrent ).parents( 'li' ).addClass( opts.clsActive );
            }
        } );

    };

    const updateStage = function( evt ) {
        let scrollTop = $( document ).scrollTop();
        if ( scrollTop > headerH ) {
            header.addClass( 'show-bg' );
        } else {
            header.removeClass( 'show-bg' );
        }
        if ( evt && evt.dir === 1 && scrollTop > headerH ) { // close
            header.addClass( 'close' );
        } else if ( evt && evt.dir === -1 ) {
            header.removeClass( 'close' );
        }
    };

    const initHeader = function() {
        buildMenu( {
            data: indexData.main,
            container: mainMenu
        } );
        mainMenu.wrap( '<div class="box"></div>' ).find( '> ul' ).before( '<div class="logo"><img src="web/images/logo.png" /></div>' );
        headerH = header.outerHeight();
    };

    const initFooter = function() {
        footerMenu.wrap( '<div class="box"></div>' ).after( '<div class="copyright">Copyright &copy; ' + (new Date).getFullYear() + ' Magento 2 笔记</div>' );
    };

    let headerH;

    initHeader();
    initFooter();
    updateStage();

    $( document ).on( 'scroll', updateStage );

} );