define('bitbucket/internal/util/commit', ['exports', 'bitbucket/util/navbuilder', 'bitbucket/util/server'], function (exports, _navbuilder, _server) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.create = create;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    /**
     * Returns a promise with the results from the create commit API call
     * @param {string} branchId - branch to commit to
     * @param {string} sourceCommitId - the commitId for the previous state of the content (when the content was loaded)
     * @param {string} message - commit message
     * @param {string} content - encoded entire file
     * @param {string|array} filePath - path to the file to commit
     * @param {object} handledStatusCodes - an object mapping a HTTP status code to an error handling function
     *                                      (see 'bitbucket/util/server')
     * @param {object} [options={}] additional information to pass to server.rest
     */
    function create(_ref) {
        var _nav$rest$currentRepo;

        var branchId = _ref.branchId,
            sourceCommitId = _ref.sourceCommitId,
            message = _ref.message,
            content = _ref.content,
            filePath = _ref.filePath,
            handledStatusCodes = _ref.handledStatusCodes;

        if (typeof filePath === 'string') {
            filePath = filePath.split('/');
        }
        handledStatusCodes = handledStatusCodes.reduce(function (hash, code) {
            hash[code] = false;
            return hash;
        }, {});

        // Note: you must do data.append() on each line (no chaining) as append doesn't return the data obj.
        var data = new FormData();
        data.append('branch', branchId);
        data.append('sourceCommitId', sourceCommitId);
        data.append('message', message);
        data.append('content', content);

        var url = (_nav$rest$currentRepo = _navbuilder2.default.rest().currentRepo().browse()).addPathComponents.apply(_nav$rest$currentRepo, babelHelpers.toConsumableArray(filePath)).withParams({
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: 'large'
            })
        }).build();

        return _server2.default.rest({
            url: url,
            data: data,
            type: 'PUT',
            processData: false,
            contentType: false,
            statusCode: handledStatusCodes
        });
    }
});