define( [
    'jquery',
    'scrollbar'
], function( $ ) {

    /**
     * @return {string} uuid
     * @see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     */
    const uuidv4 = function() {
        return ([ 1e7 ] + -1e3 + -4e3 + -8e3 + -1e11).replace( /[018]/g, c =>
            (c ^ window.crypto.getRandomValues( new Uint8Array( 1 ) )[0] & 15 >> c / 4).toString( 16 )
        );
    };

    $.fn.extend( {
        readingProgress: function( params ) {

            const elContentBox = this;
            const dataKey = 'reading-progress';

            /**
             * @param {object} options 
             */
            const init = function( options ) {

                const opts = $.extend( true, {
                    elProgressBox: null,
                    clsWrapper: 'reading-progress',
                    onInitialized: null,
                    onUpdate: null
                }, options );

                const elProgressBox = $( opts.elProgressBox );

                let data = [ ], html = '<div class="' + opts.clsWrapper + '"><ul>';
                elContentBox.find( 'h1,h2,h3,h4' ).each( function( i ) {
                    let el = $( this ), uid = 'section-' + ( i + 1 );
                    html += '<li class="idx t-' + this.tagName.toLowerCase() + '"><a href="' + window.location.origin + window.location.pathname + '#' + uid + '"><span>' + el.text() + '</span></a></li>';
                    data.push( {id: uid, size: this.tagName, elm: el} );
                    el.before( '<a id="' + uid + '"></a>' );
                } );
                html += '</ul></div>';

                let uid = uuidv4();
                data.push( {id: uid} );
                elContentBox.append( '<a id="' + uid + '"></a>' );

                elProgressBox.html( html );
                elContentBox.data( dataKey, data );

                const updateProgress = function() {
                    let scrollTop = $( document ).scrollTop();
                    let winH = $( window ).height();
                    let maxScrollY = $( document ).height() - winH;
                    let elIdx = [ ];
                    elProgressBox.find( 'li.idx' ).each( function( i, el ) {
                        el = $( el );
                        let n = i + 1;
                        for ( ; n < data.length - 1; n++ ) {
                            if ( data[i].size === data[n].size ) {
                                break;
                            }
                        }
                        let startY = $( '#' + data[i].id ).offset().top;
                        let endY = $( '#' + data[n].id ).offset().top;
                        let percentage = (scrollTop - startY) / (Math.min( maxScrollY, endY ) - startY);

                        if ( maxScrollY >= endY ) {
                            percentage = (scrollTop - startY) / (endY - startY);
                        } else if ( maxScrollY >= startY ) {
                            percentage = (scrollTop - startY) / (maxScrollY - startY);
                        } else {
                            percentage = (scrollTop + winH - startY) / (endY - startY);
                        }
                        percentage = Math.round( ((percentage < 0) ? 0 : ((percentage < 1) ? percentage : 1)) * 100 );
                        el.data( 'read-progress', percentage );
                        elIdx.push( el );
                    } );
                    if ( typeof opts.onUpdate === 'function' ) {
                        opts.onUpdate.call( elContentBox, elIdx );
                    }
                };

                $( document ).on( 'scroll', updateProgress );

                if ( typeof opts.onInitialized === 'function' ) {
                    opts.onInitialized.call( elContentBox, elProgressBox );
                }

                updateProgress();

            };

            if ( typeof (params) === 'string' ) {
                if ( !elContentBox.data( dataKey ) ) {
                    return;
                }
                switch ( params ) {
                    case 'update' :
                        updateProgress(  );
                        break;
                }

            } else {
                init( params );
            }

        }
    } );

} );