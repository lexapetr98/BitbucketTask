define('bitbucket/internal/feature/settings/hooks/hook-config-form-util', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'wrm/require', 'bitbucket/internal/util/web-fragment-manager'], function (module, exports, _aui, _jquery, _lodash, _require, _webFragmentManager) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = getHookConfigView;

    var _require2 = babelHelpers.interopRequireDefault(_require);

    var _webFragmentManager2 = babelHelpers.interopRequireDefault(_webFragmentManager);

    var viewCache = new Map();

    function getHookConfigView(hook) {
        var configFormKey = hook.details.configFormKey;

        var loadError = new Error(_aui.I18n.getText('bitbucket.web.hooks.config.view.load.error', hook.details.name));
        var wrapView = function wrapView(view) {
            return function (ctx) {
                try {
                    return view(ctx);
                } catch (e) {
                    return new Error(_aui.I18n.getText('bitbucket.web.hooks.config.view.render.error', hook.details.name));
                }
            };
        };

        if (viewCache.has(configFormKey)) {
            return (0, _jquery.Deferred)().resolve(viewCache.get(configFormKey)).promise();
        }

        return (0, _require2.default)('wrc!' + configFormKey).then(function () {
            var view = (0, _lodash.get)((0, _lodash.head)(_webFragmentManager2.default.getWebFragmentDescriptors(configFormKey, 'panel')), 'view');

            return view ? wrapView(view) : (0, _jquery.Deferred)().reject(loadError).promise();
        }, function () {
            return loadError;
        }).done(function (view) {
            viewCache.set(configFormKey, view);
        });
    }
    module.exports = exports['default'];
});