define('bitbucket/internal/feature/file-content/file-blame/blame-source', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/util/property'], function (module, exports, _jquery, _lodash, _navbuilder, _server, _property) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    function BlameSource(fileChange) {
        this._fileChange = fileChange;
        this._optionsPromise = _jquery2.default.Deferred();
        this._blamePromise = null;
    }

    BlameSource.prototype.get = function () {
        if (!this._blamePromise) {
            this._blamePromise = _jquery2.default.when(this._optionsPromise, _property2.default.getFromProvider('display.max.source.lines')).then(this._requestBlame.bind(this));
        }

        return this._blamePromise;
    };

    BlameSource.prototype.initBlameOptions = function (options) {
        this._optionsPromise.resolve(options);
    };

    //Calculate the optimal blame window start for a given capacity,
    //such that the span of displayed lines are centred in the window.
    BlameSource.prototype._calculateBlameWindowStart = function (options, capacity) {
        return Math.max(0, Math.floor((options.firstLine + options.lastLine) / 2) - capacity / 2);
    };

    BlameSource.prototype._requestBlame = function (options, capacity) {
        return _server2.default.rest({
            url: _navbuilder2.default.rest().currentRepo().browse().path(this._fileChange.path).at(this._fileChange.commitRange.untilRevision.id).build(),
            data: {
                blame: true,
                noContent: true,
                start: options.haveWholeFile ? options.firstLine - 1 : this._calculateBlameWindowStart(options, capacity),
                limit: options.haveWholeFile ? options.lastLine - options.firstLine + 1 : capacity,
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'xsmall'
                })
            }
        }).then(_lodash2.default.identity); //only care about the first param (result), allows handler to deal with variable length invocations easily.
    };

    exports.default = BlameSource;
    module.exports = exports['default'];
});