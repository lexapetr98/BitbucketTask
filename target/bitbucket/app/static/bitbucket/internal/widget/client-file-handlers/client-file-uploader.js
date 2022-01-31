define('bitbucket/internal/widget/client-file-handlers/client-file-uploader', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/feature-detect', 'bitbucket/internal/widget/client-file-handlers/client-file-handler'], function (module, exports, _jquery, _lodash, _ajax, _featureDetect, _clientFileHandler) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    var _clientFileHandler2 = babelHelpers.interopRequireDefault(_clientFileHandler);

    /**
     * A ClientFileHandler for uploading files to the server
     *
     * @extends {ClientFileHandler}
     * @param {object} opts
     * @constructor ClientFileUploader
     */
    function ClientFileUploader(opts) {
        if (!ClientFileUploader.isSupported()) {
            throw new Error('ClientFileUploader requires FormData support');
        }

        this.init.apply(this, arguments);
    }

    ClientFileUploader.isSupported = _featureDetect2.default.formData;
    ClientFileUploader.typeFilters = _clientFileHandler2.default.typeFilters;

    _jquery2.default.extend(ClientFileUploader.prototype, _clientFileHandler2.default.prototype);

    ClientFileUploader.prototype.defaults = _jquery2.default.extend({}, _clientFileHandler2.default.prototype.defaults, {
        url: undefined,
        fieldName: 'file',
        fileSizeLimit: undefined
    });

    /**
     * Initialise the ClientFileHandler
     * @param {object} opts
     */
    ClientFileUploader.prototype.init = function (opts) {
        _lodash2.default.bindAll(this, 'uploadFiles');

        _clientFileHandler2.default.prototype.init.call(this, opts);

        this.uploads = [];
        this.on('validFiles', this.uploadFiles);
    };

    /**
     * For each file, start an upload to the server that reports its progress via the xhr promise
     * and trigger the uploadStarted event with the promise and file handle
     *
     * @param {Array<File>} files
     */
    ClientFileUploader.prototype.uploadFiles = function (files) {
        var self = this;

        _lodash2.default.forEach(files, function (file) {
            var formData = new FormData();
            var deferred = _jquery2.default.Deferred();

            formData.append(self.options.fieldName, file, file.name);

            var xhr = _ajax2.default.ajax({
                url: _lodash2.default.isFunction(self.options.url) ? self.options.url() : self.options.url,
                type: 'POST',
                data: formData,
                timeout: self.options.timeout,
                xhr: function xhr() {
                    //We need to attach the progress event handler to the XHR directly,
                    var plainXhr = _jquery2.default.ajaxSettings.xhr();
                    var progressObj = plainXhr.upload ? plainXhr.upload : plainXhr;

                    progressObj.addEventListener('progress', function (e) {
                        if (e.lengthComputable) {
                            deferred.notify(Math.max(0, Math.min(100, 100 * e.loaded / e.total)));
                        }
                    });

                    return plainXhr;
                },
                statusCode: {
                    500: false
                    //Stash returns a 500 for uploads that don't conform to our restrictions (file size/type)
                    //Let the calling component handle it via xhr.fail instead of showing the generic error dialog
                },
                processData: false, // tell jQuery not to process the data
                contentType: false // tell jQuery not to set contentType
            }).done(function () {
                deferred.notify(100); //100% complete
                deferred.resolveWith(this, arguments);
            }).fail(function () {
                deferred.rejectWith(this, arguments);
            }).always(function () {
                self.uploads = _lodash2.default.without(self.uploads, xhr);
            });

            deferred.promise(xhr);
            self.uploads.push(xhr);

            self.trigger('uploadStarted', xhr, file);
        });
    };

    /**
     * Destroy the instance
     */
    ClientFileUploader.prototype.destroy = function () {
        //Cancel any pending uploads
        _lodash2.default.invokeMap(this.uploads, 'abort');
        this.uploads = [];
    };

    exports.default = ClientFileUploader;
    module.exports = exports['default'];
});