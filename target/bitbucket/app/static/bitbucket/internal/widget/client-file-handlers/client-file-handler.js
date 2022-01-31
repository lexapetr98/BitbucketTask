define('bitbucket/internal/widget/client-file-handlers/client-file-handler', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function ClientFileHandler(opts) {
        return this.init(opts);
    }

    _events2.default.addLocalEventMixin(ClientFileHandler.prototype);

    ClientFileHandler.typeFilters = {
        all: /.*/,
        application: /^application\/.*/i,
        audio: /^audio\/.*/i,
        image: /^image\/.*/i,
        imageWeb: /^image\/(jpeg|png|gif)$/i,
        text: /^text\/.*/i,
        video: /^video\/.*/i
    };

    ClientFileHandler.prototype.defaults = {
        fileTypeFilter: ClientFileHandler.typeFilters.all, //specify a regex or use one of the built in typeFilters
        fileCountLimit: Infinity, //How many files can a user upload at once? This will limit it to the first n files,
        fileSizeLimit: 10 * 1024 * 1024, //Maximum file size in bytes (10MB per file),
        onSuccess: _jquery2.default.noop,
        onError: _jquery2.default.noop
    };

    ClientFileHandler.prototype.init = function (opts) {
        this.options = _jquery2.default.extend({}, this.defaults, opts);

        if (opts && !opts.fileSizeLimit) {
            this.options.fileSizeLimit = this.defaults.fileSizeLimit;
        }
        if (opts && !opts.fileCountLimit) {
            this.options.fileCountLimit = this.defaults.fileCountLimit;
        }

        _lodash2.default.bindAll(this, 'handleFiles', 'filterFiles');

        return this;
    };

    /**
     * Takes in an array of files, processes them, and fires the onSuccess handler if any are valid, or the onError handler
     * otherwise. These handlers can be specified on the options object passed to the constructor.
     * @param fileList array of objects like { size:Number, type:String }
     */
    ClientFileHandler.prototype.handleFiles = function (fileList) {
        this.trigger('filesSelected', fileList);

        //Assumes any number of files > 0 is a success, else it's an error
        var filteredFiles = this.filterFiles(fileList);

        if (filteredFiles.valid.length > 0) {
            //There was at least one valid file
            _lodash2.default.isFunction(this.options.onSuccess) && this.options.onSuccess(filteredFiles.valid);
            this.trigger('validFiles', filteredFiles.valid);
        } else {
            //there were no valid files added
            _lodash2.default.isFunction(this.options.onError) && this.options.onError(filteredFiles.invalid);
        }

        if (_lodash2.default.keys(filteredFiles.invalid).length) {
            this.trigger('invalidFiles', filteredFiles.invalid);
        }
    };

    ClientFileHandler.prototype.filterFiles = function (fileList) {
        var fileTypeFilter = _lodash2.default.isRegExp(this.options.fileTypeFilter) ? this.options.fileTypeFilter : this.defaults.fileTypeFilter;
        var fileSizeLimit = this.options.fileSizeLimit;

        var sortedFiles = _lodash2.default.reduce(fileList, function (sorted, file) {
            if (!fileTypeFilter.test(file.type)) {
                sorted.invalid.byType = sorted.invalid.byType ? sorted.invalid.byType.concat(file) : [file];
            } else if (file.size > fileSizeLimit) {
                sorted.invalid.bySize = sorted.invalid.bySize ? sorted.invalid.bySize.concat(file) : [file];
            } else {
                sorted.valid.push(file);
            }
            return sorted;
        }, { valid: [], invalid: {} });

        if (sortedFiles.valid.length > this.options.fileCountLimit) {
            sortedFiles.invalid.byCount = sortedFiles.valid.slice(this.options.fileCountLimit);
            sortedFiles.valid = sortedFiles.valid.slice(0, this.options.fileCountLimit);
        }

        return sortedFiles;
    };

    exports.default = ClientFileHandler;
    module.exports = exports['default'];
});