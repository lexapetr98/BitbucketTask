define('bitbucket/internal/feature/changeset/diff-tree/containers/files', ['module', 'exports', 'react-redux', '../components/files', '../store/store'], function (module, exports, _reactRedux, _files, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _files2 = babelHelpers.interopRequireDefault(_files);

    var mapStateToProps = function mapStateToProps(state, props) {
        return {
            isCollapsed: _store.selectors.isNodeCollapsed(state, props)
        };
    };

    exports.default = (0, _reactRedux.connect)(mapStateToProps)(_files2.default);
    module.exports = exports['default'];
});