define( [
    'jquery',
    'web/js/ace/ace',
    'web/js/diff_match_patch_uncompressed'
], function( $ ) {

    /**
     * @see https://github.com/ajaxorg/ace/wiki/Configuring-Ace
     * @see https://github.com/ajaxorg/ace/wiki/Embedding-API
     */
    const ace = window.ace;
    const { Range } = ace.require( 'ace/range' );

    /**
     * @see https://github.com/google/diff-match-patch/wiki
     * @see https://github.com/google/diff-match-patch/wiki/Language:-JavaScript
     */
    const diff = new diff_match_patch();

    const CONTENT_DIFF = {
        DIFF_EQUAL: 0,
        DIFF_DELETE: -1,
        DIFF_INSERT: 1,
        ACTION_ADD: 'add',
        ACTION_REMOVE: 'remove'
    }

    class ContentDiff {

        constructor( options ) {

            this.opts = $.extend( true, {
                elemId: null,
                comparerWidth: 80,
                height: 600,
                theme: 'ace/theme/chrome',
                mode: 'ace/mode/javascript'
            }, options );

            this.elWrapper = $( '#' + this.opts.elemId )
                .css( { height: this.opts.height } );

            this.element = $( '<div class="content-diff"></div>' )
                .appendTo( this.elWrapper )
                .css( { height: '100%' } );

            this.markerIds = {};
            this.markerIds[CONTENT_DIFF.ACTION_ADD] = [];
            this.markerIds[CONTENT_DIFF.ACTION_REMOVE] = [];

            this.buildToolbar();
            this.buildContainer();
        }

        buildToolbar() {

            let self = this;
            let toolbarId = this.opts.elemId + '-toolbar';

            this.elToolbar = $( '<div id="' + toolbarId + '"></div>' );
            this.elToolbar.appendTo( this.element ).addClass( 'toolbar' );

            $( '<a href="javascript:;" class="button btn-fullscreen"><span>Fullscreen</span></a>' )
                .appendTo( this.elToolbar )
                .on( 'click', function() {
                    if ( !self.elFullscreenWrapper ) {
                        self.elFullscreenWrapper = $( '<div id="' + self.opts.elemId + '-fullscreen-wrapper"></div>' )
                            .appendTo( $( 'body' ) )
                            .css( {
                                display: 'none', position: 'fixed', zIndex: '999999',
                                left: '0', top: '0', height: '100%', width: '100%'
                            } );
                    }
                    if ( self.isFullscreen ) {
                        self.isFullscreen = false;
                        self.element.appendTo( self.elWrapper );
                        self.elFullscreenWrapper.hide();
                        $( 'body' ).css( { overflow: 'auto' } );
                        $( this ).removeClass( 'is_full' );
                    }
                    else {
                        self.isFullscreen = true;
                        self.element.appendTo( self.elFullscreenWrapper );
                        self.elFullscreenWrapper.show();
                        $( 'body' ).css( { overflow: 'hidden' } );
                        $( this ).addClass( 'is_full' );
                    }
                } );

            $( '<a href="javascript:;" class="button btn-compare"><span>Compare</span></a>' )
                .appendTo( this.elToolbar )
                .on( 'click', this.doCompare.bind( self ) );
        }

        buildContainer() {

            let editorOrgId = this.opts.elemId + '-editor-org',
                editorNewId = this.opts.elemId + '-editor-new',
                comparerId = this.opts.elemId + '-comparer',
                containerId = this.opts.elemId + '-container';

            this.elContainer = $( '<div id="' + containerId + '" class="container"></div>' )
                .appendTo( this.element )
                .css( {
                    display: 'flex',
                    height: 'calc( 100% - ' + this.elToolbar.outerHeight() + 'px )'
                } );

            this.elEditorOrg = $( '<div id="' + editorOrgId + '" class="editor"></div>' )
                .appendTo( this.elContainer )
                .css( {
                    height: '100%',
                    width: 'calc( ( 100% - ' + this.opts.comparerWidth + 'px ) / 2 )',
                    order: 1
                } );

            this.elEditorNew = $( '<div id="' + editorNewId + '" class="editor"></div>' )
                .appendTo( this.elContainer )
                .css( {
                    height: '100%',
                    width: 'calc( ( 100% - ' + this.opts.comparerWidth + 'px ) / 2 )',
                    order: 3
                } );

            this.elComparer = $( '<div id="' + comparerId + '" class="comparer"></div>' )
                .appendTo( this.elContainer )
                .css( {
                    height: '100%',
                    width: this.opts.comparerWidth,
                    order: 2
                } );

            this.initEditor();
        }

        initEditor() {

            this.editorOrg = ace.edit( this.elEditorOrg.attr( 'id' ) );
            this.editorOrg.setTheme( this.opts.theme );
            this.editorOrg.getSession().setMode( this.opts.mode );

            this.editorNew = ace.edit( this.elEditorNew.attr( 'id' ) );
            this.editorNew.setTheme( this.opts.theme );
            this.editorNew.getSession().setMode( this.opts.mode );
        }

        highlight( action, startLine, startCol, endLine, endCol ) {

            startLine = startLine - 1;
            startCol = (startCol === undefined) ? 0 : (startCol - 1);
            endLine = (endLine === undefined) ? startLine : (endLine - 1);
            endCol = (endCol === undefined) ? Infinity : (endCol - 1);

            let editor, clazz,
                type = (endCol === Infinity) ? 'fullLine' : 'line';
            if ( action === CONTENT_DIFF.ACTION_ADD ) {
                editor = this.editorNew;
                clazz = 'diff_add';
            }
            else {
                editor = this.editorOrg;
                clazz = 'diff_remove';
            }

            if ( endCol !== Infinity ) {
                console.log( startLine + ':' + startCol + ', ' + endLine + ':' + endCol );
            }

            let range = new Range( startLine, startCol, endLine, endCol );
            this.markerIds[action].push( editor.getSession().addMarker( range, clazz, type ) );
        }

        cleanStage() {
            for ( let i = 0; i < this.markerIds[CONTENT_DIFF.ACTION_REMOVE].length; i++ ) {
                this.editorOrg.getSession().removeMarker( this.markerIds[CONTENT_DIFF.ACTION_REMOVE][i] );
            }
            for ( let i = 0; i < this.markerIds[CONTENT_DIFF.ACTION_ADD].length; i++ ) {
                this.editorNew.getSession().removeMarker( this.markerIds[CONTENT_DIFF.ACTION_ADD][i] );
            }
        }

        doCompare() {
            this.cleanStage();

            let result = diff.diff_main( this.editorOrg.getSession().getValue(), this.editorNew.getSession().getValue() );

            console.log( this.editorNew );
            console.log( this.editorNew.getSession() );
            console.log( result );

            let countLines = function( str ) {
                let result = str.match( /\n/g );
                return !result ? 0 : result.length;
            };

            let currentOrgCol = 1, currentOrgLine = 1,
                currentNewCol = 1, currentNewLine = 1;
            for ( let d = 0; d < result.length; d++ ) {

                if ( result[d][0] === CONTENT_DIFF.DIFF_EQUAL ) {
                    let lines = countLines( result[d][1] ),
                        chars = lines > 0 ? (result[d][1].length - result[d][1].lastIndexOf( '\n' )) : result[d][1].length;
                    currentOrgLine += lines;
                    currentOrgCol = lines > 0 ? chars : (currentOrgLine + chars);
                    currentNewLine += lines;
                    currentNewCol = lines > 0 ? chars : (currentOrgLine + chars);
                }

                else if ( result[d][0] === CONTENT_DIFF.DIFF_DELETE ) {
                    let startCol = currentOrgCol, hasLineBreak = false;
                    for ( let i = 0; i < result[d][1].length; i++ ) {
                        currentOrgCol++;
                        if ( result[d][1][i] === '\n' ) {
                            this.highlight( CONTENT_DIFF.ACTION_REMOVE, currentOrgLine, startCol, currentOrgLine, currentOrgCol );
                            currentOrgLine++;
                            this.highlight( CONTENT_DIFF.ACTION_REMOVE, currentOrgLine );
                            currentOrgCol = 0;
                            hasLineBreak = true;
                        }
                    }
                    if ( !hasLineBreak && currentOrgCol > startCol ) {
                        this.highlight( CONTENT_DIFF.ACTION_REMOVE, currentOrgLine, startCol, currentOrgLine, currentOrgCol );
                    }
                }

                else if ( result[d][0] === CONTENT_DIFF.DIFF_INSERT ) {
                    let startCol = currentNewCol, hasLineBreak = false;
                    for ( let i = 0; i < result[d][1].length; i++ ) {
                        currentNewCol++;
                        if ( result[d][1][i] === '\n' ) {
                            this.highlight( CONTENT_DIFF.ACTION_ADD, currentNewLine, startCol, currentNewLine, currentNewCol );
                            currentNewLine++;
                            this.highlight( CONTENT_DIFF.ACTION_ADD, currentNewLine );
                            currentNewCol = 0;
                            hasLineBreak = true;
                        }
                    }
                    if ( !hasLineBreak && currentNewCol > startCol ) {
                        this.highlight( CONTENT_DIFF.ACTION_ADD, currentNewLine, startCol, currentNewLine, currentNewCol );
                    }
                }
            }
        }

    }

    return function( options ) {
        return new ContentDiff( options );
    };

} );