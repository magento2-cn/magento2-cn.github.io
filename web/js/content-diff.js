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
                lineHeight: 20,
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
                    self.editorOrg.resize();
                    self.editorNew.resize();
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
            this.editorOrg.getSession().on( 'changeScrollTop', this.updateComparer.bind( this ) );

            this.editorNew = ace.edit( this.elEditorNew.attr( 'id' ) );
            this.editorNew.setTheme( this.opts.theme );
            this.editorNew.getSession().setMode( this.opts.mode );
            this.editorNew.getSession().on( 'changeScrollTop', this.updateComparer.bind( this ) );
        }

        highlight( action, startLine, startCol, endLine, endCol ) {

            startLine--;
            startCol--;
            endLine--;
            endCol--;

            let editor, clazz;
            if ( action === CONTENT_DIFF.ACTION_ADD ) {
                editor = this.editorNew;
                clazz = 'diff_add';
            }
            else {
                editor = this.editorOrg;
                clazz = 'diff_remove';
            }

            let range = new Range( startLine, startCol, endLine, endCol );
            this.markerIds[action].push( editor.getSession().addMarker( range, clazz ) );
        }

        cleanStage() {
            for ( let i = 0; i < this.markerIds[CONTENT_DIFF.ACTION_REMOVE].length; i++ ) {
                this.editorOrg.getSession().removeMarker( this.markerIds[CONTENT_DIFF.ACTION_REMOVE][i] );
            }
            for ( let i = 0; i < this.markerIds[CONTENT_DIFF.ACTION_ADD].length; i++ ) {
                this.editorNew.getSession().removeMarker( this.markerIds[CONTENT_DIFF.ACTION_ADD][i] );
            }
        }

        /**
         * Create the curve position it at the initial x,y coords
         * This is of the form 'C M,N O,P Q,R' where
         * - C is a directive for SVG ('curveto')
         * - M,N are the first curve control point
         * - O,P the second control point
         * - Q,R are the final coords
         */
        getCurve( startX, startY, endX, endY ) {
            let middleX = startX + (endX - startX) / 2;
            return `M ${startX} ${startY} C ${middleX},${startY} ${middleX},${endY} ${endX},${endY}`;
        }

        /**
         * pointOrgStart --- pointNewStart
         *
         * pointOrgEnd --- pointNewEnd
         */
        updateComparer() {

            if ( !this.elComparer ) {
                return;
            }
            this.elComparer.empty();

            let data = this.comparerInfo || [];
            let lineHeight = this.editorOrg.renderer.lineHeight;
            let lines = Math.max( this.editorOrg.getSession().getLength(), this.editorNew.getSession().getLength() );
            let orgScrollTop = this.editorOrg.getSession().getScrollTop();
            let newScrollTop = this.editorNew.getSession().getScrollTop();

            let svg = $( '<svg width="' + this.opts.comparerWidth + '" height="' + (lineHeight * lines) + '"></svg>' )
                .appendTo( this.elComparer )
                .css( { display: 'block' } );

            // act, start, org, new
            for ( let i = 0; i < data.length; i++ ) {

                let orgStartLine = (data[i][0] === CONTENT_DIFF.ACTION_REMOVE) ? data[i][1] : data[i][2];
                let orgEndLine = data[i][2];
                let newStartLine = (data[i][0] === CONTENT_DIFF.ACTION_Add) ? data[i][1] : data[i][3];
                let newEndLine = data[i][3];

                let pointOrgStartX = 0;
                let pointOrgStartY = orgStartLine * lineHeight - orgScrollTop;

                let pointOrgEndX = 0;
                let pointOrgEndY = orgEndLine * lineHeight - orgScrollTop;

                let pointNewStartX = this.opts.comparerWidth;
                let pointNewStartY = newStartLine * lineHeight - newScrollTop;

                let pointNewEndX = this.opts.comparerWidth;
                let pointNewEndY = newEndLine * lineHeight - newScrollTop;

                let curve1 = this.getCurve( pointOrgStartX, pointOrgStartY, pointNewStartX, pointNewStartY );
                let curve2 = this.getCurve( pointNewEndX, pointNewEndY, pointOrgEndX, pointOrgEndY );

                let verticalLine1 = `L${pointNewStartX},${pointNewStartY} ${pointNewEndX},${pointNewEndY}`;
                let verticalLine2 = `L${pointOrgEndX},${pointOrgEndY} ${pointOrgStartX},${pointOrgStartY}`;

                const el = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
                el.setAttribute( 'd', `${curve1} ${verticalLine1} ${curve2} ${verticalLine2}` );
                el.setAttribute( 'class', data[i][0] );
                svg.get( 0 ).appendChild( el );
            }
        }

        getDiffs( contentOrg, contentNew ) {
            return diff.diff_main( contentOrg, contentNew );
        }

        /**
         * @see https://github.com/google/diff-match-patch/wiki/Line-or-Word-Diffs
         */
        getLineModeDiffs( contentOrg, contentNew ) {
            let tmp = diff.diff_linesToChars_( contentOrg, contentNew );
            let diffs = diff.diff_main( tmp.chars1, tmp.chars2, false );
            diff.diff_charsToLines_( diffs, tmp.lineArray );
            return diffs;
        }

        doCompare() {
            this.cleanStage();
            this.comparerInfo = [];

            let contentOrg = this.editorOrg.getSession().getValue(),
                contentNew = this.editorNew.getSession().getValue();
            let resultLineMode = this.getLineModeDiffs( contentOrg, contentNew );
            let result = this.getDiffs( contentOrg, contentNew );

            let countLines = function( str ) {
                let result = str.match( /\n/g );
                return !result ? 0 : result.length;
            };

            let currentOrgCol, currentOrgLine = 1,
                currentNewCol, currentNewLine = 1;
            for ( let d = 0; d < resultLineMode.length; d++ ) {
                let lines = countLines( resultLineMode[d][1] );
                if ( resultLineMode[d][0] === CONTENT_DIFF.DIFF_EQUAL ) {
                    currentOrgLine += lines;
                    currentNewLine += lines;
                }
                else if ( resultLineMode[d][0] === CONTENT_DIFF.DIFF_DELETE ) {
                    let startLine = currentOrgLine;
                    currentOrgLine += lines;
                    this.comparerInfo.push( [ CONTENT_DIFF.ACTION_REMOVE, startLine, currentOrgLine, currentNewLine ] );
                }
                else if ( resultLineMode[d][0] === CONTENT_DIFF.DIFF_INSERT ) {
                    let startLine = currentNewLine;
                    currentNewLine += lines;
                    this.comparerInfo.push( [ CONTENT_DIFF.ACTION_ADD, startLine, currentOrgLine, currentNewLine ] );
                }
            }

            currentOrgCol = 1, currentOrgLine = 1,
                currentNewCol = 1, currentNewLine = 1;
            for ( let d = 0; d < result.length; d++ ) {
                let lines = countLines( result[d][1] ),
                    chars = lines > 0 ? (result[d][1].length - result[d][1].lastIndexOf( '\n' )) : result[d][1].length;
                if ( result[d][0] === CONTENT_DIFF.DIFF_EQUAL ) {
                    currentOrgLine += lines;
                    currentOrgCol = lines > 0 ? chars : (currentOrgLine + chars);
                    currentNewLine += lines;
                    currentNewCol = lines > 0 ? chars : (currentOrgLine + chars);
                }
                else if ( result[d][0] === CONTENT_DIFF.DIFF_DELETE ) {
                    let startLine = currentOrgLine,
                        startCol = currentOrgCol;
                    currentOrgLine += lines;
                    currentOrgCol = lines > 0 ? chars : (currentOrgLine + chars);
                    this.highlight( CONTENT_DIFF.ACTION_REMOVE, startLine, startCol, currentOrgLine, currentOrgCol );
                }
                else if ( result[d][0] === CONTENT_DIFF.DIFF_INSERT ) {
                    let startLine = currentNewLine,
                        startCol = currentNewCol;
                    currentNewLine += lines;
                    currentNewCol = lines > 0 ? chars : (currentOrgLine + chars);
                    this.highlight( CONTENT_DIFF.ACTION_ADD, startLine, startCol, currentNewLine, currentNewCol );
                }
            }

            this.updateComparer();
        }

    }

    return function( options ) {
        return new ContentDiff( options );
    };

} );