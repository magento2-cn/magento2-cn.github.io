/**
 * Additional processing
 *
 * @param {Object} $
 */
require(['jquery'], function ($) {

    const elDoc = $(document);

    /**
     * Add direction flag in scroll event
     * down: 1, up: -1
     */
    let scrollTop = elDoc.scrollTop();
    elDoc.on('scroll', function (evt) {
        let tmpScrollTop = elDoc.scrollTop();
        evt.dir = tmpScrollTop > scrollTop ? 1 : -1;
        scrollTop = tmpScrollTop;
    });

    /**
     * Add touch events
     */
    $.extend($.event.special, {
        touch: {
            setup: function () {
                let touchStartX, touchStartY, self = $(this);
                self.on({
                    touchstart: function (evt) {
                        touchStartX = evt.changedTouches[0].screenX;
                        touchStartY = evt.changedTouches[0].screenY;
                    },
                    touchend: function (evt) {
                        let dx = evt.changedTouches[0].screenX - touchStartX;
                        let dy = evt.changedTouches[0].screenY - touchStartY;
                        if (Math.abs(dx) > Math.abs(dy)) {
                            if (dx > 0) {
                                self.trigger('touchtoright', {type: 'touchtoright'});
                            } else {
                                self.trigger('touchtoleft', {type: 'touchtoleft'});
                            }
                        } else {
                            if (dy > 0) {
                                self.trigger('touchtodown', {type: 'touchtodown'});
                            } else {
                                self.trigger('touchtoup', {type: 'touchtoup'});
                            }
                        }
                    }
                });
            }
        }
    });

    $.each({
        touchtoright: 'touch',
        touchtoleft: 'touch',
        touchtodown: 'touch',
        touchtoup: 'touch'
    }, function (orig, fix) {
        $.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function (evt, data) {
                if (data.type !== orig) {
                    return;
                }

                let ret, target = this, related = evt.relatedTarget, handleObj = evt.handleObj;
                if (!related || (related !== target && !$.contains(target, related))) {
                    evt.type = handleObj.origType;
                    ret = handleObj.handler.apply(this, arguments);
                    evt.type = fix;
                }
                return ret;
            }
        };
    });

});