define('bitbucket/internal/feature/file-content/handlers/source-handler', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/feature/files/file-handlers', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/file-content/binary-source-view/binary-source-view', 'bitbucket/internal/feature/file-content/binary-view/binary-view', 'bitbucket/internal/feature/file-content/content-message/content-message', 'bitbucket/internal/feature/file-content/request-source', 'bitbucket/internal/feature/file-content/source-view/source-view', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/util/error', 'bitbucket/internal/util/property'], function (module, exports, _jquery, _lodash, _fileHandlers, _navbuilder, _binarySourceView, _binaryView, _contentMessage, _requestSource, _sourceView, _fileContentModes, _error, _property) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _fileHandlers2 = babelHelpers.interopRequireDefault(_fileHandlers);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _binarySourceView2 = babelHelpers.interopRequireDefault(_binarySourceView);

    var _binaryView2 = babelHelpers.interopRequireDefault(_binaryView);

    var _contentMessage2 = babelHelpers.interopRequireDefault(_contentMessage);

    var _requestSource2 = babelHelpers.interopRequireDefault(_requestSource);

    var _sourceView2 = babelHelpers.interopRequireDefault(_sourceView);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _error2 = babelHelpers.interopRequireDefault(_error);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    var maxSourceLines = 5000;
    _property2.default.getFromProvider('page.max.source.lines').done(function (val) {
        maxSourceLines = val;
    });

    /**
     * Wrap a basic handler function with the boilerplate for a source handler function (checking SOURCE vs DIFF,
     * getting the data, handling request errors)
     * @param {function(Object, Object) : Promise} fn
     * @param {bitbucket/feature/files/file-handlers.HandlerID} handlerID - the ID of this handler (for plugins to rely on)
     * @param {function(*)?} getStartFn - If supplied, use this to extract the start value from options.anchor
     * @returns {function(Object): Promise}
     */
    function asHandleFunc(fn, handlerID, getStartFn) {
        if (!handlerID) {
            throw new Error('Every handler we expose from core needs to have a handlerID.');
        }
        return function (options) {
            if (options.contentMode !== _fileContentModes2.default.SOURCE) {
                return _jquery2.default.Deferred().reject();
            }

            var params = {
                includeBlame: false
            };

            if (_lodash2.default.isFunction(getStartFn)) {
                _lodash2.default.assign(params, {
                    start: getStartFn(options.anchor)
                });
            }

            var $container = options.$container;
            return (0, _requestSource2.default)(options.fileChange, params).then(function (data) {
                return fn(data, options);
            }).then(function (ret) {
                if (!ret.handlerID) {
                    ret.handlerID = handlerID;
                }
                return ret;
            }, function (xhr, textStat, errorThrown, data) {
                if (data && data.errors && _error2.default.isErrorEntityWithinRepository(data.errors[0])) {
                    _contentMessage2.default.renderErrors($container, data);
                    return _jquery2.default.Deferred().resolve({
                        handlerID: _fileHandlers2.default.builtInHandlers.ERROR
                    });
                }
                return _jquery2.default.Deferred().reject();
            });
        };
    }

    var handleBinary = asHandleFunc(function (data, options) {
        if (!data.binary && !_binaryView2.default.treatTextAsBinary(options.fileChange.path.extension)) {
            return _jquery2.default.Deferred().reject();
        }
        return _jquery2.default.Deferred().resolve(new _binarySourceView2.default(options));
    }, _fileHandlers2.default.builtInHandlers.SOURCE_BINARY);

    var handleImage = asHandleFunc(function (data, options) {
        if (!data.binary && !_binaryView2.default.treatTextAsBinary(options.fileChange.path.extension)) {
            return _jquery2.default.Deferred().reject();
        }

        var path = options.fileChange.path;
        var revision = options.fileChange.commitRange.untilRevision;
        var binaryInfo = _binaryView2.default.getRenderedBinary(path, revision);
        if (binaryInfo.type !== 'image') {
            return _jquery2.default.Deferred().reject();
        }
        return _jquery2.default.Deferred().resolve(new _binarySourceView2.default(options));
    }, _fileHandlers2.default.builtInHandlers.SOURCE_IMAGE);

    var handleEmptyFile = asHandleFunc(function (data, options) {
        if (!data.lines || data.lines.length !== 0) {
            return _jquery2.default.Deferred().reject();
        }
        _contentMessage2.default.renderEmptyFile(options.$container, data, options.fileChange);
        return _jquery2.default.Deferred().resolve({});
    }, _fileHandlers2.default.builtInHandlers.SOURCE_EMPTY);

    /**
     * When a directory is encountered, redirect to the browse page to get back to the filebrowser.
     * Using a redirect here is definitely the less ideal way to handle it, and was done to fix BSERV-7389
     * A better solution would be to turn the filebrowser + source view in to an SPA to switch between them seamlessly.
     */
    var handleDirectory = asHandleFunc(function (data, options) {
        if (data.lines || !data.children) {
            return _jquery2.default.Deferred().reject();
        }
        window.location.href = _navbuilder2.default.currentRepo().browse().path(data.path).at(data.revision).build();
        return _jquery2.default.Deferred().resolve({});
    }, _fileHandlers2.default.builtInHandlers.DIRECTORY);

    var handleText = asHandleFunc(function (data, options) {
        if (!data.lines || data.lines.length === 0) {
            return _jquery2.default.Deferred().reject();
        }

        var sourceView = new _sourceView2.default(data, options);
        // Deferred for backwards compatibility - web fragments in file-content must render before the view is initialized.
        _lodash2.default.defer(sourceView.init.bind(sourceView));
        return _jquery2.default.Deferred().resolve(sourceView);
    }, _fileHandlers2.default.builtInHandlers.SOURCE_TEXT);

    exports.default = {
        handleBinary: handleBinary,
        handleImage: handleImage,
        handleEmptyFile: handleEmptyFile,
        handleDirectory: handleDirectory,
        handleText: handleText
    };
    module.exports = exports['default'];
});