define('bitbucket/internal/feature/dashboard/components/repository-list', ['module', 'exports', '@atlassian/aui', 'classnames', 'react', '../../repository/search-results/search-results-list'], function (module, exports, _aui, _classnames, _react, _searchResultsList) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _searchResultsList2 = babelHelpers.interopRequireDefault(_searchResultsList);

    var LoadMore = function LoadMore(_ref) {
        var onMoreClick = _ref.onMoreClick,
            nextPageSize = _ref.nextPageSize;
        return _react2.default.createElement(
            'button',
            { className: 'load-more-button aui-button aui-button-link', onClick: function onClick() {
                    return onMoreClick();
                } },
            _aui2.default.I18n.getText('bitbucket.web.dashboard.repositories.loadmore', nextPageSize)
        );
    };

    var RepositoryList = function (_Component) {
        babelHelpers.inherits(RepositoryList, _Component);

        function RepositoryList() {
            babelHelpers.classCallCheck(this, RepositoryList);
            return babelHelpers.possibleConstructorReturn(this, (RepositoryList.__proto__ || Object.getPrototypeOf(RepositoryList)).apply(this, arguments));
        }

        babelHelpers.createClass(RepositoryList, [{
            key: 'render',
            value: function render() {
                var _props = this.props,
                    onMoreClick = _props.onMoreClick,
                    showMore = _props.showMore,
                    nextPageSize = _props.nextPageSize;


                return _react2.default.createElement(
                    'div',
                    {
                        className: (0, _classnames2.default)('dashboard-repository-list-container', {
                            searching: this.props.query
                        })
                    },
                    _react2.default.createElement(_searchResultsList2.default, babelHelpers.extends({}, this.props, {
                        LoadMore: showMore ? _react2.default.createElement(LoadMore, { onMoreClick: onMoreClick, nextPageSize: nextPageSize }) : null
                    }))
                );
            }
        }]);
        return RepositoryList;
    }(_react.Component);

    exports.default = RepositoryList;
    module.exports = exports['default'];
});