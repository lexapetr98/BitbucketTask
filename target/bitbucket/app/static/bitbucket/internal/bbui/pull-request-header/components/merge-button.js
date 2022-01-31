define('bitbucket/internal/bbui/pull-request-header/components/merge-button', ['module', 'exports', 'classnames', 'jquery', 'prop-types', 'react', 'react-dom', '../../aui-react/spinner'], function (module, exports, _classnames, _jquery, _propTypes, _react, _reactDom, _spinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var MergeButton = function (_Component) {
        babelHelpers.inherits(MergeButton, _Component);

        function MergeButton() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, MergeButton);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = MergeButton.__proto__ || Object.getPrototypeOf(MergeButton)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
                canMerge: false
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(MergeButton, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var node = (0, _reactDom.findDOMNode)(this);
                (0, _jquery2.default)(node).tooltip({
                    gravity: 'ne',
                    live: true
                });
            }
        }, {
            key: 'getSnapshotBeforeUpdate',
            value: function getSnapshotBeforeUpdate() {
                if (this.props.mergeable.isChecking) {
                    // the spinner will be shown, measure the button and set its width.
                    // use getBoundingClientRect to get the full width of the
                    // button (including borders)
                    var node = (0, _reactDom.findDOMNode)(this);
                    var rect = node.getBoundingClientRect();
                    return rect.right - rect.left + 'px';
                }
                return '';
            }
        }, {
            key: 'componentDidUpdate',
            value: function componentDidUpdate(prevProps, prevState, widthCss) {
                var node = (0, _reactDom.findDOMNode)(this);
                node.style.width = widthCss;

                // need to remove the original-title because tipsy will continue to show
                // if it is not removed.
                if (!node.getAttribute('title')) {
                    node.setAttribute('title', node.getAttribute('original-title') || '');
                    node.removeAttribute('original-title');
                }

                var enabled = this.props.tooltipVisibility ? 'enable' : 'disable';
                (0, _jquery2.default)(node).tooltip(enabled);
            }
        }, {
            key: 'onClick',
            value: function onClick() {
                if (this.state.canMerge) {
                    this.props.onMergeClick();
                } else if (!this.props.mergeable.isChecking) {
                    this.props.onMergeWarningClick();
                }
            }
        }, {
            key: 'mergeIssueReason',
            value: function mergeIssueReason() {
                var title = '';

                if (!this.state.canMerge) {
                    var _props = this.props,
                        conflicted = _props.conflicted,
                        _props$vetoes = _props.vetoes,
                        vetoes = _props$vetoes === undefined ? [] : _props$vetoes;

                    if (conflicted && (!vetoes || vetoes.length === 0)) {
                        title = AJS.I18n.getText('bitbucket.component.pull.request.merge.conflict.tooltip');
                    } else if (vetoes && vetoes.length === 1 && !conflicted) {
                        title = vetoes[0].summaryMessage || vetoes[0].detailedMessage;
                    } else {
                        title = AJS.I18n.getText('bitbucket.component.pull.request.merge.issue.tooltip');
                    }
                }
                return title;
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var isChecking = this.props.mergeable.isChecking;
                var enabled = !isChecking && this.state.canMerge;
                var className = (0, _classnames2.default)('aui-button', 'merge-button');
                return _react2.default.createElement(
                    'button',
                    babelHelpers.extends({
                        onClick: function onClick() {
                            return _this2.onClick();
                        },
                        className: className,
                        'aria-disabled': !enabled,
                        title: isChecking ? null : this.mergeIssueReason()
                    }, this.props.extraButtonProps),
                    isChecking ? _react2.default.createElement(_spinner2.default, null) : AJS.I18n.getText('bitbucket.component.pull.request.toolbar.merge')
                );
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(_ref2) {
                var mergeable = _ref2.mergeable,
                    conditions = _ref2.conditions;

                return {
                    canMerge: mergeable.canMerge && conditions.canMerge
                };
            }
        }]);
        return MergeButton;
    }(_react.Component);

    MergeButton.propTypes = {
        conflicted: _propTypes2.default.bool,
        conditions: _propTypes2.default.object.isRequired,
        mergeable: _propTypes2.default.shape({
            isChecking: _propTypes2.default.bool,
            canMerge: _propTypes2.default.bool
        }),
        onMergeClick: _propTypes2.default.func.isRequired,
        onMergeWarningClick: _propTypes2.default.func.isRequired,
        extraButtonProps: _propTypes2.default.object,
        vetoes: _propTypes2.default.arrayOf(_propTypes2.default.shape({
            summaryMessage: _propTypes2.default.string,
            detailedMessage: _propTypes2.default.string.isRequired
        })),
        tooltipVisibility: _propTypes2.default.bool
    };
    MergeButton.defaultProps = {
        conflicted: false,
        mergeable: {
            isChecking: false,
            canMerge: true
        },
        extraButtonProps: {}
    };
    exports.default = MergeButton;
    module.exports = exports['default'];
});