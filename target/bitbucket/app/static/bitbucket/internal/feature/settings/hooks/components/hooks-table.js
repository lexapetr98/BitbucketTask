define('bitbucket/internal/feature/settings/hooks/components/hooks-table', ['exports', '@atlassian/aui', 'classnames', 'jquery', 'lodash', 'react', 'bitbucket/util/state', 'bitbucket/internal/bbui/aui-react/avatar', 'bitbucket/internal/bbui/aui-react/toggle-button', 'bitbucket/internal/enums', 'bitbucket/internal/model/scope-type', 'bitbucket/internal/widget/icons/icons', '../hook-type', './inherit-toggle'], function (exports, _aui, _classnames, _jquery, _lodash, _react, _state, _avatar, _toggleButton, _enums, _scopeType, _icons, _hookType, _inheritToggle) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.HookRow = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _toggleButton2 = babelHelpers.interopRequireDefault(_toggleButton);

    var _inheritToggle2 = babelHelpers.interopRequireDefault(_inheritToggle);

    var _invalidScopeI18nMap;

    var ENABLED = _inheritToggle.toggleStatus.ENABLED,
        DISABLED = _inheritToggle.toggleStatus.DISABLED;


    var invalidScopeI18nMap = (_invalidScopeI18nMap = {}, babelHelpers.defineProperty(_invalidScopeI18nMap, _scopeType.PROJECT, function (hook) {
        return (0, _hookType.isMergeCheck)(hook) ? _aui.I18n.getText('bitbucket.web.merge.checks.invalid.for.project.scope') : _aui.I18n.getText('bitbucket.web.hooks.invalid.for.project.scope');
    }), babelHelpers.defineProperty(_invalidScopeI18nMap, _scopeType.REPOSITORY, function (hook) {
        return (0, _hookType.isMergeCheck)(hook) ? _aui.I18n.getText('bitbucket.web.merge.checks.invalid.for.repository.scope') : _aui.I18n.getText('bitbucket.web.hooks.invalid.for.repository.scope');
    }), _invalidScopeI18nMap);

    var isPersonalProject = function isPersonalProject() {
        return _state2.default.getProject().type === _enums.ProjectType.PERSONAL;
    };

    var HookRow = exports.HookRow = function (_Component) {
        babelHelpers.inherits(HookRow, _Component);

        function HookRow() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, HookRow);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = HookRow.__proto__ || Object.getPrototypeOf(HookRow)).call.apply(_ref, [this].concat(args))), _this), _this.onEdit = function () {
                var _this$props = _this.props,
                    hook = _this$props.hook,
                    onEdit = _this$props.onEdit;


                onEdit && onEdit(hook);
            }, _this.onToggle = function (enable) {
                var _this$props2 = _this.props,
                    hook = _this$props2.hook,
                    onEnable = _this$props2.onEnable;


                onEnable && onEnable(hook, enable);
            }, _this.onChange = function (status) {
                var _this$props3 = _this.props,
                    hook = _this$props3.hook,
                    onEnable = _this$props3.onEnable,
                    onInherit = _this$props3.onInherit;


                if (onEnable && (status === ENABLED || status === DISABLED)) {
                    onEnable(hook, status === ENABLED);
                } else {
                    //Some variant of choosing "inherited"
                    onInherit && onInherit(hook);
                }
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(HookRow, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                (0, _jquery2.default)(this.row).tooltip({ gravity: 'e' });
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var _props = this.props,
                    currentScope = _props.currentScope,
                    hook = _props.hook;
                var avatarUrl = hook.avatarUrl,
                    busy = hook.busy,
                    details = hook.details,
                    enabled = hook.enabled,
                    scope = hook.scope;
                var configFormKey = details.configFormKey,
                    description = details.description,
                    name = details.name,
                    scopeTypes = details.scopeTypes;

                var disabled = !(0, _lodash.includes)(scopeTypes, currentScope.type);

                return _react2.default.createElement(
                    'tr',
                    {
                        ref: function ref(row) {
                            _this2.row = row;
                        },
                        className: (0, _classnames2.default)({ disabled: disabled }),
                        title: disabled ? invalidScopeI18nMap[currentScope.type](hook) : undefined
                    },
                    _react2.default.createElement(
                        'td',
                        { className: 'hook-avatar-cell' },
                        _react2.default.createElement(_avatar.Avatar, { avatarSrc: avatarUrl, size: _avatar.AvatarTShirtSize.LARGE })
                    ),
                    _react2.default.createElement(
                        'td',
                        { className: 'hook-summary-cell' },
                        _react2.default.createElement(
                            'h4',
                            null,
                            name
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            description
                        )
                    ),
                    _react2.default.createElement(
                        'td',
                        { className: 'hook-edit-cell' },
                        configFormKey && enabled && scope.type === currentScope.type ? _react2.default.createElement(
                            'button',
                            {
                                className: 'aui-button aui-button-subtle',
                                onClick: this.onEdit,
                                title: _aui.I18n.getText('bitbucket.web.hooks.edit.tooltip', hook.details.name)
                            },
                            _react2.default.createElement(_icons.EditFilledIcon, null)
                        ) : null
                    ),
                    _react2.default.createElement(
                        'td',
                        { className: 'hook-toggle-cell' },
                        currentScope.type === _scopeType.REPOSITORY && !isPersonalProject() ? _react2.default.createElement(_inheritToggle2.default, {
                            busy: busy,
                            canInherit: (0, _lodash.includes)(scopeTypes, _scopeType.PROJECT),
                            disabled: disabled,
                            enabled: enabled,
                            inherited: scope.type === _scopeType.PROJECT,
                            onChange: this.onChange
                        }) : _react2.default.createElement(_toggleButton2.default, {
                            busy: busy,
                            checked: enabled,
                            disabled: disabled,
                            label: enabled ? _aui.I18n.getText('bitbucket.web.hooks.toggle.label.enabled') : _aui.I18n.getText('bitbucket.web.hooks.toggle.label.disabled'),
                            'tooltip-on': _aui.I18n.getText('bitbucket.web.hooks.toggle.tooltip.on'),
                            'tooltip-off': _aui.I18n.getText('bitbucket.web.hooks.toggle.tooltip.off'),
                            onToggle: this.onToggle
                        })
                    )
                );
            }
        }]);
        return HookRow;
    }(_react.Component);

    var typeToClassSuffix = function typeToClassSuffix(type) {
        return type.toLowerCase().replace('_', '-');
    };

    exports.default = function (_ref2) {
        var currentScope = _ref2.currentScope,
            hooks = _ref2.hooks,
            onEdit = _ref2.onEdit,
            onEnable = _ref2.onEnable,
            onInherit = _ref2.onInherit,
            type = _ref2.type;

        //Move any hooks not valid at this scope to the end of the table
        var sortedHooks = (0, _lodash.sortBy)(hooks, function (hook) {
            return !(0, _lodash.includes)(hook.details.scopeTypes, currentScope.type);
        });

        return _react2.default.createElement(
            'table',
            {
                className: (0, _classnames2.default)('aui table', 'hooks-table', 'hooks-table-' + typeToClassSuffix(type))
            },
            _react2.default.createElement(
                'tbody',
                null,
                sortedHooks.length ? sortedHooks.map(function (hook) {
                    return _react2.default.createElement(HookRow, {
                        currentScope: currentScope,
                        hook: hook,
                        key: hook.details.key,
                        onEdit: onEdit,
                        onEnable: onEnable,
                        onInherit: onInherit
                    });
                }) : _react2.default.createElement(
                    'tr',
                    { className: 'no-hooks-message' },
                    _react2.default.createElement(
                        'td',
                        null,
                        type === _hookType.PRE_PULL_REQUEST_MERGE ? _aui.I18n.getText('bitbucket.web.merge.checks.table.empty') : _aui.I18n.getText('bitbucket.web.hooks.table.empty')
                    )
                )
            )
        );
    };
});