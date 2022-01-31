define('bitbucket/internal/feature/changeset/diff-tree/containers/directory', ['module', 'exports', 'react-redux', '../components/directory', '../store/store'], function (module, exports, _reactRedux, _directory, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _directory2 = babelHelpers.interopRequireDefault(_directory);

    var mapStateToProps = function mapStateToProps(store, props) {
        return {
            isCollapsed: _store.selectors.isNodeCollapsed(store, props)
        };
    };

    var toggleCollapse = _store.actionCreators.toggleCollapse;


    var mapDispatchToProps = {
        toggleCollapse: toggleCollapse
    };

    exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(_directory2.default);
    module.exports = exports['default'];
});