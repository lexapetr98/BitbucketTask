define('bitbucket/internal/feature/changeset/diff-tree/components/file', ['module', 'exports', 'classnames', 'prop-types', 'react', 'bitbucket/internal/enums', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/widget/icons/icons'], function (module, exports, _classnames, _propTypes, _react, _enums, _domEvent, _icons) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _domEvent2 = babelHelpers.interopRequireDefault(_domEvent);

    var _changeTypeClassesMap;

    var changeTypeClassesMap = (_changeTypeClassesMap = {}, babelHelpers.defineProperty(_changeTypeClassesMap, _enums.ChangeTypes.ADD, 'file-added'), babelHelpers.defineProperty(_changeTypeClassesMap, _enums.ChangeTypes.COPY, 'file-copied'), babelHelpers.defineProperty(_changeTypeClassesMap, _enums.ChangeTypes.DELETE, 'file-deleted'), babelHelpers.defineProperty(_changeTypeClassesMap, _enums.ChangeTypes.MODIFY, 'file-modified'), babelHelpers.defineProperty(_changeTypeClassesMap, _enums.ChangeTypes.MOVE, 'file-moved'), babelHelpers.defineProperty(_changeTypeClassesMap, _enums.ChangeTypes.RENAME, 'file-renamed'), _changeTypeClassesMap);

    var FileIcon = function FileIcon(Icon) {
        return _react2.default.createElement(Icon, { className: 'status-icon' });
    };

    var File = function (_Component) {
        babelHelpers.inherits(File, _Component);

        function File(props) {
            babelHelpers.classCallCheck(this, File);

            var _this = babelHelpers.possibleConstructorReturn(this, (File.__proto__ || Object.getPrototypeOf(File)).call(this, props));

            _this.selectFile = function (event) {
                if (!_domEvent2.default.openInSameTab(event)) {
                    return;
                }

                event.preventDefault();

                var _this$props = _this.props,
                    isSelected = _this$props.isSelected,
                    id = _this$props.id,
                    selectFile = _this$props.selectFile;


                if (isSelected) {
                    return;
                }

                // TODO: BBSDEV-17768 Add integration for updating page URL with new filename
                selectFile(id);
            };

            _this.elementRef = _react2.default.createRef();
            return _this;
        }

        babelHelpers.createClass(File, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.isSelected !== newProps.isSelected;
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(prevProp) {
                var wasSelected = !prevProp.isSelected && this.props.isSelected;
                var element = this.elementRef.current;

                if (wasSelected) {
                    element.focus();
                }
            }
        }, {
            key: 'getStatusIcon',
            value: function getStatusIcon() {
                var _props = this.props,
                    hasConflict = _props.hasConflict,
                    hasComments = _props.hasComments,
                    isSubmodule = _props.isSubmodule;


                if (hasConflict) {
                    return _react2.default.createElement(_icons.Warning, { className: 'conflict-status-icon' });
                }

                if (isSubmodule) {
                    return FileIcon(_icons.Submodule);
                }

                return hasComments ? FileIcon(_icons.FileCommented) : FileIcon(_icons.Document);
            }
        }, {
            key: 'render',
            value: function render() {
                var _props2 = this.props,
                    name = _props2.name,
                    fileUrl = _props2.fileUrl,
                    isSelected = _props2.isSelected,
                    changeType = _props2.changeType;

                var className = (0, _classnames2.default)('file', changeTypeClassesMap[changeType], {
                    'file-selected': isSelected
                });

                var fileStatusIcon = this.getStatusIcon(this);

                return _react2.default.createElement(
                    'li',
                    { className: className },
                    _react2.default.createElement(
                        'a',
                        { href: fileUrl, onClick: this.selectFile, ref: this.elementRef },
                        fileStatusIcon,
                        _react2.default.createElement(
                            'span',
                            null,
                            name
                        )
                    )
                );
            }
        }]);
        return File;
    }(_react.Component);

    File.propTypes = {
        name: _propTypes2.default.node.isRequired,
        selectFile: _propTypes2.default.func.isRequired,
        fileUrl: _propTypes2.default.string.isRequired,
        isSelected: _propTypes2.default.bool,
        id: _propTypes2.default.string.isRequired
    };
    File.defaultProps = {
        isSelected: false
    };
    exports.default = File;
    module.exports = exports['default'];
});