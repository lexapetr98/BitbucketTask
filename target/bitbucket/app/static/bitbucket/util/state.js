define('bitbucket/util/state', ['module', 'exports', 'lodash', 'bitbucket/internal/model/page-state'], function (module, exports, _lodash, _pageState) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    /**
     * Available on every page. Returns information about the current user, if there is a logged in user.
     *
     * @function
     * @name getCurrentUser
     * @memberof bitbucket/util/state
     * @returns {JSON.StashUserJSON} An object describing the current user, if they are logged in.
     */

    /**
     * Available on every page. Returns information about the currently viewed project, if there is one being viewed.
     *
     * @function
     * @name getProject
     * @memberof bitbucket/util/state
     * @returns {JSON.ProjectJSON} An object describing the current project, if there is one.
     */

    /**
     * Available on every page. Returns information about the currently viewed pull request, if there is one being viewed.
     *
     * @function
     * @name getPullRequest
     * @memberof bitbucket/util/state
     * @returns {JSON.PullRequestJSON} An object describing the current pull request, if there is one.
     */

    /**
     * Available on every page. Returns information about the currently viewed repository, if there is one being viewed.
     *
     * @function
     * @name getRepository
     * @memberof bitbucket/util/state
     * @returns {JSON.RepositoryJSON} An object describing the current repository, if there is one.
     */

    /**
     * Available on every page. Returns information about the currently viewed ref (e.g. currently selected branch), if there is one being viewed.
     *
     * @function
     * @name getRef
     * @memberof bitbucket/util/state
     * @returns {JSON.RefJSON} An object describing the current ref, if there is one.
     */

    /**
     * Available on pages that show a file (Pull Request, Commit, File Browser).
     * Returns path information about the currently viewed file.
     *
     * @function
     * @name getFilePath
     * @memberof bitbucket/util/state
     * @returns {JSON.PathJSON} An object describing the current file, if there is one.
     */

    /**
     * Available on pages that show a commit (currently just /projects/PROJ/repos/REPO/commits/HASH).
     * Returns information about the commit.
     *
     * @function
     * @name getCommit
     * @memberof bitbucket/util/state
     * @returns {JSON.CommitJSON} An object describing the current commit, if there is one.
     */

    /**
     * Available on Compare and Create Pull Request pages. Returns information about the branch where changes will be merged, if there is one selected.
     *
     * @function
     * @name getTargetBranch
     * @memberof bitbucket/util/state
     * @returns {JSON.RefJSON} An object describing the branch where changes will be merged, if there is one selected.
     */

    /**
     * Available on Compare and Create Pull Request pages. Returns information about the branch where changes will come from, if there is one selected.
     *
     * @function
     * @name getSourceBranch
     * @memberof bitbucket/util/state
     * @returns {JSON.RefJSON} An object describing the branch where changes will come from, if there is one.
     */

    /**
     * Available on Compare and Create Pull Request pages. Returns information about the repository where changes will come from, if there is one.
     *
     * @function
     * @name getSourceRepository
     * @memberof bitbucket/util/state
     * @returns {JSON.RepositoryJSON} An object describing the repository where changes will come from, if there is one selected.
     */

    /**
     * This module contains a dynamic set of properties based on the current page.
     * Relevant model data from the page will be exposed here for your use.
     *
     * **Web Resource:** com.atlassian.bitbucket.server.bitbucket-web-api:state
     *
     * @module bitbucket/util/state
     * @namespace bitbucket/util/state
     */
    var readablePageState = {};

    // getters to expose from the internal page state.
    var exposed = ['getCommit', 'getCurrentUser', 'getFilePath', 'getProject', 'getPullRequest', 'getRepository', 'getRevisionRef', 'getSourceBranch', 'getSourceRepository', 'getTargetBranch'];

    function add(method, prop) {
        if (typeof method === 'function' && _lodash2.default.includes(exposed, prop)) {
            var getter = _pageState2.default[prop];
            prop = {
                // rename some properties for public consumption
                getRevisionRef: 'getRef'
            }[prop] || prop;
            if (!getter) {
                readablePageState[prop] = function () {
                    return null;
                };
            } else {
                readablePageState[prop] = function () {
                    var val = getter.call(_pageState2.default);
                    if (val == null) {
                        // We erroneously returned an empty object before in this case. That sucks.
                        // We'd like to return the null or undefined value, but if people are working around this like
                        // by checking state.getPullRequest().id, those checks would start to throw.
                        // So this middle ground lets both work:
                        // if (state.getPullRequest()) will be false, and if(state.getPullRequest().id will return undefined)
                        // This is technically a breaking change, but the benefit is significant for everyone using the API.
                        // The current behavior is a bug.
                        // DEPRECATED in 3.2, switch to returning `val` directly in 6.0
                        return false;
                    }
                    if ((typeof val === 'undefined' ? 'undefined' : babelHelpers.typeof(val)) !== 'object') {
                        return val;
                    }
                    if (_lodash2.default.isFunction(val.toJSON)) {
                        val = val.toJSON();
                    }
                    return _lodash2.default.cloneDeep(val);
                };
            }
        }
    }

    _pageState2.default.extend = function (oldExtend) {
        return function () {
            var ret = oldExtend.apply(this, arguments);
            _lodash2.default.forEach(_pageState2.default, add);
            return ret;
        };
    }(_pageState2.default.extend);

    _lodash2.default.forEach(_pageState2.default, add);

    exports.default = readablePageState;
    module.exports = exports['default'];
});