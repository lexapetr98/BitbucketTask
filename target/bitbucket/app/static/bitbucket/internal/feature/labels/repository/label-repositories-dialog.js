define('bitbucket/internal/feature/labels/repository/label-repositories-dialog', ['module', 'exports', '@atlassian/aui', 'prop-types', 'react', 'bitbucket/util/server', 'bitbucket/internal/bbui/aui-react/dialog', 'bitbucket/internal/util/i18n-html', './label-repositories-dialog-content'], function (module, exports, _aui, _propTypes, _react, _server, _dialog, _i18nHtml, _labelRepositoriesDialogContent) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _i18nHtml2 = babelHelpers.interopRequireDefault(_i18nHtml);

    var _labelRepositoriesDialogContent2 = babelHelpers.interopRequireDefault(_labelRepositoriesDialogContent);

    var LabelRepositoriesDialog = function (_Component) {
        babelHelpers.inherits(LabelRepositoriesDialog, _Component);

        function LabelRepositoriesDialog() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, LabelRepositoriesDialog);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = LabelRepositoriesDialog.__proto__ || Object.getPrototypeOf(LabelRepositoriesDialog)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
                dialogRendered: false
            }, _this.dialogElRef = _react2.default.createRef(), _this.dialogContentEl = null, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(LabelRepositoriesDialog, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                this.dialogContentEl = (0, _dialog.getDialogContent)(this.dialogElRef.current);

                this.setState({
                    dialogRendered: true
                });
            }
        }, {
            key: 'getTitle',
            value: function getTitle() {
                return _react2.default.createElement(
                    _i18nHtml2.default.p,
                    {
                        params: [this.props.labelName],
                        className: 'label-repositories-dialog__title'
                    },
                    _aui.I18n.getText('bitbucket.web.label.search.title')
                );
            }
        }, {
            key: 'render',
            value: function render() {
                var dialogRendered = this.state.dialogRendered;


                var dialogContent = dialogRendered ? _react2.default.createElement(_labelRepositoriesDialogContent2.default, {
                    labelName: this.props.labelName,
                    dialogContentEl: this.dialogContentEl
                }) : null;

                return _react2.default.createElement(
                    _dialog.DialogWithRef,
                    {
                        size: _dialog.DialogSize.LARGE,
                        titleContent: this.getTitle(),
                        onClose: this.props.onCancel,
                        className: 'label-repositories-dialog',
                        ref: this.dialogElRef
                    },
                    dialogContent
                );
            }
        }]);
        return LabelRepositoriesDialog;
    }(_react.Component);

    LabelRepositoriesDialog.propTypes = {
        labelName: _propTypes2.default.string.isRequired,
        onCancel: _propTypes2.default.func.isRequired
    };
    exports.default = LabelRepositoriesDialog;
    module.exports = exports['default'];
});