define( [
    'jquery',
    'scrollbar'
], function( $ ) {

    /**
     * @return {string} uuid
     * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     */
    var uuidv4 = function() {
        return ([ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11).replace( /[018]/g, c =>
            (c ^ window.crypto.getRandomValues( new Uint8Array( 1 ) )[0] & 15 >> c / 4).toString( 16 )
        );
    };

    $.fn.extend( {
        readingProgress: function( params ) {

            /**
             * @param {object} elContentBox 
             * @param {object} options 
             */
            var init = function( elContentBox, options ) {

                var opts = $.extend( true, {
                    elProgressBox: null,
                    startTop: 0
                }, options );

                var elProgressBox = $( opts.elProgressBox );

                /**
                 * @param {object} el
                 * @return {int} Content height of target section including the title
                 */
                var getSectionHeight = function( el ) {
                    var tag = el.get( 0 ).tagName;
                    var nextItem = el.nextAll( tag ).eq( 0 );
                    if ( nextItem.length === 0 ) {
                        switch ( tag ) {
                            case 'H2' :
                                nextItem = el.nextAll( 'H1' ).eq( 0 );
                                break;
                            case 'H3' :
                                nextItem = el.nextAll( 'H2' ).eq( 0 );
                                if ( nextItem.length === 0 ) {
                                    nextItem = el.nextAll( 'H1' ).eq( 0 );
                                }
                                break;
                        }
                    }
                    if ( nextItem.length === 0 ) {
                        return elContentBox.offset().top + elContentBox.outerHeight() - el.offset().top;
                    }
                    return nextItem.offset().top - el.offset().top;
                };

                var updateProgressValue = function( elProgressBox ) {
                    var scrollTop = $( 'html, body' ).scrollTop();
                    var maxScrollTop = $( document ).outerHeight() - $( window ).height();
                    elProgressBox.find( '.progress' ).each( function() {
                        var el = $( this );
                        var target = elContentBox.find( el.data( 'target' ) );
                        var height = Math.min( getSectionHeight( target ), maxScrollTop + opts.startTop - target.offset().top );
                        var current = scrollTop + opts.startTop;
                        var start = target.offset().top;
                        var end = target.offset().top + height;

                        var percentage;
                        if ( maxScrollTop > scrollTop ) {
                            if ( current > start && current < end ) {
                                percentage = (current - start) / height;
                                el.closest( 'li' ).addClass( 'current' );
                            } else {
                                percentage = current <= start ? 0 : 1;
                                el.closest( 'li' ).removeClass( 'current' );
                            }
                        } else {
                            percentage = 1;
                            el.closest( 'li' ).removeClass( 'current' );
                        }

                        el.find( 'span' ).css( 'width', percentage * 100 + '%' );
                    } );
                };

                elProgressBox.append( '<div class="box"></div>' ).mCustomScrollbar( {theme: 'minimal-dark'} );
                elProgressBox = elProgressBox.find( '.box' );
                elProgressBox.on( 'click', 'a', function() {
                    $( 'html, body' ).animate( {'scrollTop': Math.ceil( elContentBox.find( this.hash ).offset().top - elContentBox.offset().top ) + 10} );
                    return false;
                } );

                elContentBox.data( 'reading-progress', {
                    elProgressBox: elProgressBox,
                    onScroll: updateProgressValue
                } );

                $( document ).on( 'scroll', function() {
                    updateProgressValue( elProgressBox );
                } );

                updateProgress( elContentBox );

            };

            /**
             * @param {object} elContentBox 
             */
            var updateProgress = function( elContentBox ) {

                var elProgressBox = elContentBox.data( 'reading-progress' ).elProgressBox;
                var updateProgressValue = elContentBox.data( 'reading-progress' ).onScroll;
                var totalHeight = elContentBox.outerHeight();

                if ( totalHeight === 0 ) {
                    elProgressBox.html( '' );
                    return;
                }

                var collectData = function() {
                    var data = [ ];
                    var currentH2 = {id: uuidv4(), children: [ ]};
                    var currentH1 = {id: uuidv4(), children: [ currentH2 ]};
                    elContentBox.find( 'h1, h2, h3' ).each( function() {
                        var el = $( this );
                        var id = el.attr( 'id' ) || uuidv4();
                        el.attr( 'id', id );
                        if ( el.is( 'h1' ) ) {
                            currentH1 = {id: id, title: el.text(), children: [ ]};
                            data.push( currentH1 );
                        } else if ( el.is( 'h2' ) ) {
                            currentH2 = {id: id, title: el.text(), children: [ ]};
                            currentH1.children.push( currentH2 );
                        } else {
                            currentH2.children.push( {id: id, title: el.text()} );
                        }
                    } );
                    return data;
                };

                var getProgressBoxHtml = function( data ) {
                    var html = '<ul>';
                    for ( var i = 0; i < data.length; i++ ) {
                        html += '<li>' +
                                '<a href="#' + data[i].id + '">' +
                                '<span class="progress" data-target="#' + data[i].id + '"><span></span></span>' +
                                '<span class="title">' + data[i].title + '</span></a>';
                        if ( data[i].children && data[i].children.length > 0 ) {
                            html += getProgressBoxHtml( data[i].children );
                        }
                        html += '</li>';
                    }
                    html += '</ul>';
                    return html;
                };

                var rebuildProgressBox = function() {
                    elProgressBox.html( getProgressBoxHtml( collectData() ) );
                };

                rebuildProgressBox();
                updateProgressValue( elProgressBox );

            };

            if ( typeof (params) === 'string' ) {
                if ( !this.data( 'reading-progress' ) ) {
                    return;
                }
                switch ( params ) {
                    case 'update' :
                        updateProgress( this );
                        break;
                }

            } else {
                init( this, params );
            }

        }
    } );

} );