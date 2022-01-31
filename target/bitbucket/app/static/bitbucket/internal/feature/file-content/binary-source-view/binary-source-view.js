define('bitbucket/internal/feature/file-content/binary-source-view/binary-source-view', ['module', 'exports', 'jquery', 'bitbucket/internal/feature/file-content/binary-view/binary-view', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _binaryView, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _binaryView2 = babelHelpers.interopRequireDefault(_binaryView);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    /**
     * Display a binary file
     *
     * @param {Object} options - An object representing options, as provided by the FileHandlers API.
     * @param {JSON.FileChangeJSON} options.fileChange - The FileChange to represent in this view.
     * @param {jQuery} options.$container - Where to place this BinarySourceView.
     * @constructor BinarySourceView
     */
    function BinarySourceView(options) {
        this._init(options);
    }

    /**
     * Adds a binary display to the provided $container.
     * @param {Object} options see constructor
     * @private
     */
    BinarySourceView.prototype._init = function (options) {
        var path = options.fileChange.path;
        var commit = options.fileChange.commitRange.untilRevision;

        this._$container = (0, _jquery2.default)(bitbucket.internal.feature.fileContent.binaryView.container()).appendTo(options.$container);

        var result = _binaryView2.default.getRenderedBinary(path, commit && commit.id);
        _renderBinarySource(result, this._$container);

        _events2.default.trigger('bitbucket.internal.feature.fileContent.binaryShown', null, {
            containerEl: this._$container.get(0),
            path: path,
            type: result && result.type,
            revision: commit
        });
    };

    /**
     * Render the binary view into the DOM
     * @private
     * @param {Object} result - result from a getRenderedBinary call
     * @param {jQuery} $container - where to put the content
     */
    function _renderBinarySource(result, $container) {
        (0, _jquery2.default)(bitbucket.internal.feature.fileContent.binaryView.cell({})).append(result.$elem).appendTo($container);
    }

    /**
     * Destroy this instance. Cannot be used again once destroyed.
     */
    BinarySourceView.prototype.destroy = function () {
        if (this._$container) {
            this._$container.remove();
            this._$container = null;
        }
    };

    exports.default = BinarySourceView;
    module.exports = exports['default'];
});