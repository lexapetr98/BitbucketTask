define('bitbucket/internal/bbui/data-provider/pull-request-list', ['module', 'exports', 'bitbucket/internal/impl/data-provider/paged'], function (module, exports, _paged) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _paged2 = babelHelpers.interopRequireDefault(_paged);

    var PullRequestListDataProvider = function (_PagedDataProvider) {
        babelHelpers.inherits(PullRequestListDataProvider, _PagedDataProvider);

        function PullRequestListDataProvider() {
            var _ref;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            babelHelpers.classCallCheck(this, PullRequestListDataProvider);

            options.filterable = true;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return babelHelpers.possibleConstructorReturn(this, (_ref = PullRequestListDataProvider.__proto__ || Object.getPrototypeOf(PullRequestListDataProvider)).call.apply(_ref, [this, options].concat(args)));
        }

        return PullRequestListDataProvider;
    }(_paged2.default);

    exports.default = PullRequestListDataProvider;
    module.exports = exports['default'];
});