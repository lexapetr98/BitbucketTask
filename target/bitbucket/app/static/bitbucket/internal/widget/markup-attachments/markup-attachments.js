define('bitbucket/internal/widget/markup-attachments/markup-attachments', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/events', 'bitbucket/internal/util/feature-enabled', 'bitbucket/internal/util/function', 'bitbucket/internal/util/promise', 'bitbucket/internal/util/property', 'bitbucket/internal/util/text', 'bitbucket/internal/widget/drag-drop-file-uploader/drag-drop-file-uploader', 'bitbucket/internal/widget/inline-error-dialog/inline-error-dialog'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _pageState, _events, _featureEnabled, _function, _promise, _property, _text, _dragDropFileUploader, _inlineErrorDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _featureEnabled2 = babelHelpers.interopRequireDefault(_featureEnabled);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    var _dragDropFileUploader2 = babelHelpers.interopRequireDefault(_dragDropFileUploader);

    var _inlineErrorDialog2 = babelHelpers.interopRequireDefault(_inlineErrorDialog);

    /**
     * Are attachments enabled on the server?
     * getFromProvider is essentially synchronous even though there is a promise API,
     * so this should always resolve before the first MarkupAttachments is initialised.
     * If it doesn't, MarkupAttachments will default to being disabled.
     */
    var attachmentsEnabled;
    _featureEnabled2.default.getFromProvider('attachments').done(function (enabled) {
        attachmentsEnabled = enabled;
    });

    /**
     * Get the server max attachment size.
     * getFromProvider is essentially synchronous even though there is a promise API,
     * so this should always resolve before the first MarkupAttachments is initialised.
     * Even if it didn't, it would pass undefined as the fileSizeLimit to DragDropFileUploader,
     * which just means the default value in ClientFileHandler would be used.
     * Out of the box, that value and attachment.upload.max.size are the same.
     */
    var maxAttachmentSize;
    _property2.default.getFromProvider('attachment.upload.max.size').done(function (val) {
        maxAttachmentSize = val;
    });

    /**
     * Module for uploading attachments and adding the correct markup for them to a textarea
     *
     * @param {HTMLElement|jQuery} editor - the editor element containing the textarea and upload button
     * @constructor MarkupAttachments
     */
    function MarkupAttachments(editor) {
        if (!MarkupAttachments.isSupported()) {
            throw new Error('MarkupAttachments requires DragDropFileUploader support');
        }

        this.init.apply(this, arguments);
    }

    MarkupAttachments.isEnabled = function () {
        return attachmentsEnabled;
    };
    MarkupAttachments.isSupported = _dragDropFileUploader2.default.isSupported;
    MarkupAttachments._editorClass = 'markup-attachments';

    /**
     * Initialise the MarkupAttachments
     *
     * @param {HTMLElement|jQuery} editor - the editor element containing the textarea and upload button
     */
    MarkupAttachments.prototype.init = function (editor) {
        this.$editor = (0, _jquery2.default)(editor);
        this.$textarea = this.$editor.find('textarea');
        this.$uploadButton = this.$editor.find('.markup-attachments-button');
        this._destroyables = [];

        _lodash2.default.bindAll(this, 'handleUpload', 'handleAttachment', 'handleFailures', 'hideErrors');

        this.$editor.addClass(MarkupAttachments._editorClass);

        this.dragDropFileUploader = new _dragDropFileUploader2.default(this.$editor, {
            url: getAttachmentsUrl,
            fieldName: 'files',
            uploadButton: this.$uploadButton,
            fileSizeLimit: maxAttachmentSize
        });
        this._destroyables.push(this.dragDropFileUploader);
        this._destroyables.push(_events2.default.chainWith(this.dragDropFileUploader).on({
            filesSelected: this.hideErrors,
            invalidFiles: _function2.default.partialRight(_lodash2.default.forEach, _function2.default.binary(this.handleFailures)), //Handle each TYPE of failure, which may have several files
            uploadStarted: this.handleUpload
        }));

        var formattedFileSizeLimit = _text2.default.formatSizeInBytes(this.dragDropFileUploader.options.fileSizeLimit);

        this.errorDialog = new _inlineErrorDialog2.default(this.$uploadButton, {
            title: function title(errors) {
                return _aui2.default.I18n.getText('bitbucket.web.markup.attachments.error.title', errors.length);
            },
            subtitle: _aui2.default.I18n.getText('bitbucket.web.markup.attachments.error.subtitle', formattedFileSizeLimit)
        });
        this._destroyables.push(this.errorDialog);
        //Reattach the dialog any time the editor changes size (which causes the trigger to move)
        this._destroyables.push(_events2.default.chainWith(this.$editor).on('resize', this.errorDialog.refresh));

        var $successIcon = (0, _jquery2.default)(aui.icons.icon({ icon: 'success', useIconFont: true })).appendTo(this.$uploadButton);
        this._destroyables.push({
            destroy: $successIcon.remove.bind($successIcon)
        });

        this.rollingSpinner = _promise2.default.rollingSpinner(this.$uploadButton);
    };

    /**
     * Add a spinner and bind the attachment handling
     *
     * @param {Promise} uploadPromise - The xhr promise for the upload
     * @param {File} file - The file that was uploaded
     */
    MarkupAttachments.prototype.handleUpload = function (uploadPromise, file) {
        this.rollingSpinner.add(uploadPromise);

        // The backend supports attaching multiple files to a single upload, hence `attachments` and the use of forEach,
        // but we always submit each file individually so we can get a progress indicator for each.
        // `attachments.length` should always be 1.
        var onUpload = _lodash2.default.flow(_function2.default.dot('attachments'), //Pluck out the attachments
        _function2.default.partialRight(_lodash2.default.forEach, _lodash2.default.partial(this.handleAttachment, file) //Handle each attachment, passing in the original file
        ));

        var onError = function onError(xhr, reason) {
            this.handleFailures([file], reason, { statusCode: xhr.status });
        };

        uploadPromise.done(onUpload).fail(onError.bind(this));
    };

    /**
     * Build the markdown for the attachment and add it to the textarea
     *
     * @param {File} file - The file that was uploaded
     * @param {object} attachment - The response from the server with the attachment url
     */
    MarkupAttachments.prototype.handleAttachment = function (file, attachment) {
        if (attachment.errors) {
            var firstError = _lodash2.default.head(attachment.errors);
            this.handleFailures([file], firstError.exceptionName, {
                message: firstError.message
            });
            return;
        }

        this.$textarea.val(maybeAddNewline(this.$textarea.val()) + generateMarkdown(attachment, file.name, file.type)).trigger('input').focus();
    };

    /**
     * Handle the file upload failures (defer to this.errorDialog)
     *
     * @param {File[]} files - List of files that failed to upload
     * @param {string} reason - reason for the failure
     * @param {?Object} errorData - optional extra error data
     */
    MarkupAttachments.prototype.handleFailures = function (files, reason, errorData) {
        if (reason === 'abort' || reason === 'error' && errorData.statusCode !== 500) {
            //Don't show the error dialog for aborts or server errors other than 500 (will be handled by default handlers)
            //Hide the dialog if it was already showing
            this.hideErrors();
            return;
        }

        _lodash2.default.map(files, 'name').forEach(this.errorDialog.add);
        this.errorDialog.show();
    };

    /**
     * Hide the file upload errors
     */
    MarkupAttachments.prototype.hideErrors = function () {
        this.errorDialog.hide();
    };

    /**
     * Destroy the instance
     */
    MarkupAttachments.prototype.destroy = function () {
        this.$editor.removeClass(MarkupAttachments._editorClass);
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    /**
     * Get the attachments endpoint url for the current repository
     * @returns {string}
     */
    var getAttachmentsUrl = function getAttachmentsUrl() {
        return _pageState2.default.getRepository() && _navbuilder2.default.currentRepo().attachments().build();
    };

    /**
     * Strip non-word characters (excluding '.' and '-'). If zero length filename, or filename starts with '.', prepend 'upload'
     * @param {string} fileName
     * @returns {string}
     */
    function sanitizeFileName(fileName) {
        fileName = (fileName || '').replace(/[^\w\.\-]/g, '');
        return fileName.length === 0 || _lodash2.default.head(fileName) === '.' ? 'upload' + fileName : fileName;
    }

    /**
     * Remove `(` and `)` from urls to avoid breaking markdown link syntax
     * @param {string} url
     * @returns {string}
     */
    function sanitizeUrl(url) {
        return url.replace(/([\(\)])/g, '\\$1');
    }

    /**
     * Generate the markdown code for the attachment.
     * Images are are embedded and linked to (to show full size), other file types are just linked to.
     *
     * @param {Object} attachment
     * @param {string} fileName
     * @param {string} fileType
     * @returns {string}
     */
    function generateMarkdown(attachment, fileName, fileType) {
        var attachmentLink = attachment.links.attachment;
        var attachmentUrl = attachmentLink && attachmentLink.href || attachment.links.self.href;

        var sanitizedFileName = sanitizeFileName(fileName);
        var sanitizedUrl = sanitizeUrl(attachmentUrl);

        //Embed and link images but just link other file types
        var linkContent = _dragDropFileUploader2.default.typeFilters.image.test(fileType) ? '![' + sanitizedFileName + '](' + sanitizedUrl + ')' : sanitizedFileName;

        return '[' + linkContent + '](' + sanitizedUrl + ')';
    }

    /**
     * Add a trailing newline if one doesn't exist, unless the text is empty.
     * @param {string} text
     * @returns {string}
     */
    function maybeAddNewline(text) {
        return text + (text.length && _lodash2.default.last(text) !== '\n' ? '\n' : '');
    }

    exports.default = MarkupAttachments;
    module.exports = exports['default'];
});