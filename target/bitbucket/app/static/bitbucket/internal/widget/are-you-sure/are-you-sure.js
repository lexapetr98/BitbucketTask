define('bitbucket/internal/widget/are-you-sure/are-you-sure', ['exports', '@atlassian/aui', 'jquery'], function (exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Size = undefined;

    exports.default = function (_ref) {
        var title = _ref.title,
            bodyContent = _ref.bodyContent,
            confirmButtonText = _ref.confirmButtonText,
            _ref$size = _ref.size,
            size = _ref$size === undefined ? Size.SMALL : _ref$size,
            _ref$warning = _ref.warning,
            warning = _ref$warning === undefined ? true : _ref$warning;

        var dialogDeferred = new _jquery.Deferred();
        var dialog = _aui2.default.dialog2(bitbucket.internal.widget.areYouSure.dialog({
            title: title,
            bodyContent: bodyContent,
            confirmButtonText: confirmButtonText,
            size: size,
            warning: warning
        }));

        dialog.show().$el.find('.confirm-button').click(function () {
            return dialogDeferred.resolve();
        }).end().find('.cancel-button').click(function () {
            return dialogDeferred.reject();
        }).focus();

        return dialogDeferred.promise().always(function () {
            return dialog.hide();
        });
    };

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var Size = exports.Size = {
        SMALL: 'small',
        MEDIUM: 'medium',
        LARGE: 'large',
        XLARGE: 'xlarge'
    };

    /**
     * Show a light-weight confirmation dialog.
     * For something with more magic, see ConfirmDialog
     *
     * @param {object} options
     * @returns {Promise}
     */
});