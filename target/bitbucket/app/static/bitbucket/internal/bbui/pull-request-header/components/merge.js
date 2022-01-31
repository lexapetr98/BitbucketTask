define('bitbucket/internal/bbui/pull-request-header/components/merge', ['module', 'exports', 'jquery', 'lodash', 'prop-types', 'react', 'react-dom', 'bitbucket/internal/enums', '../../aui-react/inline-dialog', './merge-button', './merge-help-dialog'], function (module, exports, _jquery, _lodash, _propTypes, _react, _reactDom, _enums, _inlineDialog, _mergeButton, _mergeHelpDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _inlineDialog2 = babelHelpers.interopRequireDefault(_inlineDialog);

    var _mergeButton2 = babelHelpers.interopRequireDefault(_mergeButton);

    var _mergeHelpDialog2 = babelHelpers.interopRequireDefault(_mergeHelpDialog);

    var REASONABLE_DELAY = 50;
    var MERGE_WARNING_DIALOG_ID = 'merge-warning-inline-dialog';

    var Merge = function (_Component) {
        babelHelpers.inherits(Merge, _Component);

        function Merge() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, Merge);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = Merge.__proto__ || Object.getPrototypeOf(Merge)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
                mergeHelpDialogShowing: false
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(Merge, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                this.mergeWarningDialog = document.getElementById(MERGE_WARNING_DIALOG_ID);

                this.throttledWarningDialogHide = _lodash2.default.throttle(function () {
                    if (_this2.mergeWarningDialog) {
                        _this2.mergeWarningDialog.open = false;
                    }
                }, REASONABLE_DELAY);
                (0, _jquery2.default)(window).on('scroll resize', this.throttledWarningDialogHide);

                // the warning dialog can also be shown/hidden outside of its trigger so update state
                // by using the events triggered on the dialog.
                this.onToggleMergeWarningDialog = function (e) {
                    _this2.setState({
                        mergeWarningDialogOpen: e.type === 'aui-show' ? true : false
                    });
                };
                (0, _jquery2.default)(this.mergeWarningDialog).on('aui-show aui-hide', this.onToggleMergeWarningDialog);
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                (0, _jquery2.default)(window).off('scroll resize', this.throttledWarningDialogHide);
                (0, _jquery2.default)(this.mergeWarningDialog).off('aui-show aui-hide', this.onToggleMergeWarningDialog);
            }
        }, {
            key: 'onHideMergeHelpDialog',
            value: function onHideMergeHelpDialog() {
                this.extendedMergeHelpContent = '';
                this.setState({ mergeHelpDialogShowing: false });
                if (this.props.onMergeHelpDialogClose) {
                    this.props.onMergeHelpDialogClose();
                }
            }
        }, {
            key: 'onMergeWarningClick',
            value: function onMergeWarningClick() {
                this.toggleMergeWarningDialog();
            }
        }, {
            key: 'toggleMergeWarningDialog',
            value: function toggleMergeWarningDialog(open) {
                if (open == null) {
                    open = !this.mergeWarningDialog.open;
                }
                // If the merge warning dialog extends to below the screen view then it will flip to above the merge
                // button and be hidden. (See https://ecosystem.atlassian.net/browse/AUI-4301)

                // Render the dialog, but make the merge warnings list as small as possible so the dialog never flips
                var $mergeDialog = (0, _jquery2.default)(this.mergeWarningDialog);
                var $warningList = $mergeDialog.find('.merge-warning-content .aui-list-truncate');
                $warningList.css({ 'max-height': 0 });
                this.mergeWarningDialog.open = open;
                var bottomBuffer = 10;
                var maxHeight = 300;
                var longestAllowed = (0, _jquery2.default)(window).height() - $mergeDialog.offset().top - $mergeDialog.outerHeight() - bottomBuffer;
                // set the merge warning list to the correct height
                $warningList.css({ 'max-height': Math.min(maxHeight, longestAllowed) });
            }
        }, {
            key: 'showExtendedMergeHelp',
            value: function showExtendedMergeHelp() {
                this.setState({ mergeHelpDialogShowing: true });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var pullRequest = this.props.pullRequest;

                if (pullRequest.state === _enums.PullRequestState.OPEN && pullRequest.mergeable) {
                    var vetoes = [].concat(pullRequest.mergeable.vetoes || []);
                    if (pullRequest.mergeable.conflicted) {
                        // add the conflicted veto as the first item
                        vetoes.unshift({
                            detailedMessage: AJS.I18n.getText('bitbucket.component.pull.request.merge.conflict.tooltip'),
                            summaryMessage: AJS.I18n.getText('bitbucket.component.pull.request.merge.conflict.detail'),
                            isConflictVeto: true
                        });
                    }
                    if (!this.props.conditions.canMerge) {
                        // adds the 'has no repo write' veto
                        vetoes.push({
                            detailedMessage: AJS.I18n.getText('bitbucket.component.pull.request.merge.permissions.detail')
                        });
                    }

                    var mergeWarningDialogProps = {
                        'aria-controls': MERGE_WARNING_DIALOG_ID,
                        'aria-haspopup': true
                    };

                    var mergeHelpDialog = void 0;
                    if (this.state.mergeHelpDialogShowing) {
                        var stability = this.props.mergeHelp && this.props.mergeHelp.stability;
                        var isAutoMergeConflict = this.props.mergeHelp && this.props.mergeHelp.isAutoMergeConflict;
                        mergeHelpDialog = _react2.default.createElement(_mergeHelpDialog2.default, {
                            id: 'extended-merge-help-dialog',
                            onHide: function onHide() {
                                return _this3.onHideMergeHelpDialog();
                            },
                            pullRequest: pullRequest,
                            stability: stability,
                            isAutoMergeConflict: isAutoMergeConflict
                        });
                    }

                    var mergeWarningInlineDialog = _react2.default.createElement(
                        _inlineDialog2.default,
                        {
                            key: 'merge-warning-dialog',
                            id: MERGE_WARNING_DIALOG_ID,
                            alignment: 'bottom',
                            onShow: function onShow(e) {
                                // set focus to the first focusable item in the dialog
                                var focusEl = e.target.querySelectorAll('a, button').item(0);
                                if (focusEl) {
                                    focusEl.focus();
                                }
                            },
                            onHide: function onHide() {
                                (0, _reactDom.findDOMNode)(_this3).focus();
                            }
                        },
                        _react2.default.createElement(
                            'div',
                            { className: 'merge-warning-content' },
                            _react2.default.createElement(
                                'h6',
                                null,
                                AJS.I18n.getText('bitbucket.component.pull.request.merge.warnings.title')
                            ),
                            _react2.default.createElement(
                                'p',
                                null,
                                AJS.I18n.getText('bitbucket.component.pull.request.merge.warnings.info', vetoes && vetoes.length)
                            ),
                            _react2.default.createElement(
                                'ul',
                                { className: 'aui-list-truncate' },
                                vetoes && vetoes.map(function (veto, i) {
                                    var moreInfoButton = veto.isConflictVeto ? _react2.default.createElement(
                                        'button',
                                        {
                                            className: 'aui-button aui-button-link more-info',
                                            onClick: function onClick() {
                                                return _this3.showExtendedMergeHelp();
                                            }
                                        },
                                        AJS.I18n.getText('bitbucket.component.pull.request.merge.warnings.more.button')
                                    ) : null;
                                    return _react2.default.createElement(
                                        'li',
                                        { key: 'merge-issue-' + i },
                                        _react2.default.createElement(
                                            'span',
                                            { className: 'message' },
                                            _react2.default.createElement('span', { className: 'aui-icon aui-icon-small aui-iconfont-warning' }),
                                            veto.detailedMessage
                                        ),
                                        moreInfoButton
                                    );
                                })
                            )
                        )
                    );

                    return _react2.default.createElement(
                        _react2.default.Fragment,
                        null,
                        _react2.default.createElement(_mergeButton2.default, {
                            onMergeClick: this.props.onMergeClick,
                            onMergeWarningClick: function onMergeWarningClick() {
                                return _this3.onMergeWarningClick();
                            },
                            mergeable: pullRequest.mergeable,
                            conditions: this.props.conditions,
                            conflicted: pullRequest.mergeable.conflicted,
                            vetoes: pullRequest.mergeable.vetoes,
                            extraButtonProps: mergeWarningDialogProps,
                            tooltipVisibility: !this.state.mergeWarningDialogOpen
                        }),
                        mergeWarningInlineDialog,
                        mergeHelpDialog
                    );
                }

                return null;
            }
        }], [{
            key: 'getDerivedStateFromProps',
            value: function getDerivedStateFromProps(_ref2, _ref3) {
                var showMergeHelpDialog = _ref2.showMergeHelpDialog;
                var mergeHelpDialogShowing = _ref3.mergeHelpDialogShowing,
                    propShowMergeHelpDialog = _ref3.propShowMergeHelpDialog;

                return {
                    propShowMergeHelpDialog: showMergeHelpDialog,
                    mergeHelpDialogShowing: showMergeHelpDialog === propShowMergeHelpDialog ? mergeHelpDialogShowing : showMergeHelpDialog
                };
            }
        }]);
        return Merge;
    }(_react.Component);

    Merge.propTypes = {
        conditions: _propTypes2.default.object.isRequired,
        mergeHelp: _propTypes2.default.object,
        onMergeClick: _propTypes2.default.func.isRequired,
        onMergeHelpDialogClose: _propTypes2.default.func,
        pullRequest: _propTypes2.default.object.isRequired,
        showMergeHelpDialog: _propTypes2.default.bool
    };
    exports.default = Merge;
    module.exports = exports['default'];
});