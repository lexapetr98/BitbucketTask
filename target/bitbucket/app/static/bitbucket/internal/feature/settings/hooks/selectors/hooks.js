define('bitbucket/internal/feature/settings/hooks/selectors/hooks', ['exports', 'lodash', 'reselect', 'bitbucket/util/navbuilder'], function (exports, _lodash, _reselect, _navbuilder) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.getEditingHook = exports.getAllHooksByType = exports.getNotifications = exports.getLoadingHookTypes = exports.getHooks = exports.getHookPagingByType = exports.getEditingHookData = exports.getBusyHookIds = undefined;

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    /* eslint-disable no-multi-spaces */
    var getBusyHookIds = exports.getBusyHookIds = function getBusyHookIds(state) {
        return state.ui.busyHooks;
    };
    var getEditingHookData = exports.getEditingHookData = function getEditingHookData(state) {
        return state.ui.editingHook;
    };
    var getHookPagingByType = exports.getHookPagingByType = function getHookPagingByType(state) {
        return state.paging.hooks;
    };
    var getHooks = exports.getHooks = function getHooks(state) {
        return state.entities.hooks;
    };
    var getLoadingHookTypes = exports.getLoadingHookTypes = function getLoadingHookTypes(state) {
        return state.ui.loadingHookTypes;
    };
    var getNotifications = exports.getNotifications = function getNotifications(state) {
        return state.ui.notifications;
    };
    /* eslint-enable no-multi-spaces */

    var getHookAvatarUrl = function getHookAvatarUrl(key, version) {
        return _navbuilder2.default.rest().hooks().hook(key).avatar(version).build();
    };

    var groupErrors = function groupErrors(errors) {
        if (!(errors && errors.length)) {
            return {};
        }

        var formErrors = [];
        var fieldErrors = errors.reduce(function (errorMap, _ref) {
            var context = _ref.context,
                message = _ref.message;

            if (!context) {
                formErrors.push(message);
                return errorMap;
            }

            return babelHelpers.extends({}, errorMap, babelHelpers.defineProperty({}, context, (0, _lodash.get)(errorMap, context, []).concat(message)));
        }, {});

        return {
            formErrors: formErrors,
            fieldErrors: fieldErrors
        };
    };

    var enrichHooks = (0, _reselect.createSelector)([getHooks, getBusyHookIds], function (hooks, busyHookIds) {
        return (0, _lodash.mapValues)(hooks, function (hook, id) {
            return babelHelpers.extends({}, hook, {
                busy: (0, _lodash.includes)(busyHookIds, id),
                avatarUrl: getHookAvatarUrl(id, hook.version)
            });
        });
    });

    var getAllHooksByType = exports.getAllHooksByType = (0, _reselect.createSelector)([enrichHooks, getHookPagingByType, getLoadingHookTypes], function (hooks, hookPagingByType, loadingHookTypes) {
        return (0, _lodash.mapValues)(hookPagingByType, function (_ref2, type) {
            var ids = _ref2.ids,
                _ref2$lastPageMeta = _ref2.lastPageMeta,
                isLastPage = _ref2$lastPageMeta.isLastPage,
                nextPageStart = _ref2$lastPageMeta.nextPageStart;
            return {
                hooks: ids.map(function (id) {
                    return hooks[id];
                }),
                isLastPage: isLastPage,
                nextPageStart: nextPageStart,
                loading: (0, _lodash.includes)(loadingHookTypes, type)
            };
        });
    });

    var getEditingHook = exports.getEditingHook = (0, _reselect.createSelector)([enrichHooks, getEditingHookData], function (hooks, editingHookData) {
        if (editingHookData && editingHookData.id) {
            return babelHelpers.extends({}, editingHookData, {
                errors: groupErrors(editingHookData.errors),
                hook: hooks[editingHookData.id]
            });
        }
    });
});