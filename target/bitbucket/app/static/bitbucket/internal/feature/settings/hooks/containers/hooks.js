define('bitbucket/internal/feature/settings/hooks/containers/hooks', ['exports', '@atlassian/aui', 'lodash', 'react', 'react-redux', 'bitbucket/internal/bbui/aui-react/flags', 'bitbucket/internal/bbui/aui-react/spinner', '../action-creators/configure-hook', '../action-creators/load-hooks', '../action-creators/notifications', '../components/hook-config-dialog', '../components/hooks-table', '../hook-type', '../selectors/hooks'], function (exports, _aui, _lodash, _react, _reactRedux, _flags, _spinner, _configureHook, _loadHooks, _notifications, _hookConfigDialog, _hooksTable, _hookType, _hooks) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Hooks = undefined;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _flags2 = babelHelpers.interopRequireDefault(_flags);

    var _spinner2 = babelHelpers.interopRequireDefault(_spinner);

    var _loadHooks2 = babelHelpers.interopRequireDefault(_loadHooks);

    var _hookConfigDialog2 = babelHelpers.interopRequireDefault(_hookConfigDialog);

    var _hooksTable2 = babelHelpers.interopRequireDefault(_hooksTable);

    var _i18nMap;

    var i18nMap = (_i18nMap = {}, babelHelpers.defineProperty(_i18nMap, _hookType.POST_RECEIVE, {
        description: _aui.I18n.getText('bitbucket.web.hooks.postreceive.description'),
        title: _aui.I18n.getText('bitbucket.web.hooks.postreceive.title')
    }), babelHelpers.defineProperty(_i18nMap, _hookType.PRE_RECEIVE, {
        description: _aui.I18n.getText('bitbucket.web.hooks.prereceive.description'),
        title: _aui.I18n.getText('bitbucket.web.hooks.prereceive.title')
    }), _i18nMap);

    var LoadMore = function LoadMore(_ref) {
        var isLastPage = _ref.isLastPage,
            loading = _ref.loading,
            onClick = _ref.onClick,
            text = _ref.text;

        if (isLastPage) {
            return null;
        }

        return _react2.default.createElement(
            'div',
            { className: 'more-container' },
            loading ? _react2.default.createElement(_spinner2.default, null) : _react2.default.createElement(
                'button',
                { className: 'aui-button aui-button-link', onClick: onClick },
                text
            )
        );
    };

    var Hooks = exports.Hooks = function (_Component) {
        babelHelpers.inherits(Hooks, _Component);

        function Hooks(props) {
            babelHelpers.classCallCheck(this, Hooks);

            //Add currentScope to all the configure-hook and load-hooks action-creator calls. Keep in sync with the import above
            var _this = babelHelpers.possibleConstructorReturn(this, (Hooks.__proto__ || Object.getPrototypeOf(Hooks)).call(this, props));

            ['cancelEditHook', 'editHook', 'enableHook', 'inheritHook', 'loadHooks', 'saveHookConfiguration'].forEach(function (actionCreator) {
                _this[actionCreator] = function () {
                    var _this$props;

                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return (_this$props = _this.props)[actionCreator].apply(_this$props, [_this.props.currentScope].concat(args));
                };
            });
            return _this;
        }

        babelHelpers.createClass(Hooks, [{
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    currentScope = _props.currentScope,
                    dismissNotification = _props.dismissNotification,
                    editingHook = _props.editingHook,
                    hooksByType = _props.hooksByType,
                    notifications = _props.notifications;


                return _react2.default.createElement(
                    'div',
                    null,
                    (0, _lodash.map)(hooksByType, function (_ref2, type) {
                        var hooks = _ref2.hooks,
                            isLastPage = _ref2.isLastPage,
                            nextPageStart = _ref2.nextPageStart,
                            loading = _ref2.loading;
                        return _react2.default.createElement(
                            'section',
                            { key: 'hooks-section-' + type, className: 'hook-type-section' },
                            i18nMap[type] ? _react2.default.createElement(
                                'h3',
                                null,
                                i18nMap[type].title
                            ) : null,
                            i18nMap[type] ? _react2.default.createElement(
                                'p',
                                { className: 'hook-type-description' },
                                i18nMap[type].description
                            ) : null,
                            _react2.default.createElement(_hooksTable2.default, {
                                currentScope: currentScope,
                                hooks: hooks,
                                onEdit: _this2.editHook,
                                onEnable: _this2.enableHook,
                                onInherit: _this2.inheritHook,
                                type: type
                            }),
                            _react2.default.createElement(LoadMore, {
                                isLastPage: isLastPage,
                                loading: loading,
                                onClick: function onClick() {
                                    return _this2.loadHooks(type, {
                                        start: nextPageStart
                                    });
                                },
                                text: type === _hookType.PRE_PULL_REQUEST_MERGE ? _aui.I18n.getText('bitbucket.web.merge.checks.load.more') : _aui.I18n.getText('bitbucket.web.hooks.load.more')
                            })
                        );
                    }),
                    editingHook ? _react2.default.createElement(_hookConfigDialog2.default, babelHelpers.extends({}, editingHook, {
                        currentScope: currentScope,
                        onCancel: this.cancelEditHook,
                        onSave: this.saveHookConfiguration
                    })) : null,
                    _react2.default.createElement(_flags2.default, { flags: notifications, onClose: dismissNotification })
                );
            }
        }]);
        return Hooks;
    }(_react.Component);

    function mapStateToProps(state) {
        return {
            hooksByType: (0, _hooks.getAllHooksByType)(state),
            editingHook: (0, _hooks.getEditingHook)(state),
            notifications: (0, _hooks.getNotifications)(state)
        };
    }

    var mapDispatchToProps = {
        cancelEditHook: _configureHook.cancelEditHook,
        dismissNotification: _notifications.dismissNotification,
        editHook: _configureHook.editHook,
        enableHook: _configureHook.enableHook,
        inheritHook: _configureHook.inheritHook,
        loadHooks: _loadHooks2.default,
        saveHookConfiguration: _configureHook.saveHookConfiguration
    };

    exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Hooks);
});