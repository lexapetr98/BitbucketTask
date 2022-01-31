define('bitbucket/internal/bbui/data-provider/participants', ['module', 'exports', 'bitbucket/internal/impl/data-provider/paged'], function (module, exports, _paged) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _paged2 = babelHelpers.interopRequireDefault(_paged);

    var ParticipantsDataProvider = function (_PagedDataProvider) {
        babelHelpers.inherits(ParticipantsDataProvider, _PagedDataProvider);

        function ParticipantsDataProvider(options) {
            var _ref;

            babelHelpers.classCallCheck(this, ParticipantsDataProvider);

            options.filterable = true;

            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return babelHelpers.possibleConstructorReturn(this, (_ref = ParticipantsDataProvider.__proto__ || Object.getPrototypeOf(ParticipantsDataProvider)).call.apply(_ref, [this, options].concat(args)));
        }

        return ParticipantsDataProvider;
    }(_paged2.default);

    exports.default = ParticipantsDataProvider;
    module.exports = exports['default'];
});