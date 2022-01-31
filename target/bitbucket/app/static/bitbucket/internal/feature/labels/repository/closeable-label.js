define('bitbucket/internal/feature/labels/repository/closeable-label', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react'], function (module, exports, _aui, _propTypes, _react) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var CloseableLabel = function (_PureComponent) {
        babelHelpers.inherits(CloseableLabel, _PureComponent);

        function CloseableLabel() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, CloseableLabel);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = CloseableLabel.__proto__ || Object.getPrototypeOf(CloseableLabel)).call.apply(_ref, [this].concat(args))), _this), _this.onRemove = function (event) {
                event.preventDefault();

                _this.props.onRemove(_this.props.label);
            }, _this.onKeyboardRemove = function (event) {
                if (event.key !== 'Enter') {
                    return;
                }

                event.stopPropagation();

                _this.onRemove(event);
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(CloseableLabel, [{
            key: 'render',
            value: function render() {
                var label = this.props.label;


                return _react2.default.createElement(
                    'span',
                    { className: 'aui-label aui-label-closeable aui-label-split' },
                    _react2.default.createElement(
                        'span',
                        { className: 'aui-label-split-main', title: label },
                        label
                    ),
                    _react2.default.createElement(
                        'span',
                        { className: 'aui-label-split-close' },
                        _react2.default.createElement(
                            'button',
                            {
                                className: 'aui-icon aui-icon-close',
                                onClick: this.onRemove,
                                onKeyDown: this.onKeyboardRemove,
                                title: _aui.I18n.getText('bitbucket.web.labels.remove.title', label)
                            },
                            '(' + _aui.I18n.getText('bitbucket.web.labels.remove.title', label) + ')'
                        )
                    )
                );
            }
        }]);
        return CloseableLabel;
    }(_react.PureComponent);

    CloseableLabel.propTypes = {
        label: _propTypes2.default.node.isRequired,
        onRemove: _propTypes2.default.func.isRequired
    };
    exports.default = CloseableLabel;
    module.exports = exports['default'];
});