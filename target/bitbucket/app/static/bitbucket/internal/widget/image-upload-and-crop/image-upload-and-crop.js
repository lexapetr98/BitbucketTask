define('bitbucket/internal/widget/image-upload-and-crop/image-upload-and-crop', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/text', 'bitbucket/internal/widget/canvas-cropper/canvas-cropper', 'bitbucket/internal/widget/client-file-handlers/client-file-reader', 'bitbucket/internal/widget/drag-drop-file-target/drag-drop-file-target', 'bitbucket/internal/widget/faux-upload-field/faux-upload-field', 'bitbucket/internal/widget/image-explorer/image-explorer', 'bitbucket/internal/widget/paste-image-target/paste-image-target', 'bitbucket/internal/widget/webcam-capture/webcam-capture'], function (module, exports, _aui, _jquery, _lodash, _text, _canvasCropper, _clientFileReader, _dragDropFileTarget, _fauxUploadField, _imageExplorer, _pasteImageTarget, _webcamCapture) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    var _canvasCropper2 = babelHelpers.interopRequireDefault(_canvasCropper);

    var _clientFileReader2 = babelHelpers.interopRequireDefault(_clientFileReader);

    var _dragDropFileTarget2 = babelHelpers.interopRequireDefault(_dragDropFileTarget);

    var _fauxUploadField2 = babelHelpers.interopRequireDefault(_fauxUploadField);

    var _imageExplorer2 = babelHelpers.interopRequireDefault(_imageExplorer);

    var _pasteImageTarget2 = babelHelpers.interopRequireDefault(_pasteImageTarget);

    var _webcamCapture2 = babelHelpers.interopRequireDefault(_webcamCapture);

    function ImageUploadAndCrop($container, opts) {
        this.init.apply(this, arguments);
    }

    ImageUploadAndCrop.maskShapes = _imageExplorer2.default.maskShapes;

    ImageUploadAndCrop.prototype.defaults = {
        HiDPIMultiplier: 2, //The canvas crop size is multiplied by this to support HiDPI screens
        dragDropUploadPrompt: _aui2.default.I18n.getText('bitbucket.web.drag.drop.image.prompt'),
        onImageUpload: _jquery2.default.noop,
        onImageUploadError: _jquery2.default.noop,
        onImageClear: _jquery2.default.noop,
        onCrop: _jquery2.default.noop,
        outputFormat: 'image/png',
        fallbackUploadOptions: {},
        initialScaleMode: _imageExplorer2.default.scaleModes.containAndFill,
        scaleMax: 1,
        fileSizeLimit: 5 * 1024 * 1024, //5MB
        maxImageDimension: 2000, //In pixels
        pasteUpload: true
    };

    ImageUploadAndCrop.prototype.init = function ($container, opts) {
        this.options = _jquery2.default.extend({}, this.defaults, opts);
        this.$container = $container;

        _lodash2.default.bindAll(this, 'crop', 'resetState', '_onFileProcessed', 'setImageSrc', 'validateImageResolution', '_onFilesError', '_onFileError', '_resetFileUploadField', '_onErrorReset');

        this.imageExplorer = new _imageExplorer2.default(this.$container.find('.image-explorer-container'), {
            initialScaleMode: this.options.initialScaleMode,
            scaleMax: this.options.scaleMax,
            onErrorReset: this._onErrorReset
        });

        if (_clientFileReader2.default.isSupported()) {
            this.clientFileReader = new _clientFileReader2.default({
                onRead: this._onFileProcessed,
                onError: this._onFilesError,
                fileTypeFilter: _clientFileReader2.default.typeFilters.imageWeb,
                fileCountLimit: 1,
                fileSizeLimit: this.options.fileSizeLimit
            });

            //drag drop uploading is only possible in browsers that support the fileReaderAPI
            this.dragDropFileTarget = new _dragDropFileTarget2.default(this.imageExplorer.get$ImageView(), {
                uploadPrompt: this.options.dragDropUploadPrompt,
                clientFileHandler: this.clientFileReader
            });

            if (this.options.pasteUpload) {
                this.pasteImageTarget = new _pasteImageTarget2.default(this.imageExplorer.get$ImageView(), this.clientFileReader);
            }
        }

        this.fauxUploadField = new _fauxUploadField2.default(this.$container.find('.image-select-button'), {
            clientFileHandler: this.clientFileReader,
            accept: _clientFileReader2.default.typeFilters.imageWeb
        });

        var $mask = this.imageExplorer.get$Mask();

        this.canvasCroppper = new _canvasCropper2.default($mask.width() * this.options.HiDPIMultiplier, $mask.height() * this.options.HiDPIMultiplier, {
            outputFormat: this.options.outputFormat
        });

        this.options.cropButton && (0, _jquery2.default)(this.options.cropButton).click(this.crop);
        if (this.$container.find('.webcam-capture').length) {
            if (_webcamCapture2.default.isSupported()) {
                this.webcamCapture = this.initWebcamUpload();
            } else {
                this.$container.find('.use-webcam').prop('disabled', true).attr('title', _aui2.default.I18n.getText('bitbucket.web.webcam.browser.unsupported'));
            }
        }
    };

    ImageUploadAndCrop.prototype.initWebcamUpload = function () {
        var self = this;
        var useWebcamButtons = this.$container.find('.use-webcam');

        var webcamCapture = new _webcamCapture2.default(this.$container.find('.webcam-capture'), {
            countdown: true,
            mirror: true,
            width: 640, // ask for double size so that we can zoom
            onCapture: function onCapture(imageUrl) {
                webcamCapture.pause();
                self.setImageSrc(imageUrl);
                self.$container.removeClass('webcam-mode');
                self.$container.find('.retake-photo').removeClass('hidden').focus();
            }
        });

        useWebcamButtons.on('click', function () {
            self.$container.addClass('webcam-mode');
            self.setImageSrc('');
            webcamCapture.start();
        });

        return webcamCapture;
    };

    ImageUploadAndCrop.prototype._resetWebcamUpload = function () {
        if (this.webcamCapture) {
            this.webcamCapture.stop();
            this.$container.removeClass('webcam-mode');
            this.$container.find('.retake-photo').addClass('hidden');
        }
    };

    ImageUploadAndCrop.prototype.crop = function () {
        var cropProperties = this.imageExplorer.getMaskedImageProperties();
        var croppedDataURI = this.canvasCroppper.cropToDataURI(this.imageExplorer.get$SourceImage()[0], cropProperties.maskedAreaImageX, cropProperties.maskedAreaImageY, cropProperties.maskedAreaWidth, cropProperties.maskedAreaHeight);

        _lodash2.default.isFunction(this.options.onCrop) && this.options.onCrop(croppedDataURI);
    };

    ImageUploadAndCrop.prototype.resetState = function () {
        this.imageExplorer.clearError();
        this._resetFileUploadField();
        this._resetWebcamUpload();
        this.setImageSrc('');
    };

    ImageUploadAndCrop.prototype._onFileProcessed = function (imageSrc) {
        if (imageSrc) {
            if (!isNaN(this.options.maxImageDimension)) {
                var validatePromise = this.validateImageResolution(imageSrc);

                validatePromise.done(_lodash2.default.bind(function (imageWidth, imageHeight) {
                    this.setImageSrc(imageSrc);
                }, this)).fail(_lodash2.default.bind(function (imageWidth, imageHeight) {
                    this._onFileError(_aui2.default.I18n.getText('bitbucket.web.avatar.error.file.resolution', imageWidth, imageHeight, this.options.maxImageDimension));
                }, this));
            } else {
                // If imageResolutionMax isn't valid, skip the validation and just set the image src.
                this.setImageSrc(imageSrc);
            }
        } else {
            this._onFileError();
        }
    };

    ImageUploadAndCrop.prototype.setImageSrc = function (imageSrc) {
        this.$container.find('.input-buttons').toggleClass('hidden', !!imageSrc);
        this.imageExplorer.setImageSrc(imageSrc);
        if (imageSrc) {
            this.options.onImageUpload(imageSrc);
        } else {
            this.options.onImageClear();
        }
        this._resetFileUploadField();
    };

    ImageUploadAndCrop.prototype.validateImageResolution = function (imageSrc) {
        var validatePromise = _jquery2.default.Deferred();
        var tmpImage = new Image();
        var self = this;

        tmpImage.onload = function () {
            if (this.naturalWidth > self.options.maxImageDimension || this.naturalHeight > self.options.maxImageDimension) {
                validatePromise.reject(this.naturalWidth, this.naturalHeight);
            } else {
                validatePromise.resolve(this.naturalWidth, this.naturalHeight);
            }
        };

        tmpImage.src = imageSrc;

        return validatePromise;
    };

    ImageUploadAndCrop.prototype._onFilesError = function (invalidFiles) {
        // Work out the most appropriate error to display. Because drag and drop uploading can accept multiple files and we can't restrict this,
        // it's not an all or nothing situation, we need to try and find the most correct file and base the error on that.
        // If there was at least 1 valid file, then this wouldn't be called, so we don't need to worry about files rejected because of the fileCountLimit

        if (invalidFiles && invalidFiles.bySize && invalidFiles.bySize.length) {
            //Some image files of the correct type were filtered because they were too big. Pick the first one to use as an example.
            var file = _lodash2.default.head(invalidFiles.bySize);
            this._onFileError(_aui2.default.escapeHtml(_aui2.default.I18n.getText('bitbucket.web.avatar.error.filetoobig', _text2.default.abbreviateText(file.name, 50), _text2.default.formatSizeInBytes(file.size), _text2.default.formatSizeInBytes(this.options.fileSizeLimit))));
        } else {
            //No files of the correct type were uploaded. The default error message will cover this.
            this._onFileError();
        }
    };

    ImageUploadAndCrop.prototype._onFileError = function (error) {
        var title = _aui2.default.I18n.getText('bitbucket.web.avatar.error.adding.file.title');
        var contents = error || _aui2.default.I18n.getText('bitbucket.web.avatar.error.adding.file.contents');

        this.imageExplorer.showError(title, contents);
        this._resetFileUploadField();
        _lodash2.default.isFunction(this.options.onImageUploadError) && this.options.onImageUploadError(error);
    };

    ImageUploadAndCrop.prototype._resetFileUploadField = function () {
        //clear out the fileUpload field so the user could select the same file again to "reset" the imageExplorer
        var form = this.$container.find('#image-upload-and-crop-upload-field').prop('form');
        form && form.reset();
    };

    ImageUploadAndCrop.prototype._onErrorReset = function (imgSrc) {
        //If we have a valid image after resetting from the error, notify the calling code.
        if (imgSrc) {
            _lodash2.default.isFunction(this.options.onImageUpload) && this.options.onImageUpload(imgSrc);
        }
    };

    exports.default = ImageUploadAndCrop;
    module.exports = exports['default'];
});