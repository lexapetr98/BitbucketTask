define('bitbucket/internal/page/maintenance/lock/lock', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/util/navbuilder', 'bitbucket/internal/layout/maintenance/maintenance', 'bitbucket/internal/util/ajax', 'bitbucket/internal/widget/submit-spinner/submit-spinner'], function (module, exports, _aui, _jquery, _navbuilder, _maintenance, _ajax, _submitSpinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _maintenance2 = babelHelpers.interopRequireDefault(_maintenance);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    function onReady(hasToken) {
        var pollUrl = _aui2.default.contextPath() + '/mvc/maintenance/lock';
        var cancelButtonId = 'cancel';
        var opts = {
            pollUrl: pollUrl,
            pollTickCallback: function pollTickCallback(progressBar, data, textStatus, xhr) {
                // always return undefined - never done until the pollUrl returns a 404
                return undefined;
            },
            cancelButtonId: cancelButtonId,
            redirectUrl: hasToken ? _navbuilder2.default.admin().build() : _navbuilder2.default.dashboard().build(),
            canceledHeader: _aui2.default.I18n.getText('bitbucket.web.lock.canceled.title', bitbucket.internal.util.productName()),
            cancelingDescription: _aui2.default.I18n.getText('bitbucket.web.lock.canceling.description', bitbucket.internal.util.productName()),
            hasCancelDialog: false
        };

        (0, _jquery2.default)('#' + cancelButtonId).on('click', function (event) {
            var $button = (0, _jquery2.default)(this);
            var $form = $button.closest('form');
            var $tokenField = $form.find('input[name=token]');
            var token = $tokenField.val();
            var spinner = new _submitSpinner2.default($button, 'after');

            spinner.show();

            // Can't use data() because jQuery sends the data as content body instead of query string parameters for
            // all non-GET requests. Encode the token into the query string of the url.
            _ajax2.default.rest({
                url: pollUrl + '?token=' + encodeURIComponent(token),
                type: 'DELETE',
                statusCode: {
                    '409': function _(xhr, textStatus, errorThrown, resp) {
                        $tokenField.parent().replaceWith(bitbucket.internal.layout.maintenance.tokenInputField(resp));
                        return false;
                    },
                    '*': false
                }
            }).always(function () {
                spinner.hide();
            }).done(function () {
                window.location = opts.redirectUrl;
            });

            event.preventDefault();
        });

        _maintenance2.default.init(opts);
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});