define( [
    'jquery',
    'web/js/ace/ace',
    'web/js/diff_match_patch_uncompressed'
], function( $ ) {

    /**
     * @see https://github.com/ajaxorg/ace/wiki/Configuring-Ace
     * @see https://github.com/ajaxorg/ace/wiki/Embedding-API
     */
    let ace = window.ace;

    /**
     * @see https://github.com/google/diff-match-patch/wiki
     * @see https://github.com/google/diff-match-patch/wiki/Language:-JavaScript
     */
    let diff = new diff_match_patch();

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
                .on( 'click', this.doCompare );
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
            this.editorOrg.session.setMode( this.opts.mode );

            this.editorNew = ace.edit( this.elEditorNew.attr( 'id' ) );
            this.editorNew.setTheme( this.opts.theme );
            this.editorNew.session.setMode( this.opts.mode );
        }

        doCompare() {

        }

    }

    return function( options ) {
        return new ContentDiff( options );
    };

} );