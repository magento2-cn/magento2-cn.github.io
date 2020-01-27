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
require( [ 'jquery' ], function ( $ ) {

    const elDoc = $( document );

    /**
     * Add direction flag in scroll event
     * down: 1, up: -1
     */
    let scrollTop = elDoc.scrollTop();
    elDoc.on( 'scroll', function ( evt ) {
        let tmpScrollTop = elDoc.scrollTop();
        evt.dir = tmpScrollTop > scrollTop ? 1 : -1;
        scrollTop = tmpScrollTop;
    } );

    /**
     * Add touch events
     */
    $.extend( $.event.special, {
        touch: {
            setup: function () {
                let touchStartX, touchStartY, self = $( this );
                self.on( {
                    touchstart: function ( evt ) {
                        touchStartX = evt.changedTouches[0].screenX;
                        touchStartY = evt.changedTouches[0].screenY;
                    },
                    touchend: function ( evt ) {
                        let dx = evt.changedTouches[0].screenX - touchStartX;
                        let dy = evt.changedTouches[0].screenY - touchStartY;
                        if ( Math.abs( dx ) > Math.abs( dy ) ) {
                            if ( dx > 0 ) {
                                self.trigger( 'touchtoright', { type: 'touchtoright' } );
                            } else {
                                self.trigger( 'touchtoleft', { type: 'touchtoleft' } );
                            }
                        } else {
                            if ( dy > 0 ) {
                                self.trigger( 'touchtodown', { type: 'touchtodown' } );
                            } else {
                                self.trigger( 'touchtoup', { type: 'touchtoup' } );
                            }
                        }
                    }
                } );
            }
        }
    } );

    $.each( {
        touchtoright: 'touch',
        touchtoleft: 'touch',
        touchtodown: 'touch',
        touchtoup: 'touch'
    }, function ( orig, fix ) {
        $.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function ( evt, data ) {
                if ( data.type !== orig ) {
                    return;
                }

                let ret, target = this, related = evt.relatedTarget, handleObj = evt.handleObj;
                if ( !related || ( related !== target && !$.contains( target, related ) ) ) {
                    evt.type = handleObj.origType;
                    ret = handleObj.handler.apply( this, arguments );
                    evt.type = fix;
                }
                return ret;
            }
        };
    } );

} );

/**
 * Web page rendering
 *
 * @param {Object} $
 * @param {String} index
 * @param {Object} markdown
 */
