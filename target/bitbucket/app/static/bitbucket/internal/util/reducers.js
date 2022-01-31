define('bitbucket/internal/util/reducers', ['exports', 'icepick', 'lodash', 'bitbucket/internal/util/get-id', './object'], function (exports, _icepick, _lodash, _getId, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.errorsReducer = exports.pagingReducer = exports.entitiesReducer = exports.toggleReducer = exports.singleKeyedReducer = exports.multiKeyedReducer = exports.reduceByTypes = exports.reduceByType = exports.preserveIfEquivalent = exports.preserveEquivalentArraysUnion = exports.preserveEqualArrays = undefined;


    var tryFreeze = function tryFreeze(o) {
        return o !== Object(o) ? o : (0, _icepick.freeze)(o);
    };

    var preserveEqualArrays = exports.preserveEqualArrays = function preserveEqualArrays(targetVal, sourceVal) {
        // By default, icepick.merge always overwrites arrays, even if they are 'equal'.
        // We incur a small performance hit here to do the isEqual check on Arrays,
        // but it allows us to preserve object references and prevent re-rendering later on
        if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
            return (0, _lodash.isEqual)(targetVal, sourceVal) ? targetVal : sourceVal;
        }

        return sourceVal;
    };

    var preserveEquivalentArraysUnion = exports.preserveEquivalentArraysUnion = function preserveEquivalentArraysUnion(targetVal, sourceVal) {
        // By default, icepick.merge always overwrites arrays, even if they are 'equal'.
        // This differs from preserveEqualArrays in that it doesn't care about order,
        // only if the unioned list of elements is the same
        if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
            var newArray = (0, _lodash.unionWith)(targetVal, sourceVal, _lodash.isEqual);

            return (0, _lodash.isEqual)(targetVal, newArray) ? targetVal : newArray;
        }

        return sourceVal;
    };

    /**
     * If old and new state have all the same property values, return old state. Otherwise return new state.
     * @param oldState
     * @param newState
     * @returns {state}
     */
    var preserveIfEquivalent = exports.preserveIfEquivalent = function preserveIfEquivalent(oldState, newState) {
        return (0, _object.shallowEqual)(oldState, newState) ? oldState : newState;
    };

    /**
     * Reduce each action type differently. Take care to use this only at leaf-nodes of your Redux state so that
     * you can reduce atomic bits of state.
     *
     * @param {*} initialValue - starting value of state
     * @param {Object<function>} handlers - an object where each property is an action type and the value is the reducer that should handle it
     * @returns {reducer}
     *
     * @example
     *
     * const loadingReducer = reduceByType(false, {
     *     'LOADING_START': (state, action) => true,
     *     'LOADING_END': (state, action) => false,
     * });
     *
     * loadingReducer(undefined, { type: 'UNKNOWN' }) === false;
     * loadingReducer(undefined, { type: 'LOADING_START' }) === true;
     *
     */
    var reduceByType = exports.reduceByType = function reduceByType(initialValue, handlers) {
        return function () {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : tryFreeze(initialValue);
            var action = arguments[1];
            var context = arguments[2];

            if (handlers[action.type]) {
                return tryFreeze(handlers[action.type](state, action, context));
            }
            return state;
        };
    };

    /**
     * Map multiple action types to the same reducer. This is just syntactic sugar for reduceByType where many
     * action types are handled with the same reducer.
     *
     * @param {*} initialValue - starting value of state
     * @param {Map} handlers - a Map of string -> reducer or Array<string> -> reducer
     * @returns {reducer}
     *
     * @example
     *
     * const busyReducer = reduceByTypes(false, [
     *     [
     *         ['LOADING_START', 'CREATE_START', 'DELETE_START', 'UPDATE_START'],
     *         (state, action) => true,
     *     ],
     *     [
     *         'LOADING_END', // simple strings are allowed
     *         (state, action) => false,
     *     ],
     * ]);
     *
     * busyReducer(undefined, { type: 'UNKNOWN' }) === false;
     * busyReducer(undefined, { type: 'LOADING_START' }) === true;
     *
     */
    var reduceByTypes = exports.reduceByTypes = function reduceByTypes(initialValue, handlers) {
        return reduceByType(initialValue, Array.from(handlers).reduce(function (expandedHandlers, _ref) {
            var _ref2 = babelHelpers.slicedToArray(_ref, 2),
                types = _ref2[0],
                reducer = _ref2[1];

            (0, _lodash.castArray)(types).forEach(function (type) {
                return expandedHandlers[type] = reducer;
            });
            return expandedHandlers;
        }, {}));
    };

    /**
     * Reduces state that is stored as subtrees under unique `key`s.
     *
     * NOTE: your keyGetter must know how to extract a key from every action you want to reduce.
     * This means you must either know all the actions you will want to reduce upfront, or any dynamically-added reducers
     * will need to conform to a predetermined shape that you can extract a key from.
     *
     * NOTE: Your keyGetter must also handle actions you do NOT want to reduce. Be sure you aren't assuming a payload shape.
     *
     * @param {function} keyGetter - a function that takes in an action and returns either a string key to use for the state or null to
     *                    skip reducing this action
     * @returns {function(reducer)}
     * reducer - a reducer to be applied at the subtree level (below the key).
     *
     * @example
     *
     * // This example produces state like
     * // {
     * //     "proj/repo/2": true,
     * //     "proj/repo/4": false,
     * // }
     *
     * // Use a PR's ID as the key, and don't reduce any actions that are missing a PR
     * const reduceByPullRequest = multiKeyedReducer(({ pullRequest: pr }) => isPr(pr) ? prId(pr) : null);
     *
     * // Use the MERGE_CHECK action's payload as the value for each key
     * const mergeabilityByPrReducer = reduceByPullRequest((state, { type, payload: canMerge }) =>
     *     type === MERGE_CHECK
     *         ? !!canMerge
     *         : state
     * );
     *
     * mergeabilityByPrReducer(undefined, { type: 'UNKNOWN' })
     * // returns {}
     *
     * mergeabilityByPrReducer(undefined, { pullRequest: myPR })
     * // returns { myPrID: undefined }
     *
     * mergeabilityByPrReducer({ myPrID: false }, { pullRequest: myPR })
     * // returns { myPrID: false }
     *
     * mergeabilityByPrReducer(undefined, { pullRequest: yourPR, payload: true, type: MERGE_CHECK })
     * // returns { yourPrID: true }
     */
    var multiKeyedReducer = exports.multiKeyedReducer = function multiKeyedReducer(keyGetter) {
        return function (reducer) {
            return function () {
                var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _icepick.freeze)({});
                var action = arguments[1];
                var context = arguments[2];

                var key = keyGetter(action);
                if (key == null) {
                    return state;
                }
                return (0, _icepick.set)(state, key, reducer(state[key], action, context));
            };
        };
    };

    /**
     * Like multiKeyedReducer, but store only the latest version of the state. If the key changes, any existing state
     * under a different key is removed.
     * @param {function} keyFn - function that takes an action and returns a key to reduce under
     * @returns {function(reducer): reducer}
     *
     * @example
     *
     * // Use the latest commit on a branch as the key, and don't reduce actions without a latest commit
     * const reduceByHeadCommit = singleKeyedReducer(({ branch }) => branch ? branch.latestCommit : null);
     *
     * // Use the BUILD_STATUS_LOADED payload
     * const branchBuildStatusReducer = reduceByHeadCommit((state, { type, payload: status }) =>
     *     type === BUILD_STATUS_LOADED
     *         ? status
     *         : state
     * );
     *
     * const badFoodBranch = { latestCommit: 'baddf00d' };
     *
     * branchBuildStatusReducer({ deadbeef: {} }, { branch: badFoodBranch })
     * // returns { baddf00d: undefined }
     *
     * branchBuildStatusReducer({ deadbeef: {} }, { branch: badFoodBranch, type: BUILD_STATUS_LOADED, payload: {} })
     * // returns { baddf00d: {} }
     */
    var singleKeyedReducer = exports.singleKeyedReducer = function singleKeyedReducer(keyFn) {
        return function (reducer) {
            return function () {
                var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var action = arguments[1];
                var context = arguments[2];

                var key = keyFn(action);
                if (key == null) {
                    return state;
                }
                if (key in state) {
                    return (0, _icepick.set)(state, key, reducer(state[key], action, context));
                }
                // if the key doesn't match, wipe the existing state
                return babelHelpers.defineProperty({}, key, reducer(undefined, action, context));
            };
        };
    };

    /**
     * A helper for reducing boolean states based on action type.
     *
     * @param {string | string[]} on - type strings whose action should set the state to `true`
     * @param {string | string[]} off - type strings whose action should set the state to `false`
     * @param {string | string[]} toggle - type strings whose action should toggle the state
     * @param {string | string[]} reset - type strings whose action should set the state to `initialValue`
     * @param {*} initialValue - starting value in state
     * @returns {reducer}
     *
     * @example
     *
     * const loadingReducer = toggleReducer({ on: LOADING, off: [LOADING_SUCCESS, LOADING_FAILURE]});
     *
     * loadingReducer(undefined, {}) // false
     * loadingReducer(true, {}) // true
     * loadingReducer(true, { type: LOADING_SUCCESS }) // false
     */
    var toggleReducer = exports.toggleReducer = function toggleReducer(_ref4) {
        var _ref4$on = _ref4.on,
            on = _ref4$on === undefined ? [] : _ref4$on,
            _ref4$off = _ref4.off,
            off = _ref4$off === undefined ? [] : _ref4$off,
            _ref4$toggle = _ref4.toggle,
            toggle = _ref4$toggle === undefined ? [] : _ref4$toggle,
            _ref4$reset = _ref4.reset,
            reset = _ref4$reset === undefined ? [] : _ref4$reset,
            _ref4$initialValue = _ref4.initialValue,
            initialValue = _ref4$initialValue === undefined ? false : _ref4$initialValue;

        var toggleReducers = new Map([[on, function () {
            return true;
        }], [off, function () {
            return false;
        }], [toggle, function (state) {
            return !state;
        }], [reset, function () {
            return initialValue;
        }]]);

        return reduceByTypes(initialValue, toggleReducers);
    };

    /**
     * Handle our standard entities section of a Redux reducer - state becomes an object where keys are
     * IDs and values are the entities themselves
     *
     * @param {string | string[]} loadPageSuccess - the action type(s) on which to add a page of entities to the state
     * @param {string | string[]} loadSingleSuccess - the action type(s) on which to add a single entity to the state
     * @param idField - a property name or entity => string function to get a key for the entity
     * @returns {reducer}
     *
     * @example
     *
     * const thingsReducer = entitiesReducer({ loadPageSuccess: LOAD_SUCCESS }, 'key');
     *
     * const things = [
     *     {
     *         key: 'red',
     *         stuff: 42,
     *     },
     *     {
     *         key: 'butterfly'
     *     }
     * ];
     *
     * thingsReducer(undefined, { type: LOAD_SUCCESS, payload: { values: things } })
     * // returns {
     * //     red: { key: 'red', stuff: 42 },
     * //     butterfly: { key: 'butterfly' },
     * // }
     */
    var entitiesReducer = exports.entitiesReducer = function entitiesReducer(_ref5, idField) {
        var _ref5$loadPageSuccess = _ref5.loadPageSuccess,
            loadPageSuccess = _ref5$loadPageSuccess === undefined ? [] : _ref5$loadPageSuccess,
            _ref5$loadSingleSucce = _ref5.loadSingleSuccess,
            loadSingleSuccess = _ref5$loadSingleSucce === undefined ? [] : _ref5$loadSingleSucce;

        var id = (0, _getId.getIdString)(idField);

        var entitiesReducers = new Map([[loadPageSuccess, function (state, _ref6) {
            var page = _ref6.payload;
            return (0, _icepick.merge)(state, page.values.reduce(function (newEntities, entity) {
                newEntities[id(entity)] = entity;
                return newEntities;
            }, {}), preserveEqualArrays);
        }], [loadSingleSuccess, function (state, _ref7) {
            var entity = _ref7.payload;
            return (0, _icepick.merge)(state, babelHelpers.defineProperty({}, id(entity), entity), preserveEqualArrays);
        }]]);

        return reduceByTypes({}, entitiesReducers);
    };

    /**
     * Handle our standard paging section of a Redux reducer - state becomes an object with an array of ids and lastPageMeta
     * info.
     * @param {string | string[]} loadPageSuccess - the action type(s) on which to add a page of ids to the state
     * @param {string | function} idField - a property name or entity => string function to get a key for the entity
     * @param {boolean} append - whether to append to the existing ids or overwrite them
     * @returns {reducer}
     *
     * @example
     *
     * const thingsReducer = pagingReducer(LOAD_SUCCESS, 'key');
     *
     * const things = [
     *     {
     *         key: 'red',
     *         stuff: 42,
     *     },
     *     {
     *         key: 'butterfly'
     *     }
     * ];
     *
     * thingsReducer(undefined, { type: LOAD_SUCCESS, payload: { values: things, anythingElse: 42 } })
     * // returns
     * // {
     * //     ids: ['red', 'butterfly'],
     * //     lastPageMeta: { anythingElse: 42 }
     * // }
     */
    var pagingReducer = exports.pagingReducer = function pagingReducer() {
        var loadPageSuccess = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var idField = arguments[1];
        var append = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        var id = (0, _getId.getIdString)(idField);

        var pagingReducers = new Map([[loadPageSuccess, function (state, _ref8) {
            var page = _ref8.payload;
            return (0, _icepick.merge)(state, {
                lastPageMeta: (0, _lodash.omit)(page, 'values'),
                ids: page.values.map(id)
            }, append ? preserveEquivalentArraysUnion : preserveEqualArrays);
        }]]);

        return reduceByTypes({}, pagingReducers);
    };

    /**
     * Handle a list of error messages on failure and reset them on success. Expects the action shapes from
     * rest-actor.js::restActorForType (e.g. a failure has `payload.response.errors`)
     *
     * @param {*} initialValue - whatever the default state should be (you might want this to be null or an empty array)
     * @param {string | string[]} successAction - the action that will reset to the default state
     * @param {string | string[]} failureAction - the action which will have a payload response with errors
     * @returns {reducer}
     *
     * @example
     *
     * const reducer = errorsReducer([], SUCCESS, FAILURE);
     *
     * reducer('blah', { type: SUCCESS }) // returns []
     *
     * const response = { errors: [{ message: 'Only time can heal what reason cannot.' }] }
     *
     * reducer('blah', { type: FAILURE, payload: { response } })
     * // returns [{ message: 'Only time can heal what reason cannot.' }]
     */
    var errorsReducer = exports.errorsReducer = function errorsReducer(initialValue) {
        var successAction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var failureAction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        var errorsReducers = new Map([[successAction, function () {
            return initialValue;
        }], [failureAction, function (state, _ref9) {
            var response = _ref9.payload.response;
            return response && response.errors || [{ message: 'An unknown error occurred.' }];
        }]]);

        return reduceByTypes(initialValue, errorsReducers);
    };
});