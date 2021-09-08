require([
    'jquery'
], function ($) {

    const elWin = $(window);
    const elDoc = $(document);
    const elBody = $('body');
    const mobileW = 768;

    const updateOnScroll = function (evt) {

        let scrollTop = elDoc.scrollTop();

        /**
         * Home page background
         */
        if (elBody.hasClass('home') && elWin.width() > mobileW) {
            let elInfo = elBody.find('> .info');
            let boxH = elInfo.outerHeight();
            let dyContent = boxH * .8;
            let dyBg = boxH * .05;
            let percentage = scrollTop / boxH;
            elInfo.find('.content .box').css({
                marginTop: -30 - dyContent * percentage,
                opacity: 1 - percentage
            });
            elInfo.find('.bg').css('marginTop', -dyBg * percentage);

            let imgH = boxH + dyBg * percentage;
            let width = imgH * elInfo.find('.bg img').get(0).naturalWidth / elInfo.find('.bg img').get(0).naturalHeight;
            elInfo.find('.bg img').css({
                height: imgH,
                marginLeft: (elWin.width() - width) / 2,
                width: width
            });
        }

    };

    elDoc.on('scroll', updateOnScroll);

});