require( [ 'jquery', 'text!index.json', 'markdown', 'mousewheel', 'progress', 'scrollbar' ], function ( $, index, markdown ) {

    const elWin = $( window );
    const elDoc = $( document );
    const elBody = $( 'body' );
    const elHeader = $( 'body > header' );
    const elMain = $( 'body > main' );
    const elFooter = $( 'body > footer' );
    const elArticle = elMain.find( 'article' );

    const baseUrl = window.location.origin;
    const indexData = JSON.parse( index );
    const markdownConverter = new markdown.Converter( { tables: true, strikethrough: true } );
    const mobileW = 768;

    /**
     * @argument {string} target
     */
    const scrollTo = function ( target ) {
        target = $( target );
        if ( target.length > 0 ) {
            $( 'html, body' ).animate( {
                scrollTop: target.offset().top
            }, {
                step: function ( now, fx ) {
                    fx.end = elHeader.hasClass( 'close' ) ? target.offset().top : ( target.offset().top - headerH );
                }
            } );
        }
    };

    /**
     * @argument {Object} opts
     */
    const buildMenu = function ( opts ) {

        opts = $.extend( true, {
            data: [],
            container: null,
            clsActive: 'active',
            clsCurrent: 'current',
            clsHover: 'hover',
            clsParent: 'parent'
        }, opts );

        const generateMenuHtml = function ( data, level ) {
            level = level || 1;
            let html = '<ul>';
            for ( let i in data ) {
                data[i].title;
                html += '<li class="item' + ( data[i].children ? ( ' ' + opts.clsParent ) : '' ) + '">' +
                    '<a href="' + ( data[i].href || 'javascript:;' ) + '"><span>' + data[i].title + '</span></a>';
                if ( data[i].children ) {
                    html += generateMenuHtml( data[i].children, level + 1 );
                }
                html += '</li>';
            }
            html += '</ul>';
            return html;
        };

        let menu = $( opts.container ).html( generateMenuHtml( opts.data ) );

        menu.find( 'li' ).on( {
            mouseenter: function () {
                if ( elWin.width() <= mobileW ) {
                    return;
                }
                $( this ).addClass( opts.clsHover );
            },
            mouseleave: function () {
                if ( elWin.width() <= mobileW ) {
                    return;
                }
                $( this ).removeClass( opts.clsHover );
            }
        } ).filter( '.parent' ).find( '> a' ).on( {
            touchstart: function () {
                if ( elWin.width() > mobileW ) {
                    return;
                }
                $( this ).parent().toggleClass( opts.clsHover );
            }
        } );

        menu.find( 'a' ).each( function () {
            if ( window.location.href.indexOf( this.href ) === 0 ) {
                let el = $( this );
                el.parent( 'li' ).addClass( opts.clsCurrent ).parents( 'li' ).addClass( opts.clsActive );
            }
        } );

    };

    const updateOnScroll = function ( evt ) {

        let scrollTop = elDoc.scrollTop();

        /**
         * For home page, hide backgroud of header on scroll to top
         */
        if ( elBody.hasClass( 'home' ) && scrollTop < headerH ) {
            elHeader.addClass( 'hide-bg' );
        } else {
            elHeader.removeClass( 'hide-bg' );
        }

        /**
         * Expand header on scroll up, close on scroll down
         */
        if ( evt && evt.dir === 1 && scrollTop > headerH ) { // close
            elHeader.addClass( 'close' );
            elDoc.trigger( 'close_header' );
        } else if ( evt && evt.dir === -1 ) {
            elDoc.trigger( 'open_header' );
            elHeader.removeClass( 'close' );
        }

        /**
         * Position of footer
         */
        if ( elWin.height() > elBody.innerHeight() ) {
            elFooter.addClass( 'fixed' );
        } else {
            elFooter.removeClass( 'fixed' );
        }

        /**
         * Home page background
         */
        if ( elBody.hasClass( 'home' ) && elWin.width() > mobileW ) {
            let elInfo = elBody.find( '> .info' );
            let boxH = elInfo.outerHeight();
            let dyContent = boxH * .8;
            let dyBg = boxH * .05;
            let percentage = scrollTop / boxH;
            elInfo.find( '.content .box' ).css( {
                marginTop: -30 - dyContent * percentage,
                opacity: 1 - percentage
            } );
            elInfo.find( '.bg' ).css( 'marginTop', -dyBg * percentage );

            let imgH = boxH + dyBg * percentage;
            let width = imgH * elInfo.find( '.bg img' ).get( 0 ).naturalWidth / elInfo.find( '.bg img' ).get( 0 ).naturalHeight;
            elInfo.find( '.bg img' ).css( {
                height: imgH,
                marginLeft: ( elWin.width() - width ) / 2,
                width: width
            } );
        }

    };

    const updateStage = function () {
        if ( elBody.hasClass( 'home' ) && elWin.width() > mobileW ) {
            elMain.css( 'marginTop', Math.floor( elBody.find( '> .info' ).outerHeight() ) );
        }
        let winH = elWin.height();
        if ( elWin.height() > elBody.innerHeight() ) {
            elArticle.css( { height: winH - elFooter.outerHeight() } );
        }
        updateOnScroll();
        elDoc.trigger( 'update_stage' );
    };

    const initHeader = function () {

        let html = '<div class="box"><div class="content">' +
            '<div class="logo"><a href="index.html"><img src="web/images/logo.png" /></a></div>' +
            '<div class="btn-nav"></div><nav></nav>' +
            '</div></div>';
        elHeader.html( html );

        let elMenu = elHeader.find( 'nav' );
        buildMenu( {
            data: indexData.main,
            container: elMenu
        } );
        elMenu.prepend( '<div class="bg"></div>' );
        elMenu.find( '> ul' ).wrap( '<div class="box"></div>' );
        elMenu.find( '> .box' ).prepend( '<div class="btn-close"></div>' );

        elMenu.find( '.bg, .btn-close' ).on( 'click', function () {
            elMenu.removeClass( 'active' );
        } );

        elHeader.find( '.btn-nav' ).on( 'click', function () {
            elMenu.find( 'li' ).removeClass( 'hover' );
            elMenu.addClass( 'active' );
        } );

        headerH = elHeader.outerHeight();
    };

    const initMain = function () {

        /**
         * Article
         */
        let elArticleSource = elMain.find( '#article-source' );

        let rebuildArticle = function ( articleContent ) {

            /**
             * Rebuild article content
             */
            elArticle.addClass( 'has-content' )
                .append( '<div class="content">' + markdownConverter.makeHtml( articleContent ) + '</div><div class="index"></div>' );
            elArticle.find( 'pre' ).mCustomScrollbar( {
                horizontalScroll: true,
                theme: 'minimal-dark'
            } );
            elArticleSource.remove();
            elBody.find( '.original-article' ).html( '<div class="info">本文为站长原创，转载请注明出处。</div>' ).appendTo( elArticle.find( '.content' ) );
            updateStage();

            /**
             * Build index
             */
            let elIndexer = elArticle.find( '> .index' );
            elArticle.find( '> .content' ).readingProgress( {
                elProgressBox: elIndexer,
                onInitialized: function ( elProgressBox ) {
                    if ( elProgressBox.find( 'li' ).length === 0 ) {
                        return;
                    }

                    let elProgress = elProgressBox.find( '.reading-progress' );
                    elProgress.mCustomScrollbar( { theme: 'minimal-dark' } );
                    elProgress.before( '<div class="caption">本页目录</div>' );
                    elDoc.on( 'update_stage', function () {
                        elProgress.mCustomScrollbar( 'update' );
                    } );

                    elProgressBox.find( 'li.idx a' ).before( '<div class="progress"></div>' );

                    elProgressBox.find( 'a' ).on( 'click', function () {
                        if ( !this.hash ) {
                            return true;
                        }
                        let target = $( this.hash );
                        if ( target.length === 0 ) {
                            return true;
                        }
                        scrollTo( target );
                    } );

                    let target = $( window.location.hash );
                    scrollTo( target );
                },
                onUpdate: function ( indexElms ) {
                    for ( let i = 0; i < indexElms.length; i++ ) {
                        indexElms[i].find( '.progress' ).css( 'width', indexElms[i].data( 'read-progress' ) + '%' );
                    }
                }
            } );
            elDoc.on( 'close_header', function () {
                elIndexer.addClass( 'top' );
            } );
            elDoc.on( 'open_header', function () {
                elIndexer.removeClass( 'top' );
            } );
        };

        if ( elArticleSource.length > 0 ) {
            if ( elArticleSource.data( 'source' ) ) {
                require( [ 'text!' + elArticleSource.data( 'source' ) ], function ( articleContent ) {
                    rebuildArticle( articleContent );
                } );
            } else {
                rebuildArticle( elArticleSource.text() );
            }
        }

        /**
         * Left hand menu
         */
        let elNav = elMain.find( '> aside' );
        if ( elNav.length > 0 ) {
            let paths = window.location.href.substr( baseUrl.length ).replace( /^\/*(.*)/, '$1' ).split( '/' );
            if ( paths.length >= 2 ) {
                $.ajax( {
                    url: baseUrl + '/' + paths[0] + '/' + paths[1] + '/index.json',
                    dataType: 'json',
                    success: function ( result ) {
                        let elNavWrapper = elNav;
                        elNavWrapper.html( '<div class="bg"></div><nav></nav>' );
                        elNav = elNavWrapper.find( 'nav' );
                        buildMenu( {
                            data: result,
                            container: elNav
                        } );
                        elNav.mCustomScrollbar( { theme: 'minimal-dark' } );
                        elDoc.on( {
                            close_header: function () {
                                elNavWrapper.addClass( 'top' );
                            },
                            open_header: function () {
                                elNavWrapper.removeClass( 'top' );
                            },
                            update_stage: function () {
                                elNav.mCustomScrollbar( 'update' );
                            },
                            touchtoright: function () {
                                elNavWrapper.addClass( 'active' );
                            }
                        } );
                        elNav.on( 'touchtoleft', function () {
                            elNavWrapper.removeClass( 'active' );
                        } );

                        elNavWrapper.find( '.bg' ).on( 'click', function () {
                            elNavWrapper.removeClass( 'active' );
                        } );
                    }
                } );
            }
        }

    };

    const initFooter = function () {

        let html = '<div class="box">' +
            '<div class="copyright">Copyright &copy; ' + ( new Date ).getFullYear() + ' Magento 2 笔记</div>' +
            '</div>';

        elFooter.html( html );

    };

    let headerH;

    initHeader();
    initMain();
    initFooter();
    updateStage();

    elWin.on( 'resize', updateStage );
    elDoc.on( 'scroll', updateOnScroll );

    elDoc.on( 'touchmove', function ( evt ) {
        evt.preventDefault();
        return false;
    } );

} );