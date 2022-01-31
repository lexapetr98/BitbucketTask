define('bitbucket/internal/util/redux', ['exports', 'redux'], function (exports, _redux) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.legacyCustomCreateStore = exports.createActorStore = exports.actorMiddleware = undefined;
    var actorMiddleware = exports.actorMiddleware = function actorMiddleware() {
        for (var _len = arguments.length, actors = Array(_len), _key = 0; _key < _len; _key++) {
            actors[_key] = arguments[_key];
        }

        return function (store) {
            return function (next) {
                return function (action) {
                    // actors are provided with a picture of the world before the action is applied
                    var preActionState = store.getState();

                    // release the action to reducers before firing additional actions
                    var result = next(action);

                    // if no previous state - use the current state;
                    var postActionState = store.getState();

                    // synchronously call actors
                    actors.forEach(function (actor) {
                        return actor(action, store.dispatch, preActionState, postActionState);
                    });

                    return result;
                };
            };
        };
    };

    var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || _redux.compose;

    /**
     * Create a Redux Store with optional actors applied.
     *
     * @param {Object} reducers - an object of reducers to combine and pass along to the store middleware
     * @param {*} initialState - the default state/data of the store.
     * @param {Function} [actors] - any actors to apply to the store
     * @returns {Redux.Store}
     */
    var createActorStore = exports.createActorStore = function createActorStore(reducers, initialState) {
        for (var _len2 = arguments.length, actors = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
            actors[_key2 - 2] = arguments[_key2];
        }

        return (0, _redux.createStore)((0, _redux.combineReducers)(reducers), initialState, composeEnhancers((0, _redux.applyMiddleware)(actorMiddleware.apply(undefined, actors))));
    };

    /**
     * Create a Redux Store with optional middleware applied.
     * Legacy use only, prefer createActorStore
     *
     * @param {Object} reducers - an object of reducers to combine and pass along to the store middleware
     * @param {*} initialState - the default state/data of the store.
     * @param {Function} [middleware] - any middleware to apply to the store
     * @deprecated Use createActorStore instead
     * @returns {Redux.Store}
     */
    var legacyCustomCreateStore = exports.legacyCustomCreateStore = function legacyCustomCreateStore(reducers, initialState) {
        for (var _len3 = arguments.length, middleware = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
            middleware[_key3 - 2] = arguments[_key3];
        }

        return (0, _redux.createStore)((0, _redux.combineReducers)(reducers), initialState, composeEnhancers(_redux.applyMiddleware.apply(undefined, middleware)));
    };
});