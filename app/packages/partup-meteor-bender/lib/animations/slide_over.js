var SlideOver;
var __bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; };

SlideOver = (function() {
    SlideOver.INSERT = {
        slideOverUp: '100%',
        slideOverDown: '-100%'
    };

    SlideOver.animations = ['slideOverUp', 'slideOverDown'];

    SlideOver.prototype.animationDuration = 400;

    function SlideOver(_at_animation, startCallback, endCallback) {
        this.animation = _at_animation;
        this.removeElement = __bind(this.removeElement, this);
        this.insertElement = __bind(this.insertElement, this);
        this.startCallback = startCallback;
        this.endCallback = endCallback;
    }

    SlideOver.prototype.insertElement = function(node, next) {
        var start;
        start = this.constructor.INSERT[this.animation];
        if (this.startCallback) this.startCallback();
        $(node).insertBefore(next);
        return $(node).velocity({
            translateY: [0, start]
        }, {
            duration: this.animationDuration,
            easing: 'ease-in-out',
            queue: false,
            complete: function () {
                if (this[0].style.cssText.indexOf('translateY(0px)') > -1) {
                    this[0].style.cssText = '';
                }
            }
        });
    };

    SlideOver.prototype.removeElement = function(node) {
        var endCallback = this.endCallback;
        return setTimeout((function(_this) {
            return function() {
                return $('.velocity-animating').promise().done(function() {
                    if (typeof endCallback === 'function') endCallback();
                    return $(node).remove();
                });
            };
        })(this), this.animationDuration);
    };

    return SlideOver;

})();

this.Bender.animations.push(SlideOver);

// ---
// generated by coffee-script 1.9.0
