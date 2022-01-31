define('bitbucket/internal/feature/changeset/diff-tree/containers/file', ['module', 'exports', 'react-redux', 'bitbucket/internal/util/components/react-functional', '../components/file', '../helpers/navigation', '../store/store'], function (module, exports, _reactRedux, _reactFunctional, _file, _navigation, _store) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _file2 = babelHelpers.interopRequireDefault(_file);

    var mapStateToProps = function mapStateToProps(state) {
        return {
            selectedId: _store.selectors.getSelectedNodeId(state)
        };
    };

    var mapDispatchToProps = {
        selectFile: _store.actionCreators.selectItem
    };

    var mergeProps = function mergeProps(stateProps, dispatchProps, ownProps) {
        var selectedId = stateProps.selectedId;
        var id = ownProps.id;


        return babelHelpers.extends({}, ownProps, dispatchProps, {
            isSelected: selectedId === id
        });
    };

    var enhance = (0, _reactFunctional.compose)((0, _reactFunctional.withPropsMapper)(function (props) {
        return babelHelpers.extends({}, props, {
            fileUrl: (0, _navigation.getPullRequestsDiffTreeFileUrl)(props.id)
        });
    }), (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps, mergeProps));

    exports.default = enhance(_file2.default);
    module.exports = exports['default'];
});