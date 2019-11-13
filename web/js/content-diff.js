define( [
    'jquery',
    'web/js/highlight.pack',
    'web/js/ace/ace',
    'web/js/diff_match_patch_uncompressed'
], function( $, highlight ) {

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
                indexerWidth: 10,
                height: 600,
                lineHeight: 20,
                theme: 'ace/theme/chrome',
                mode: 'ace/mode/php',
                labels: {
                    screenMode: 'Screen Mode',
                    compare: 'Compare'
                }
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

            $( window ).on( 'resize', this.updateStage.bind( this ) );
        }

        buildToolbar() {

            let self = this;
            let toolbarId = this.opts.elemId + '-toolbar';

            this.elToolbar = $( '<div id="' + toolbarId + '"></div>' );
            this.elToolbar.appendTo( this.element ).addClass( 'toolbar' );

            $( '<a href="javascript:;" class="button btn-fullscreen"><span>' + this.opts.labels.screenMode + '</span></a>' )
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

            $( '<a href="javascript:;" class="button btn-compare"><span>' + this.opts.labels.compare + '</span></a>' )
                .appendTo( this.elToolbar )
                .on( 'click', this.doCompare.bind( self ) );
        }

        buildContainer() {

            let editorOrgId = this.opts.elemId + '-editor-org',
                editorNewId = this.opts.elemId + '-editor-new',
                comparerId = this.opts.elemId + '-comparer',
                containerId = this.opts.elemId + '-container',
                indexerId = this.opts.elemId + '-indexer';

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
                    width: 'calc( ( 100% - ' + (this.opts.comparerWidth + this.opts.indexerWidth) + 'px ) / 2 )',
                    order: 1
                } );

            this.elEditorNew = $( '<div id="' + editorNewId + '" class="editor"></div>' )
                .appendTo( this.elContainer )
                .css( {
                    height: '100%',
                    width: 'calc( ( 100% - ' + (this.opts.comparerWidth + this.opts.indexerWidth) + 'px ) / 2 )',
                    order: 3
                } );

            this.elComparer = $( '<div id="' + comparerId + '" class="comparer"></div>' )
                .appendTo( this.elContainer )
                .css( {
                    height: '100%',
                    width: this.opts.comparerWidth,
                    order: 2,
                    overflow: 'hidden'
                } );

            let elIndexerPointer = $( '<div class="pointer"></div>' )
                .css( {
                    display: 'none',
                    width: '100%',
                    position: 'absolute',
                    zIndex: 2
                } );

            let elIndexerBox = $( '<div class="box"></div>' )
                .css( {
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    zIndex: 1
                } );

            this.elIndexer = $( '<div id="' + indexerId + '" class="indexer"></div>' )
                .appendTo( this.elContainer )
                .append( elIndexerPointer ).append( elIndexerBox )
                .data( 'pointer', elIndexerPointer ).data( 'box', elIndexerBox )
                .css( {
                    height: '100%',
                    width: this.opts.indexerWidth,
                    position: 'relative',
                    order: 4
                } );

            this.initEditor();
        }

        initEditor() {

            const self = this;

            this.editorOrg = ace.edit( this.elEditorOrg.attr( 'id' ) );
            this.editorNew = ace.edit( this.elEditorNew.attr( 'id' ) );

            let editors = { org: this.editorOrg, new: this.editorNew };
            for ( let key in editors ) {
                editors[key].getSession().setMode( this.opts.mode );
                editors[key].getSession().on( 'changeScrollLeft', this.updateScrollLeft.bind( this ) );
                editors[key].getSession().on( 'changeScrollTop', this.updateScrollTop.bind( this ) );
                editors[key].setTheme( this.opts.theme );
                editors[key].on( 'paste', function( context, editor ) {
                    let language = highlight.highlightAuto( context.text ).language;
                    if ( language ) {
                        /**
                         * Not accurate enough for the language detecting, needs further checking
                         */
                        if ( language === 'xml'
                            && /(<\/?(html|head|body|link|script))|<\!DOCTYPE/.test( context.text )
                        ) {
                            language = 'html';
                        }
                        if ( !/^\s*</.test( context.text )
                            && /(\n+)#{1,4} ?.\n*/.test( context.text )
                        ) {
                            language = 'markdown';
                        }
                        editor.getSession().setMode( 'ace/mode/' + language );
                    }
                } );
                editors[key].renderer.on( 'resize', this.updateStage.bind( this ) );
            }
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
         * pointOrgEnd --- pointNewEnd
         *
         * Thanks to ace-diff
         *
         * @see https://github.com/ace-diff/ace-diff
         */
        updateComparer() {

            if ( !this.elComparer ) {
                return;
            }
            this.elComparer.empty();

            let data = this.diffLineBlocks || [];
            let lineHeight = this.editorOrg.renderer.lineHeight;
            let lines = Math.max( this.editorOrg.getSession().getLength(), this.editorNew.getSession().getLength() );
            let orgScrollTop = this.editorOrg.getSession().getScrollTop();
            let newScrollTop = this.editorNew.getSession().getScrollTop();

            let svg = $( '<svg width="' + this.opts.comparerWidth + '" height="' + (lineHeight * lines) + '"></svg>' )
                .appendTo( this.elComparer )
                .css( { display: 'block' } );

            /**
             * @var diffData [ [ action, startLine, currentOrgLine, currentNewLine ] ]
             */
            for ( let i = 0; i < data.length; i++ ) {
                let orgStartLine = (data[i][0] === CONTENT_DIFF.ACTION_REMOVE) ? data[i][1] : data[i][2];
                let orgEndLine = data[i][2];
                let newStartLine = (data[i][0] === CONTENT_DIFF.ACTION_ADD) ? data[i][1] : data[i][3];
                let newEndLine = data[i][3];

                let pointOrgStartX = 0;
                let pointOrgStartY = (orgStartLine - 1) * lineHeight - orgScrollTop;
                let pointOrgEndX = 0;
                let pointOrgEndY = (orgEndLine - 1) * lineHeight - orgScrollTop;
                let pointNewStartX = this.opts.comparerWidth;
                let pointNewStartY = (newStartLine - 1) * lineHeight - newScrollTop;
                let pointNewEndX = this.opts.comparerWidth;
                let pointNewEndY = (newEndLine - 1) * lineHeight - newScrollTop;
                let curve1 = this.getCurve( pointOrgStartX, pointOrgStartY, pointNewStartX, pointNewStartY );
                let curve2 = this.getCurve( pointNewEndX, pointNewEndY, pointOrgEndX, pointOrgEndY );
                let verticalLine1 = `L${pointNewStartX},${pointNewStartY} ${pointNewEndX},${pointNewEndY}`;
                let verticalLine2 = `L${pointOrgEndX},${pointOrgEndY} ${pointOrgStartX},${pointOrgStartY}`;

                let el = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
                el.setAttribute( 'd', `${curve1} ${verticalLine1} ${curve2} ${verticalLine2}` );
                el.setAttribute( 'class', data[i][0] );
                svg.get( 0 ).appendChild( el );
            }
        }

        updateIndexer() {

            if ( !this.diffLineBlocks ) {
                return;
            }

            let lineHeight = this.editorOrg.renderer.lineHeight;
            let orgLines = this.editorOrg.getSession().getLength();
            let newLines = this.editorNew.getSession().getLength();

            let mainEditor = (orgLines > newLines) ? this.editorOrg : this.editorNew;

            let orgHeight = orgLines * lineHeight;
            let newHeight = newLines * lineHeight;
            let screenHeight = this.elIndexer.innerHeight() - (mainEditor.renderer.scrollBarH.isVisible ? mainEditor.renderer.scrollBarH.height : 0);
            let indexerHeight = Math.min( Math.max( orgHeight, newHeight ), screenHeight );
            let unitHeight = indexerHeight / Math.max( orgLines, newLines );
            let pointerHeight = screenHeight > indexerHeight ? 0 : Math.floor( Math.pow( screenHeight, 2 ) / Math.max( orgHeight, newHeight ) );

            let orgWidth = $( this.editorOrg.renderer.content ).innerWidth();
            let newWidth = $( this.editorNew.renderer.content ).innerWidth();
            let screenWidth = $( this.editorOrg.renderer.scroller ).innerWidth();

            this.elIndexer.data( 'scaleHeightOrg', (orgHeight - screenHeight) / (indexerHeight - pointerHeight) );
            this.elIndexer.data( 'scaleHeightNew', (newHeight - screenHeight) / (indexerHeight - pointerHeight) );
            this.elIndexer.data( 'scaleWidthOrg', (orgWidth - screenWidth) / (newWidth - screenWidth) );
            this.elIndexer.data( 'orgHeight', orgHeight );
            this.elIndexer.data( 'screenHeight', screenHeight );
            this.elIndexer.data( 'orgWidth', orgWidth );
            this.elIndexer.data( 'screenWidth', screenWidth );
            this.elIndexer.data( 'mainEditor', mainEditor );
            this.elIndexer.data( 'mainEditor', mainEditor );

            this.elIndexer.data( 'pointer' ).css( {
                height: pointerHeight,
                display: pointerHeight > 0 ? 'block' : 'none'
            } );

            /**
             * @var diffData [ [ action, startLine, currentOrgLine, currentNewLine ] ]
             */
            this.elIndexer.data( 'box' ).empty();
            for ( let i = 0; i < this.diffLineBlocks.length; i++ ) {
                let startLine = this.diffLineBlocks[i][1] - 1;
                let endLine = (this.diffLineBlocks[i][0] === CONTENT_DIFF.ACTION_REMOVE
                    ? this.diffLineBlocks[i][2] : this.diffLineBlocks[i][3]) - 1;
                $( '<div></div>' ).appendTo( this.elIndexer.data( 'box' ) )
                    .addClass( this.diffLineBlocks[i][0] )
                    .css( {
                        opacity: .3,
                        position: 'absolute',
                        height: unitHeight * (endLine - startLine) + 'px',
                        width: 'calc( 100% - 2px )',
                        left: '1px',
                        top: unitHeight * startLine + 'px'
                    } );
            }
        }

        updateIndexerPointer() {
            if ( !this.elIndexer.data( 'mainEditor' ) ) {
                return;
            }
            let top = this.elIndexer.data( 'mainEditor' ).getSession().getScrollTop() / Math.max( this.elIndexer.data( 'scaleHeightOrg' ), this.elIndexer.data( 'scaleHeightNew' ) );
            this.elIndexer.data( 'pointer' ).css( { top: top } );
            if ( this.elIndexer.data( 'orgHeight' ) > this.elIndexer.data( 'screenHeight' ) ) {
                this.editorOrg.getSession().setScrollTop( top * this.elIndexer.data( 'scaleHeightOrg' ) );
            }
        }

        updateScrollLeft() {
            if ( !this.elIndexer.data( 'mainEditor' ) ) {
                return;
            }
            if ( this.elIndexer.data( 'orgWidth' ) > this.elIndexer.data( 'screenWidth' ) ) {
                this.editorOrg.getSession().setScrollLeft( this.editorNew.getSession().getScrollLeft() * this.elIndexer.data( 'scaleWidthOrg' ) );
            }
        }

        updateScrollTop() {
            this.updateComparer();
            this.updateIndexerPointer();
        }

        updateStage() {
            this.updateIndexer();
            this.updateScrollTop();
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

            let contentOrg = this.editorOrg.getSession().getValue(),
                contentNew = this.editorNew.getSession().getValue();

            let result = this.getLineModeDiffs( contentOrg, contentNew ),
                resultLineMode = result;

            const countLines = function( str ) {
                let result = str.match( /\n/g );
                return !result ? 0 : result.length;
            };

            /**
             * Collect comparer info
             */
            this.diffLineBlocks = [];
            let currentOrgLine = 1, currentNewLine = 1;
            for ( let d = 0; d < resultLineMode.length; d++ ) {
                let lines = countLines( resultLineMode[d][1] );
                if ( resultLineMode[d][0] === CONTENT_DIFF.DIFF_EQUAL ) {
                    currentOrgLine += lines;
                    currentNewLine += lines;
                }
                else if ( resultLineMode[d][0] === CONTENT_DIFF.DIFF_DELETE ) {
                    let startLine = currentOrgLine;
                    currentOrgLine += lines;
                    this.diffLineBlocks.push( [ CONTENT_DIFF.ACTION_REMOVE, startLine, currentOrgLine, currentNewLine ] );
                }
                else if ( resultLineMode[d][0] === CONTENT_DIFF.DIFF_INSERT ) {
                    let startLine = currentNewLine;
                    currentNewLine += lines;
                    this.diffLineBlocks.push( [ CONTENT_DIFF.ACTION_ADD, startLine, currentOrgLine, currentNewLine ] );
                }
            }

            /**
             * Add highlights
             */
            let currentOrgCol = 1, currentNewCol = 1, firstDiffLineOrg, firstDiffLineNew;
            currentOrgLine = 1, currentNewLine = 1;
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
                    let startLine = currentOrgLine, startCol = currentOrgCol;
                    currentOrgLine += lines;
                    currentOrgCol = lines > 0 ? chars : (currentOrgLine + chars);
                    this.highlight( CONTENT_DIFF.ACTION_REMOVE, startLine, startCol, currentOrgLine, currentOrgCol );
                    if ( !firstDiffLineOrg ) {
                        firstDiffLineOrg = startLine;
                        firstDiffLineNew = currentNewLine;
                    }
                }
                else if ( result[d][0] === CONTENT_DIFF.DIFF_INSERT ) {
                    let startLine = currentNewLine, startCol = currentNewCol;
                    currentNewLine += lines;
                    currentNewCol = lines > 0 ? chars : (currentOrgLine + chars);
                    this.highlight( CONTENT_DIFF.ACTION_ADD, startLine, startCol, currentNewLine, currentNewCol );
                    if ( !firstDiffLineNew ) {
                        firstDiffLineOrg = currentOrgLine;
                        firstDiffLineNew = startLine;
                    }
                }
            }

            this.editorOrg.gotoLine( firstDiffLineOrg );
            this.editorNew.gotoLine( firstDiffLineNew );

            this.updateIndexer();
            this.updateScrollTop();
        }

    }

    return function( options ) {
        return new ContentDiff( options );
    };

} )
;