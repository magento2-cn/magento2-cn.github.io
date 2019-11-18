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
        loading = false;
        reader;
        sourceData;
        filteredData;

        constructor( options ) {

            this.opts = $.extend( true, this.opts, options );
            this.elFile = $( '#' + this.opts['elemId'] ).get( 0 );

            this.reader = new FileReader();
            this.reader.onload = function( evt ) {
                this.sourceData = evt.target['result'].match( /\[\d{4}\-\d{2}\-\d{2} \d{2}:\d{2}:\d{2}\] report\..+: .+\n/g );
                if ( typeof this.opts['onContentUpdate'] === 'function' ) {
                    this.opts['onContentUpdate'].call( null, this.sourceData );
                }
                this.loading = false;
            }.bind( this );

        }

        filterRow( date, time, level, content, filters ) {
            if ( (new RegExp( '(?:' + filters.join( '|' ) + ')' )).test( content ) ) {
                return false;
            }
            return {
                date: date,
                time: time,
                level: level,
                content: content.replace( ' [] []', '' )
            }
        }

        updateFilter( filters ) {
            if ( !this.sourceData || this.sourceData.length === 0 ) {
                return;
            }

            this.filteredData = [];
            filters = filters || this.defaultFilters;
            for ( let i = 0; i < this.sourceData.length; i++ ) {
                let matchRow = this.sourceData[i].match( /\[(\d{4}\-\d{2}\-\d{2}) (\d{2}:\d{2}:\d{2})\] report\.(CRITICAL|DEBUG|ERROR|INFO): (.+)/ );
                if ( !matchRow ) {
                    continue;
                }
                let rowData = this.filterRow( matchRow[1], matchRow[2], matchRow[3], matchRow[4], filters );
                if ( rowData ) {
                    this.filteredData.push( rowData );
                }
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

        getSourceData() {
            return this.sourceData;
        }

    }

    return function( options ) {
        return new LogFilter( options );
    };

} );