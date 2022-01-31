define('bitbucket/internal/feature/repository/branch-multi-selector/branch-multi-selector', ['module', 'exports', 'bitbucket/util/navbuilder', 'bitbucket/internal/widget/searchable-multi-selector/searchable-multi-selector'], function (module, exports, _navbuilder, _searchableMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _searchableMultiSelector2 = babelHelpers.interopRequireDefault(_searchableMultiSelector);

    var BranchMultiSelector = function (_SearchableMultiSelec) {
        babelHelpers.inherits(BranchMultiSelector, _SearchableMultiSelec);

        function BranchMultiSelector() {
            babelHelpers.classCallCheck(this, BranchMultiSelector);
            return babelHelpers.possibleConstructorReturn(this, (BranchMultiSelector.__proto__ || Object.getPrototypeOf(BranchMultiSelector)).apply(this, arguments));
        }

        babelHelpers.createClass(BranchMultiSelector, [{
            key: 'defaults',
            get: function get() {
                return babelHelpers.extends({}, _searchableMultiSelector2.default.prototype.defaults, {
                    url: function url() {
                        return _navbuilder2.default.rest().currentRepo().branches().build();
                    },
                    filterParamName: 'filterText',
                    separator: ' ', //This is safe for branch names
                    selectionTemplate: bitbucket.internal.feature.repository.branchMultiSelector.branch,
                    resultTemplate: bitbucket.internal.feature.repository.branchMultiSelector.branch
                });
            }
        }]);
        return BranchMultiSelector;
    }(_searchableMultiSelector2.default);

    exports.default = BranchMultiSelector;
    module.exports = exports['default'];
});