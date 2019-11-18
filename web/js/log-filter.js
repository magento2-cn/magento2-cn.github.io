define( [ 'jquery' ], function( $ ) {

    class LogFilter {

        defaultFilters = [
            '(?:Add of|Remove on) item with id .+ was processed',
            'Broken reference: .+',
            'cache_invalidate:  \\{.+\\}',
            'Cronjob .+ is .+',
            'Item .+ was removed',
            'No element found with ID .+'
        ];

        opts = {
            elemId: null,
            onContentUpdate: null,
            onFilterUpdate: null
        };

        elFile;
        fileContent;
        reader;
        sourceData;
        filteredData;

        constructor( options ) {

            this.opts = $.extend( true, this.opts, options );
            this.elFile = $( '#' + this.opts['elemId'] ).get( 0 );

            this.reader = new FileReader();
            this.reader.onload = function( evt ) {
                this.fileContent = evt.target['result'];
                this.sourceData = this.fileContent.match( /\[\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}\] report\..+: .+\n/g );
                if ( typeof this.opts['onContentUpdate'] === 'function' ) {
                    this.opts['onContentUpdate'].call( null, this.sourceData );
                }
            }.bind( this );

        }

        updateFilter( filters ) {
            if ( !this.sourceData || this.sourceData.length === 0 ) {
                return;
            }

            let regDate = '(\\d{4}\\-\\d{2}\\-\\d{2})';
            let regTime = '(\\d{2}:\\d{2}:\\d{2})';
            let regLevel = '(CRITICAL|DEBUG|ERROR|INFO)';
            let regFilters = '((?!' + (filters || this.defaultFilters).join( '|' ) + ').+)';
            let reg = '\\[' + regDate + ' ' + regTime + '\\] report\\.' + regLevel + ': ' + regFilters + '\\n';

            this.filteredData = [];
            let matches = this.fileContent.matchAll( new RegExp( reg, 'g' ) );
            for ( let match of matches ) {
                this.filteredData.push( {
                    date: match[1],
                    time: match[2],
                    level: match[3],
                    content: match[4]
                } );
            }

            if ( typeof this.opts['onFilterUpdate'] === 'function' ) {
                this.opts['onFilterUpdate'].call( null, this.filteredData );
            }
        }

        updateFileContent() {
            if ( !this.elFile['files'][0] ) {
                return;
            }
            this.reader.readAsText( this.elFile['files'][0], 'UTF-8' );
        }

    }

    return function( options ) {
        return new LogFilter( options );
    };

} );