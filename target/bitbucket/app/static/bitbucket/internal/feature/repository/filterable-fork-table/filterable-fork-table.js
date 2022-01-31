define('bitbucket/internal/feature/repository/filterable-fork-table/filterable-fork-table', ['module', 'exports', '@atlassian/aui', 'bitbucket/internal/feature/repository/filterable-repository-table/filterable-repository-table'], function (module, exports, _aui, _filterableRepositoryTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _filterableRepositoryTable2 = babelHelpers.interopRequireDefault(_filterableRepositoryTable);

    var FilterableForkTable = function (_FilterableRepository) {
        babelHelpers.inherits(FilterableForkTable, _FilterableRepository);

        function FilterableForkTable() {
            babelHelpers.classCallCheck(this, FilterableForkTable);
            return babelHelpers.possibleConstructorReturn(this, (FilterableForkTable.__proto__ || Object.getPrototypeOf(FilterableForkTable)).apply(this, arguments));
        }

        return FilterableForkTable;
    }(_filterableRepositoryTable2.default);

    FilterableForkTable.defaultProps = babelHelpers.extends({}, _filterableRepositoryTable2.default.defaultProps, {
        filterPlaceholder: _aui.I18n.getText('bitbucket.web.repository.forks.filter.placeholder'),
        lastPageMessage: _aui.I18n.getText('bitbucket.web.repository.forks.allfetched'),
        loadMoreMessage: _aui.I18n.getText('bitbucket.web.repository.forks.loadmore'),
        noItemsMessage: _aui.I18n.getText('bitbucket.web.repository.forks.nonefound'),
        showProject: true,
        showPublic: true
    });
    FilterableForkTable.propTypes = _filterableRepositoryTable2.default.propTypes;
    exports.default = FilterableForkTable;
    module.exports = exports['default'];
});