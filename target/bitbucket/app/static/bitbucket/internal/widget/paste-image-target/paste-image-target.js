define('bitbucket/internal/widget/paste-image-target/paste-image-target', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function', 'bitbucket/internal/widget/client-file-handlers/client-file-handler'], function (module, exports, _jquery, _lodash, _events, _function, _clientFileHandler) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _clientFileHandler2 = babelHelpers.interopRequireDefault(_clientFileHandler);

    /**
     * Capture image data pastes in the target element and pass them off to a ClientFileHandler
     *
     * @param {HTMLElement|jQuery} el
     * @param {ClientFileHandler} clientFileHandler
     * @constructor PasteImageTarget
     */
    function PasteImageTarget(el, clientFileHandler) {
        this.init.apply(this, arguments);
    }

    /**
     * Initialise the PasteImageTarget
     *
     * @param {HTMLElement|jQuery} el
     * @param {ClientFileHandler} clientFileHandler
     */
    PasteImageTarget.prototype.init = function (el, clientFileHandler) {
        _lodash2.default.bindAll(this, 'handlePaste', 'processClipboardItem');

        this.$el = (0, _jquery2.default)(el);
        this.clientFileHandler = clientFileHandler;
        this._destroyables = [];
        this._destroyables.push(_events2.default.chainWith(this.$el).on('paste', this.handlePaste));
    };

    /**
     * Filter out non-image-data pastes and pass valid pastes on to processClipboardItem
     *
     * @param {jQuery.Event} e
     */
    PasteImageTarget.prototype.handlePaste = function (e) {
        var imageFilter = _clientFileHandler2.default.typeFilters.image;
        var originalEvent = e.originalEvent;
        var clipboardItems = originalEvent.clipboardData && originalEvent.clipboardData.items;

        if (this.clientFileHandler && clipboardItems && clipboardItems.length === 1) {
            //Heuristic to try and weed out pastes of copied files (from the file system) instead of image data from the clipboard
            //Pasted files have 2 items, 1 for the file name and one for the icon
            _lodash2.default.toArray(clipboardItems).filter(_lodash2.default.flow(_function2.default.dot('type'), imageFilter.test.bind(imageFilter))).forEach(this.processClipboardItem);
        }
    };

    /**
     * Convert the paste to a File with a name (upload.*) and pass it off to the ClientFileHandler
     * @param {DataTransferItem} item
     */
    PasteImageTarget.prototype.processClipboardItem = function (item) {
        var file = item.getAsFile();
        if (!file.name) {
            file.name = 'upload.' + _lodash2.default.last(file.type.split('/'));
        }
        this.clientFileHandler.handleFiles([file], this.$el);
    };

    /**
     * Destroy the instance
     */
    PasteImageTarget.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    exports.default = PasteImageTarget;
    module.exports = exports['default'];
});