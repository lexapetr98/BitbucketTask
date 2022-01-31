define('bitbucket/internal/bbui/pull-request-list-table/pull-request-list-table', ['module', 'exports', 'prop-types', 'react', '../paged-table/paged-table', '../pull-request-table/components/author-avatar', '../pull-request-table/components/comments', '../pull-request-table/components/conflict', '../pull-request-table/components/pull-request-row', '../pull-request-table/components/reviewers', '../pull-request-table/components/tasks', '../pull-request-table/components/web-section', './components/summary'], function (module, exports, _propTypes, _react, _pagedTable, _authorAvatar, _comments, _conflict, _pullRequestRow, _reviewers, _tasks, _webSection, _summary) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    var _authorAvatar2 = babelHelpers.interopRequireDefault(_authorAvatar);

    var _comments2 = babelHelpers.interopRequireDefault(_comments);

    var _conflict2 = babelHelpers.interopRequireDefault(_conflict);

    var _pullRequestRow2 = babelHelpers.interopRequireDefault(_pullRequestRow);

    var _reviewers2 = babelHelpers.interopRequireDefault(_reviewers);

    var _tasks2 = babelHelpers.interopRequireDefault(_tasks);

    var _summary2 = babelHelpers.interopRequireDefault(_summary);

    var beforeSections = (0, _webSection.getBeforeSections)();
    var afterSections = (0, _webSection.getAfterSections)();

    var propTypes = {
        focusedIndex: _propTypes2.default.number,
        pullRequests: _propTypes2.default.array.isRequired, // ideally we'd validate the PR shapes
        allFetchedMessage: _propTypes2.default.string,
        openCallback: _propTypes2.default.func,
        showStateLozenge: _propTypes2.default.bool
    };

    var PullRequestListTable = function PullRequestListTable(props) {
        var pullRequests = props.pullRequests;

        return _react2.default.createElement(_pagedTable2.default, babelHelpers.extends({}, props, {
            className: 'pull-requests-table',
            allFetchedMessage: AJS.I18n.getText('bitbucket.pull.request.all.fetched'),
            items: pullRequests,
            header: function header() {
                return _react2.default.createElement(
                    _pullRequestRow2.default,
                    null,
                    _react2.default.createElement(_summary2.default.Header, { colSpan: 2 }),
                    _react2.default.createElement(_conflict2.default.Header, null),
                    beforeSections.map(function (section) {
                        return _react2.default.createElement(_webSection.WebSectionHeader, { key: section.key + '::before', webSection: section });
                    }),
                    _react2.default.createElement(_comments2.default.Header, null),
                    _react2.default.createElement(_tasks2.default.Header, null),
                    _react2.default.createElement(_reviewers2.default.Header, null),
                    afterSections.map(function (section) {
                        return _react2.default.createElement(_webSection.WebSectionHeader, { key: section.key + '::after', webSection: section });
                    })
                );
            },
            row: function row(_ref) {
                var item = _ref.item,
                    focused = _ref.focused,
                    primaryRefCallback = _ref.primaryRefCallback;

                var pullRequest = item;
                return _react2.default.createElement(
                    _pullRequestRow2.default,
                    { key: pullRequest.id, focused: focused },
                    _react2.default.createElement(_authorAvatar2.default, { author: pullRequest.author }),
                    _react2.default.createElement(_summary2.default, {
                        pullRequest: pullRequest,
                        refCallback: primaryRefCallback,
                        showStateLozenge: props.showStateLozenge
                    }),
                    _react2.default.createElement(_conflict2.default, { pullRequest: pullRequest }),
                    beforeSections.map(function (section) {
                        return _react2.default.createElement(_webSection.WebSectionCell, {
                            key: section.key + '::before',
                            where: 'before',
                            webSection: section,
                            pullRequest: pullRequest
                        });
                    }),
                    _react2.default.createElement(_comments2.default, { pullRequest: pullRequest }),
                    _react2.default.createElement(_tasks2.default, { pullRequest: pullRequest }),
                    _react2.default.createElement(_reviewers2.default, { pullRequest: pullRequest }),
                    afterSections.map(function (section) {
                        return _react2.default.createElement(_webSection.WebSectionCell, {
                            key: section.key + '::after',
                            where: 'after',
                            webSection: section,
                            pullRequest: pullRequest
                        });
                    })
                );
            }
        }));
    };

    PullRequestListTable.propTypes = propTypes;

    exports.default = PullRequestListTable;
    module.exports = exports['default'];
});