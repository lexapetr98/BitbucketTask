define('bitbucket/internal/widget/faux-upload-field/faux-upload-field', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/navigator', 'bitbucket/internal/widget/client-file-handlers/client-file-handler', 'bitbucket/internal/widget/upload-interceptor/upload-interceptor'], function (module, exports, _jquery, _lodash, _domEvent, _events, _navigator, _clientFileHandler, _uploadInterceptor) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _clientFileHandler2 = babelHelpers.interopRequireDefault(_clientFileHandler);

    var _uploadInterceptor2 = babelHelpers.interopRequireDefault(_uploadInterceptor);

    /**
     * An upload field that can be styled and triggers interaction with an actual file input
     * @param {HTMLElement|jQuery} el - The fake upload field (preferably a `<label>`)
     * @param {object} opts
     * @constructor FauxUploadField
     */
    function FauxUploadField(el, opts) {
        this.init.apply(this, arguments);
    }

    /**
     * @default
     * @property {ClientFileHandler} clientFileHandler -
     * @property {?string|Regexp} accept - The file types to accept. https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#attr-accept
     *                                    Either a ClientFileHandler.typeFilters which is converted to a string, or a string
     * @property {boolean} allowMultiple - Whether to allow the selection of multiple files.
     */
    FauxUploadField.prototype.defaults = {
        clientFileHandler: null,
        accept: null,
        allowMultiple: false
    };

    /**
     * Create the upload field and link it to the el.
     *
     * @param {HTMLElement|jQuery} el - The fake upload field (preferably a `<label>`)
     * @param {object} opts
     */
    FauxUploadField.prototype.init = function (el, opts) {
        this.$el = (0, _jquery2.default)(el);
        this._destroyables = [];

        //Map ClientFileHandler.typeFilters to an `accept` string
        switch (opts.accept) {
            case _clientFileHandler2.default.typeFilters.audio:
                opts.accept = 'audio/*';
                break;
            case _clientFileHandler2.default.typeFilters.image:
                opts.accept = 'image/*';
                break;
            case _clientFileHandler2.default.typeFilters.imageWeb:
                opts.accept = 'image/jpeg, image/gif, image/png';
                break;
            case _clientFileHandler2.default.typeFilters.video:
                opts.accept = 'video/*';
                break;
        }

        this.options = _jquery2.default.extend({}, this.defaults, opts);

        var fieldId = _lodash2.default.uniqueId('faux-upload-field-');

        var $uploadField = (0, _jquery2.default)(bitbucket.internal.widget.fauxUploadField.uploadField({
            id: fieldId,
            accept: this.options.accept,
            allowMultiple: this.options.allowMultiple
        })).insertBefore(this.$el);

        this.$el.tooltip({
            gravity: _jquery2.default.fn.tipsy.autoNS
        });

        if (this.$el.is('label')) {
            //Using a label as the FauxUploadField element is the most reliable
            this.$el.attr('for', fieldId);
        } else if ((0, _navigator.isIE)()) {
            // IE marks a file input as compromised if has a click triggered programmatically
            // and this prevents you from later submitting it's form via Javascript.
            // If the $el isn't a label, the only thing you can do is show the native upload field instead
            this.$el.hide();
            $uploadField.show();
        } else {
            // In browsers other than IE you can trigger the clicks programmatically
            this._destroyables.push(_events2.default.chainWith(this.$el).on('click', _domEvent2.default.preventDefault($uploadField.click.bind($uploadField))));
        }

        if (this.options.clientFileHandler) {
            //If we have a clientFileHandler, intercept the file selection and process it with the clientFileHandler
            this._destroyables.push(new _uploadInterceptor2.default($uploadField, this.options.clientFileHandler));
        }
    };

    /**
     * Destroy the instance
     */
    FauxUploadField.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    exports.default = FauxUploadField;
    module.exports = exports['default'];
});