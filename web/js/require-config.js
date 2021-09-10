require.config({
    waitSeconds: 0,
    paths: {
        jquery: 'web/js/lib/jquery',
        text: 'web/js/lib/text',
        knockout: 'web/js/lib/knockout',
        mousewheel: 'web/js/lib/jquery.mousewheel-3.0.6.min',
        highlight: 'web/js/lib/highlight.min',
        scrollbar: 'web/js/lib/jquery.mCustomScrollbar.min'
    },
    shim: {
        mousewheel: {
            deps: ['jquery']
        },
        scrollbar: {
            deps: ['jquery', 'mousewheel']
        }
    }
});