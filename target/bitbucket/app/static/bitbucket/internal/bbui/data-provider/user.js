define('bitbucket/internal/bbui/data-provider/user', ['module', 'exports', 'bitbucket/internal/impl/data-provider/paged'], function (module, exports, _paged) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _paged2 = babelHelpers.interopRequireDefault(_paged);

    var UserDataProvider = function (_PagedDataProvider) {
        babelHelpers.inherits(UserDataProvider, _PagedDataProvider);

        function UserDataProvider(options) {
            var _ref;

            babelHelpers.classCallCheck(this, UserDataProvider);

            options.filterable = true;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return babelHelpers.possibleConstructorReturn(this, (_ref = UserDataProvider.__proto__ || Object.getPrototypeOf(UserDataProvider)).call.apply(_ref, [this, options].concat(args)));
        }

        return UserDataProvider;
    }(_paged2.default);

    exports.default = UserDataProvider;
    module.exports = exports['default'];
});