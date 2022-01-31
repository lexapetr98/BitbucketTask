define('bitbucket/internal/widget/upload-interceptor/upload-interceptor', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    /**
     * Intercept the file selection in a file input and pass it on to a ClientFileHandler
     *
     * @param {HTMLElement|jQuery} el
     * @param {ClientFileHandler} clientFileHandler
     * @constructor UploadInterceptor
     */
    function UploadInterceptor(el, clientFileHandler) {
        this.init.apply(this, arguments);
    }

    /**
     * Initialise the UploadInterceptor
     *
     * @param {HTMLElement|jQuery} el
     * @param {ClientFileHandler} clientFileHandler
     */
    UploadInterceptor.prototype.init = function (el, clientFileHandler) {
        _lodash2.default.bindAll(this, 'onSelectFile');

        this.$el = (0, _jquery2.default)(el);
        this.clientFileHandler = clientFileHandler;
        this._destroyables = [];
        this._destroyables.push(_events2.default.chainWith(this.$el).on('change', this.onSelectFile));
    };

    /**
     * Handle the selected file(s) with the ClientFileHandler
     * @param {jQuery.event} e - the change event
     */
    UploadInterceptor.prototype.onSelectFile = function (e) {
        var el = e.target;
        if (el.files && el.files.length && this.clientFileHandler) {
            this.clientFileHandler.handleFiles(el.files, el);

            //Reset the upload field by wrapping it in a form element and calling reset on it
            (0, _jquery2.default)(el).wrap('<form>').parent('form').trigger('reset').end().unwrap();
        }
    };

    /**
     * Destroy the instance
     */
    UploadInterceptor.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    exports.default = UploadInterceptor;
    module.exports = exports['default'];
});