define('bitbucket/internal/widget/client-file-handlers/client-file-reader', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/feature-detect', 'bitbucket/internal/widget/client-file-handlers/client-file-handler'], function (module, exports, _jquery, _lodash, _featureDetect, _clientFileHandler) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    var _clientFileHandler2 = babelHelpers.interopRequireDefault(_clientFileHandler);

    var _readMethodMap = {
        ArrayBuffer: 'readAsArrayBuffer',
        BinaryString: 'readAsBinaryString',
        DataURL: 'readAsDataURL',
        Text: 'readAsText'
    };

    function ClientFileReader(opts) {
        if (!ClientFileReader.isSupported()) {
            throw new Error('ClientFileReader requires FileReaderAPI support');
        }
        return this.init(opts);
    }

    ClientFileReader.isSupported = _featureDetect2.default.fileReader;

    _jquery2.default.extend(ClientFileReader.prototype, _clientFileHandler2.default.prototype);

    ClientFileReader.readMethods = {
        ArrayBuffer: 'ArrayBuffer',
        BinaryString: 'BinaryString',
        DataURL: 'DataURL',
        Text: 'Text'
    };

    ClientFileReader.typeFilters = _clientFileHandler2.default.typeFilters; //Expose this to the calling code

    ClientFileReader.prototype.defaults = _jquery2.default.extend({}, _clientFileHandler2.default.prototype.defaults, {
        readMethod: ClientFileReader.readMethods.DataURL,
        onRead: _jquery2.default.noop
    });

    ClientFileReader.prototype.init = function (opts) {
        _lodash2.default.bindAll(this, 'onSuccess', 'readFile');
        _clientFileHandler2.default.prototype.init.call(this, opts);

        this.options.onSuccess = this.onSuccess; //We don't want this to be optional.
        return this;
    };

    ClientFileReader.prototype.onSuccess = function (files) {
        var readMethod = _lodash2.default.has(_readMethodMap, this.options.readMethod) ? _readMethodMap[this.options.readMethod] : undefined;

        if (readMethod) {
            _lodash2.default.forEach(files, _lodash2.default.bind(function (file) {
                var fileReader = new FileReader();
                fileReader.onload = _lodash2.default.bind(this.readFile, this, file); //pass the file handle to allow callback access to filename, size, etc.
                fileReader[readMethod](file);
            }, this));
        }
    };

    ClientFileReader.prototype.readFile = function (file, fileReaderEvent) {
        _lodash2.default.isFunction(this.options.onRead) && this.options.onRead(fileReaderEvent.target.result, file);
    };

    exports.default = ClientFileReader;
    module.exports = exports['default'];
});