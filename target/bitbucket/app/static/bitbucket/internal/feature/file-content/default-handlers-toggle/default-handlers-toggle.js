define('bitbucket/internal/feature/file-content/default-handlers-toggle/default-handlers-toggle', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/feature/files/file-handlers', 'bitbucket/util/events'], function (module, exports, _jquery, _lodash, _fileHandlers, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _fileHandlers2 = babelHelpers.interopRequireDefault(_fileHandlers);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var forcedDefaultHandler = false;

    function init() {
        _events2.default.on('bitbucket.internal.feature.fileContent.handlerRequested', function (context) {
            forcedDefaultHandler = context.useDefaultHandler;
        });

        (0, _jquery2.default)(document).on('click', '.use-default-handlers-button', function (e) {
            return _events2.default.trigger('bitbucket.internal.feature.fileContent.useDefaultHandler');
        }).on('click', '.use-extended-handlers-button', function (e) {
            return _events2.default.trigger('bitbucket.internal.feature.fileContent.useExtendedHandler');
        });
    }

    function isExtendedHandler(context) {
        return !_lodash2.default.includes(_fileHandlers2.default.builtInHandlers, context.handlerID);
    }

    var isForcedDefaultHandler = function isForcedDefaultHandler() {
        return forcedDefaultHandler;
    };

    exports.default = {
        init: init,
        isExtendedHandler: isExtendedHandler,
        isForcedDefaultHandler: isForcedDefaultHandler
    };
    module.exports = exports['default'];
});