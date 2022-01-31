define('bitbucket/internal/widget/drag-drop-file-uploader/drag-drop-file-uploader', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/client-file-handlers/client-file-uploader', 'bitbucket/internal/widget/drag-drop-file-target/drag-drop-file-target', 'bitbucket/internal/widget/faux-upload-field/faux-upload-field', 'bitbucket/internal/widget/paste-image-target/paste-image-target'], function (module, exports, _jquery, _lodash, _events, _clientFileUploader, _dragDropFileTarget, _fauxUploadField, _pasteImageTarget) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _clientFileUploader2 = babelHelpers.interopRequireDefault(_clientFileUploader);

    var _dragDropFileTarget2 = babelHelpers.interopRequireDefault(_dragDropFileTarget);

    var _fauxUploadField2 = babelHelpers.interopRequireDefault(_fauxUploadField);

    var _pasteImageTarget2 = babelHelpers.interopRequireDefault(_pasteImageTarget);

    /**
     * Allow users to drag and drop a file onto a target element and have it uploaded to the server
     * Also optionally allows users to browse to select a file to upload or paste image data into the target to upload
     *
     * @param {HTMLElement|jQuery} target
     * @param {Object} opts
     * @constructor DragDropFileUploader
     */
    function DragDropFileUploader(target, opts) {
        if (!DragDropFileUploader.isSupported()) {
            throw new Error('DragDropUploader requires ClientFileUploader support');
        }

        this.init.apply(this, arguments);
    }

    DragDropFileUploader.typeFilters = _clientFileUploader2.default.typeFilters;
    DragDropFileUploader.isSupported = _clientFileUploader2.default.isSupported;

    _events2.default.addLocalEventMixin(DragDropFileUploader.prototype);

    /**
     * Default options.
     *
     * @param {string|function}     url                     The url to upload the files to, or a function that returns it. Must be supplied
     * @param {string}              fieldName               The name of the POST param expected when uploading. Defaults to `file`
     * @param {function}            uploadHandler           Receives a promise for the upload with updating `progress` (http://api.jquery.com/deferred.progress/)
     * @param {function}            uploadButton
     * @param {regExp}              fileTypeFilter          The filter to use for incoming file types.
     *                                                      Can be a regex or one of the predefined ClientFileHandler.typeFilters. Uses ClientFileHandler default of `all`
     * @param {number}              fileCountLimit          The number of files that can be selected for upload at once.  Uses ClientFileHandler default of `infinity` (no limit)
     * @param {number}              fileSizeLimit           The maximum size an individual can be. Uses ClientFileHandler default of 10MB
     * @param {boolean}             pasteUpload             Whether a user can paste image data into the target to upload
     */
    DragDropFileUploader.prototype.defaults = {
        url: null,
        fieldName: 'file',
        uploadButton: undefined,
        fileTypeFilter: undefined,
        fileCountLimit: undefined,
        fileSizeLimit: undefined,
        pasteUpload: true
    };

    /**
     * Initialise the DragDropFileUploader
     * @param {HTMLElement|jQuery} target
     * @param opts
     */
    DragDropFileUploader.prototype.init = function (target, opts) {
        this.$target = (0, _jquery2.default)(target);
        //Pull up the limit options from the clientFileUploaders defaults so that other modules can access them
        var clientFileHandlerLimitDefaults = _lodash2.default.pick(_clientFileUploader2.default.prototype.defaults, 'fileTypeFilter', 'fileCountLimit', 'fileSizeLimit');
        this.options = _jquery2.default.extend({}, this.defaults, clientFileHandlerLimitDefaults, opts);
        this._destroyables = [];

        var clientFileUploader = new _clientFileUploader2.default({
            url: this.options.url,
            fieldName: this.options.fieldName,
            fileSizeLimit: this.options.fileSizeLimit
        });

        this._destroyables.push(this.retriggerFrom(clientFileUploader, 'filesSelected', 'validFiles', 'invalidFiles', 'uploadStarted'));
        this._destroyables.push(clientFileUploader);

        this._destroyables.push(new _dragDropFileTarget2.default(this.$target, {
            clientFileHandler: clientFileUploader
        }));

        if (this.options.uploadButton) {
            this._destroyables.push(new _fauxUploadField2.default((0, _jquery2.default)(this.options.uploadButton), {
                clientFileHandler: clientFileUploader,
                allowMultiple: this.options.fileCountLimit > 1
            }));
        }

        if (this.options.pasteUpload) {
            this._destroyables.push(new _pasteImageTarget2.default(this.$target, clientFileUploader));
        }
    };

    /**
     * Destroy the instance
     */
    DragDropFileUploader.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    exports.default = DragDropFileUploader;
    module.exports = exports['default'];
});