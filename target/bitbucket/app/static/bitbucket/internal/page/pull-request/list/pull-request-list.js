define('bitbucket/internal/page/pull-request/list/pull-request-list', ['module', 'exports', 'lodash', 'react', 'react-dom', 'bitbucket/util/events', 'bitbucket/util/navbuilder', 'bitbucket/util/state', 'bitbucket/internal/feature/pull-request/list/pull-request-list-analytics', 'bitbucket/internal/page/pull-request/list/pull-request-list-view', 'bitbucket/internal/util/history'], function (module, exports, _lodash, _react, _reactDom, _events, _navbuilder, _state, _pullRequestListAnalytics, _pullRequestListView, _history) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _pullRequestListAnalytics2 = babelHelpers.interopRequireDefault(_pullRequestListAnalytics);

    var _pullRequestListView2 = babelHelpers.interopRequireDefault(_pullRequestListView);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    // The filter url map is used to convert filter params to url params
    // and vice versa (maps url params back to filter params)
    var queryParamByFilterKey = {
        author_id: 'author',
        reviewer_self: 'reviewing',
        state: 'state',
        target_ref_id: 'at'
    };
    var filterKeyByQueryParam = _lodash2.default.invert(queryParamByFilterKey);

    /**
     * Add a set of params to a given URL
     * @param {string} url
     * @param {Object<string, string>} params
     * @returns {string}
     */
    function urlWithParams(url, params) {
        var uri = _navbuilder2.default.parse(url);
        Object.keys(params).forEach(function (k) {
            if (params[k] != null && params[k] !== false) {
                uri.replaceQueryParam(k, params[k]);
            } else {
                // delete params that are empty
                uri.deleteQueryParam(k);
            }
        });
        return uri.toString();
    }

    /**
     * Get a filter object from the URL params
     *
     * @returns {Object<string, string>}
     */
    function filterFromUrlParams() {
        var params = {};
        var uri = _navbuilder2.default.parse(window.location);

        // get the query params for each of the items in the filter map
        _lodash2.default.values(queryParamByFilterKey).forEach(function (key) {
            var val = uri.getQueryParamValue(key);
            if (val) {
                if (key === 'reviewing') {
                    params[key] = val !== 'false';
                    return;
                }
                params[key] = val;
            }
        });

        return _lodash2.default.mapKeys(params, function (v, k) {
            return filterKeyByQueryParam[k] || k;
        });
    }

    /**
     * Update the URL with the appropriate params based on given filter
     *
     * @param {Object} filter
     */
    function updateUrlWithFilterParams(filter) {
        var mappedFilterParams = _lodash2.default.mapKeys(filter, function (v, k) {
            return queryParamByFilterKey[k] || k;
        });
        _history2.default.replaceState(mappedFilterParams, null, urlWithParams(window.location, mappedFilterParams));
    }

    /**
     *
     * @param {Object} opts
     * @param {Page<PullRequestJSON>} initialData - a page of PRs
     * @param {StashUserJSON} selectedAuthor - author who is selected in the filter
     * @param {RefJSON?} selectedTargetBranch - target branch which is selected in the filter
     */
    function onReady(opts) {
        _events2.default.on('bitbucket.internal.widget.keyboard-shortcuts.register-contexts', function (keyboardShortcuts) {
            keyboardShortcuts.enableContext('pull-request-list');
        });
        var filterParams = filterFromUrlParams();
        var repo = _state2.default.getRepository();
        _reactDom2.default.render(_react2.default.createElement(_pullRequestListView2.default, {
            initialData: opts.initialData,
            repository: repo,
            currentUser: _state2.default.getCurrentUser(),
            selectedAuthor: opts.selectedAuthor,
            selectedTargetBranch: opts.selectedTargetBranch,
            initialFilter: filterParams, // use the inverse of the filterMap
            gettingStarted: opts.gettingStarted,
            onFilterChange: function onFilterChange(state) {
                updateUrlWithFilterParams(state);
                _pullRequestListAnalytics2.default.onFilterChanged(state);
            }
        }), document.getElementById('pull-requests-content'));

        _pullRequestListAnalytics2.default.init({
            filterParams: filterParams
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});