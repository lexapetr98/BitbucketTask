define('bitbucket/internal/widget/submit-spinner/submit-spinner', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function SubmitSpinner(buttonElement, position) {
        if (!(this instanceof SubmitSpinner)) {
            return new (Function.prototype.bind.apply(SubmitSpinner, [null].concat(Array.prototype.slice.call(arguments))))();
        }

        this.$button = (0, _jquery2.default)(buttonElement);
        this.$spinner = (0, _jquery2.default)('<div class="submit-spinner invisible" />');

        if (position === 'before') {
            this.$spinner.insertBefore(this.$button);
        } else {
            this.$spinner.insertAfter(this.$button);
        }
    }

    SubmitSpinner.prototype.show = function () {
        this.$spinner.removeClass('invisible');
        this.$spinner.spin();
        return this;
    };

    SubmitSpinner.prototype.hide = function () {
        this.$spinner.addClass('invisible');
        this.$spinner.spinStop();
        return this;
    };

    SubmitSpinner.prototype.remove = function () {
        this.$spinner.remove();
        return this;
    };

    exports.default = SubmitSpinner;
    module.exports = exports['default'];
});