define('bitbucket/internal/util/warn-before-unload', ['module', 'exports', '@atlassian/aui'], function (module, exports, _aui) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    /**
     * Wrap this function around a promise and the user will be presented with a message and a confirmation box
     * if they attempt to close the window before the promise is resolved or rejected.
     *
     * @param {Object} promise the promise to wrap.
     * @param {String} message a string to present when the window is closing.  Avoid asking a question - the browser will add one.
     */
    function warnBeforeUnload(promise, message) {
        var predicate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
            return true;
        };

        var completed = false;

        message = message || _aui2.default.I18n.getText('bitbucket.web.warnonunload', bitbucket.internal.util.productName());

        var oldOnBeforeUnload = window.onbeforeunload;
        var newOnBeforeUnload = function newOnBeforeUnload() {
            if (!completed && predicate()) {
                return message;
            }
            if (oldOnBeforeUnload) {
                return oldOnBeforeUnload.apply(this, arguments);
            }
            return undefined;
        };

        window.onbeforeunload = newOnBeforeUnload;

        promise.always(function () {
            completed = true;
            if (window.onbeforeunload === newOnBeforeUnload) {
                //someone might have beaten us
                window.onbeforeunload = oldOnBeforeUnload;
            }
        });
    }

    exports.default = warnBeforeUnload;
    module.exports = exports['default'];
});