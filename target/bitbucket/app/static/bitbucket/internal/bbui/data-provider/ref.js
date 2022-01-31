define('bitbucket/internal/bbui/data-provider/ref', ['module', 'exports', 'bitbucket/internal/impl/data-provider/paged'], function (module, exports, _paged) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _paged2 = babelHelpers.interopRequireDefault(_paged);

    var RefDataProvider = function (_PagedDataProvider) {
        babelHelpers.inherits(RefDataProvider, _PagedDataProvider);

        function RefDataProvider(options) {
            var _ref;

            babelHelpers.classCallCheck(this, RefDataProvider);

            options.filterable = true;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return babelHelpers.possibleConstructorReturn(this, (_ref = RefDataProvider.__proto__ || Object.getPrototypeOf(RefDataProvider)).call.apply(_ref, [this, options].concat(args)));
        }

        return RefDataProvider;
    }(_paged2.default);

    exports.default = RefDataProvider;
    module.exports = exports['default'];
});