define('bitbucket/internal/feature/settings/merge-strategies/merge-strategies', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/enums', 'bitbucket/internal/feature/repository/inherit-settings-toggle/inherit-settings-toggle', 'bitbucket/internal/util/scope-type'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _server, _enums, _inheritSettingsToggle, _scopeType) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _inheritSettingsToggle2 = babelHelpers.interopRequireDefault(_inheritSettingsToggle);

    var MergeConfigType = {
        DEFAULT: 'DEFAULT',
        PROJECT: 'PROJECT',
        REPOSITORY: 'REPOSITORY',
        SCM: 'SCM'
    };

    var currentFlag = void 0;
    var state = {
        mergeConfig: {},
        inheriting: false
    };

    var setState = function setState(newState) {
        state = babelHelpers.extends({}, state, newState);
        return state;
    };

    var mergeStrategies = void 0; // global variable that gets set in onReady
    var mergeStrategyContainer = '.merge-strategy-container';
    var mergeStrategyToggle = '.merge-strategy';
    var defaultLozenge = '.lozenge-default-strategy';
    var defaultMergeStrategyInput = '.default-merge-strategy input';
    var defaultMergeCheckedClassName = 'is-default-strategy';
    var defaultMergeStrategyLabel = '.default-merge-strategy label';

    function simplifiedMergeConfig(defaultId, enabledIds) {
        return {
            mergeConfig: {
                defaultStrategy: {
                    id: defaultId
                },
                strategies: enabledIds.map(function (id) {
                    return { id: id };
                })
            }
        };
    }

    /**
     * Get the merge config from the form and return it in the correct format to send to the server.
     *
     * @returns {{mergeConfig: {defaultStrategy: {id: (string)}, strategies: [{id: (string)}]}}}
     */
    function getMergeConfig() {
        var enabledIds = (0, _jquery2.default)('input[name="enabledIds"]:checked').map(function (i, el) {
            return el.value;
        }).get();
        var defaultId = (0, _jquery2.default)('input[name="defaultId"]:checked').val();

        return simplifiedMergeConfig(defaultId, enabledIds);
    }

    /**
     * Save the merge config for a given type
     *
     * @param {string} type - the merge config type
     * @param {Object} mergeConfig
     * @returns {Deferred}
     */
    function saveMergeStrategies(type, mergeConfig) {
        return (0, _server.rest)({
            url: _navbuilder2.default.rest()[(0, _scopeType.scopeNavMethod)(type)]().pullRequestSettings().build(),
            data: mergeConfig,
            type: 'POST'
        });
    }

    /**
     * Delete the repository config to force this repository to inherit it's settings from the project level.
     * @returns {Deferred}
     */
    function deleteRepoConfig() {
        return (0, _server.rest)({
            url: _navbuilder2.default.rest().currentRepo().pullRequestSettings().build(),
            data: { mergeConfig: {} },
            type: 'POST'
        });
    }

    /**
     * Validate form and save if valid
     *
     * @param {string} mergeConfigType
     */
    function saveMergeConfigHandler(mergeConfigType) {
        var mergeConfig = getMergeConfig();

        if (validateMergeConfig()) {
            return saveMergeStrategies(mergeConfigType, mergeConfig);
        }
    }

    function renderMergeConfigForm(mergeConfig) {
        var disabled = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        (0, _jquery2.default)('#merge-config-form').replaceWith(bitbucket.internal.feature.settings.mergeStrategies.mergeConfig({
            mergeConfig: mergeConfig,
            disabled: disabled
        }));
    }

    /**
     * One of the merge strategy toggles has changed
     * @param {Event} e
     */
    function mergeStrategiesChangedHandler(e) {
        if (currentFlag) {
            currentFlag.close();
            currentFlag = null;
        }

        var $defaultRadio = (0, _jquery2.default)(e.target).closest(mergeStrategyContainer).find(defaultMergeStrategyInput);
        // uncheck the default radio if the strategy is unselected
        if (!e.target.checked) {
            if ($defaultRadio.prop('checked')) {
                (0, _jquery2.default)(defaultLozenge).remove();
                $defaultRadio.prop('checked', false).removeAttr('checked').trigger('change');
            }
        }

        $defaultRadio.attr('disabled', !e.target.checked);

        var $checkedStrategies = (0, _jquery2.default)(mergeStrategyToggle + '[checked]');
        // if there's just one checked strategy, set it as the default
        if ($checkedStrategies.length === 1) {
            $checkedStrategies.closest(mergeStrategyContainer).find(defaultMergeStrategyInput).click();
        }

        validateMergeConfig();
    }

    /**
     * A new default strategy has been chosen.
     *
     * @param {Event} e
     */
    function defaultMergeStrategyChangedHandler(e) {
        var toggleEl = document.getElementById(e.target.value);
        var $mergeStrategies = (0, _jquery2.default)(mergeStrategies);

        // Update the checked attribute on the selected item for func tests.
        (0, _lodash.forEach)(document.querySelectorAll('input[name="' + e.target.name + '"]'), function (el) {
            return el.removeAttribute('checked');
        });
        e.target.setAttribute('checked', 'checked');

        // reset all default labels
        $mergeStrategies.find(defaultMergeStrategyLabel).text(_aui.I18n.getText('bitbucket.web.settings.mergestrategy.set.default'));

        (0, _jquery2.default)('.' + defaultMergeCheckedClassName).removeClass(defaultMergeCheckedClassName);

        // move the indicator lozenge to the new default strategy
        if (e.target.checked) {
            (0, _jquery2.default)(defaultLozenge).remove();
            (0, _jquery2.default)(bitbucket.internal.feature.settings.mergeStrategies.defaultLozenge()).insertAfter(toggleEl);

            // update this label as the default
            (0, _jquery2.default)(e.target).next(defaultMergeStrategyLabel).text('(' + _aui.I18n.getText('bitbucket.web.settings.mergestrategy.default') + ')').closest(mergeStrategyContainer).addClass(defaultMergeCheckedClassName);
        }

        validateMergeConfig();
    }

    /**
     * Validate the merge config and show errors in the form if necessary.
     *
     * @returns {boolean}
     */
    function validateMergeConfig() {
        var $mergeStrategies = (0, _jquery2.default)(mergeStrategies);
        var $errorsContainer = (0, _jquery2.default)('#merge-strategy-errors');
        var hasStrategy = $mergeStrategies.find(mergeStrategyToggle + '[checked]').length;
        var hasDefault = $mergeStrategies.find(defaultMergeStrategyInput + ':checked').length;
        var valid = hasStrategy && hasDefault;

        $errorsContainer.html(bitbucket.internal.feature.settings.mergeStrategies.errors({
            hasStrategy: hasStrategy,
            hasDefault: hasDefault
        }));

        setElementDisabledState(document.getElementById('merge-strategies-submit'), !valid);

        return valid;
    }

    /**
     * Extract the IDs from the strategies for comparison.
     *
     * @param {Array<Object>} arr - array of enabled strategies for a merge config
     * @returns {Array<string>}
     */
    var sortedIds = function sortedIds(arr) {
        return arr.map(function (strat) {
            return strat.id;
        }).sort();
    };

    /**
     * Check the default strategy ID and the difference between enabled configs.
     *
     * @param {Object} oldConfig
     * @param {Object} newConfig
     * @returns {boolean}
     */
    function hasMergeConfigChanged(_ref, _ref2) {
        var oldConfig = _ref.mergeConfig;
        var newConfig = _ref2.mergeConfig;

        if (oldConfig.defaultStrategy.id !== newConfig.defaultStrategy.id) {
            return true;
        }
        return !(0, _lodash.isEqual)(sortedIds(oldConfig.strategies), sortedIds(newConfig.strategies));
    }

    /**
     * Set up inheritance on repo settings. Will enable/disable the form.
     */
    function setupInheritance() {
        var _mergeConfigChanged = function _mergeConfigChanged() {
            return hasMergeConfigChanged(simplifiedMergeConfig(state.mergeConfig.defaultStrategy.id, state.mergeConfig.strategies.filter(function (strat) {
                return strat.enabled;
            }).map(function (strat) {
                return strat.id;
            })), getMergeConfig()) || !state.inheriting && state.mergeConfig.type === MergeConfigType.REPOSITORY;
        };

        var inheritSettingsToggle = new _inheritSettingsToggle2.default(document.getElementById('inherit-settings-toggle'), _mergeConfigChanged);
        inheritSettingsToggle.on('change', function (type) {
            if (type === _inheritSettingsToggle.InheritanceType.INHERIT) {
                toggleFormDisabled(true);

                if (state.mergeConfig.type !== MergeConfigType.REPOSITORY && !_mergeConfigChanged()) {
                    // Haven't saved a custom config yet, so no need to delete the repo config.
                    return;
                }

                deleteRepoConfig().done(function (response) {
                    setState({
                        inheriting: true,
                        mergeConfig: response.mergeConfig
                    });
                    // update form with the inherited settings
                    renderMergeConfigForm(state.mergeConfig, true);
                }).fail(function () {
                    toggleFormDisabled(false);
                });
            } else {
                setState({
                    inheriting: false
                });
                toggleFormDisabled(false);
            }
        });
    }

    /**
     * Will enable/disable the merge configuration part of the form.
     *
     * @param {boolean} toggle
     */
    function toggleFormDisabled(toggle) {
        var formElementsSelector = ['#merge-strategies-submit', '#merge-strategies-cancel', '#merge-config-form', '#merge-config-form aui-toggle'].join(',');

        (0, _lodash.forEach)(document.querySelectorAll(formElementsSelector), function (el) {
            return setElementDisabledState(el, toggle);
        });
    }

    /**
     * @param {HTMLElement} el
     * @param {boolean} disabled
     */
    function setElementDisabledState(el, disabled) {
        el.disabled = disabled;
        el.setAttribute('aria-disabled', disabled);
    }

    /**
     * @param {Object} options
     * @param {string} options.mergeConfigType
     * @param {Object} [options.project]
     * @param {Object} [options.repository]
     * @param {Object} options.mergeConfig
     * @param {string} options.mergeStrategiesHelpUrl
     */
    function onReady(containerId, options) {
        mergeStrategies = containerId;
        var $mergeStrategies = (0, _jquery2.default)(mergeStrategies);
        var mergeConfig = options.mergeConfig,
            mergeConfigType = options.mergeConfigType,
            mergeStrategiesHelpUrl = options.mergeStrategiesHelpUrl,
            project = options.project,
            repository = options.repository;

        var effectiveMergeConfigType = mergeConfig.type;
        var projectSettingsUrl = _navbuilder2.default.currentProject().settings().mergeStrategies().build();
        var personalRepository = repository && repository.project.type === _enums.ProjectType.PERSONAL;
        var inheriting = repository && effectiveMergeConfigType !== MergeConfigType.REPOSITORY && !personalRepository;

        setState({
            inheriting: inheriting,
            mergeConfig: mergeConfig,
            mergeConfigType: mergeConfigType
        });

        $mergeStrategies.html(bitbucket.internal.feature.settings.mergeStrategies.pageContent({
            effectiveMergeConfigType: effectiveMergeConfigType,
            mergeConfig: mergeConfig,
            inheriting: inheriting,
            mergeConfigType: mergeConfigType,
            mergeStrategiesHelpUrl: mergeStrategiesHelpUrl,
            projectSettingsUrl: projectSettingsUrl,
            personalRepository: personalRepository
        }));

        $mergeStrategies.on('click', '#merge-strategies-submit', function (e) {
            var $submit = (0, _jquery2.default)(e.target);
            $submit.spin().addClass('waiting');

            saveMergeConfigHandler(mergeConfigType).done(function (response) {
                currentFlag = (0, _aui.flag)({
                    type: 'success',
                    close: 'auto',
                    body: _aui.I18n.getText('bitbucket.web.settings.mergestrategy.saved.success')
                });
                setState({
                    mergeConfig: response.mergeConfig
                });
            }).fail(function () {
                currentFlag = (0, _aui.flag)({
                    type: 'error',
                    close: 'auto',
                    body: _aui.I18n.getText('bitbucket.web.settings.mergestrategy.saved.error')
                });
            }).always(function () {
                setElementDisabledState($submit.get(0), false);
                $submit.removeClass('waiting').spinStop();
            });
            // set disabled *after* calling saveMergeConfigHandler to force it to be disabled.
            setElementDisabledState($submit.get(0), true);
        });

        $mergeStrategies.on('click', '#merge-strategies-cancel', function () {
            renderMergeConfigForm(state.mergeConfig);
            var inheritLevel = state.mergeConfig.type !== MergeConfigType.REPOSITORY ? _inheritSettingsToggle.InheritanceType.INHERIT : _inheritSettingsToggle.InheritanceType.CUSTOM;
            setState({
                inherit: inheritLevel === _inheritSettingsToggle.InheritanceType.INHERIT
            });

            document.querySelector('input[name="inherit-settings-selection"][value="' + inheritLevel + '"]').checked = true;
            validateMergeConfig();
            toggleFormDisabled(state.inherit);
        });

        $mergeStrategies.on('change', mergeStrategyToggle, mergeStrategiesChangedHandler);
        $mergeStrategies.on('change', defaultMergeStrategyInput, defaultMergeStrategyChangedHandler);

        setupInheritance();
    }

    exports.default = {
        onReady: onReady,
        MergeConfigType: MergeConfigType
    };
    module.exports = exports['default'];
});