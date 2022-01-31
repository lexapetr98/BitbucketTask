define('bitbucket/internal/bbui/data-provider/pull-request', ['module', 'exports', 'bitbucket/internal/impl/data-provider/data-provider'], function (module, exports, _dataProvider) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _dataProvider2 = babelHelpers.interopRequireDefault(_dataProvider);

    var PullRequestDataProvider = function (_DataProvider) {
        babelHelpers.inherits(PullRequestDataProvider, _DataProvider);

        function PullRequestDataProvider() {
            var _ref;

            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            babelHelpers.classCallCheck(this, PullRequestDataProvider);

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return babelHelpers.possibleConstructorReturn(this, (_ref = PullRequestDataProvider.__proto__ || Object.getPrototypeOf(PullRequestDataProvider)).call.apply(_ref, [this, options].concat(args)));
        }

        return PullRequestDataProvider;
    }(_dataProvider2.default);

    exports.default = PullRequestDataProvider;
    module.exports = exports['default'];
});