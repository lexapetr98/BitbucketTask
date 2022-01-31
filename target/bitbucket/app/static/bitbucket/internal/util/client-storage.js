define('bitbucket/internal/util/client-storage', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/feature-detect'], function (module, exports, _jquery, _lodash, _pageState, _featureDetect) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    /**
     * Types of storage.
     * @readonly
     * @enum {string}
     */
    var storageType = {
        SESSION: 'session',
        LOCAL: 'local'
    };

    var contexts = {
        PULL_REQUEST: 'pull-request',
        REPO: 'repo',
        PROJECT: 'project',
        USER: 'user'
    };
    var contextsOrder = [contexts.PULL_REQUEST, contexts.REPO, contexts.PROJECT, contexts.USER];

    var FLASH_PREFIX = '_flash.';

    var componentDelimiter = '_';
    var cleanupKey = 'lastCleanup';
    var hasCheckedCleanUpKey = 'hasCheckedCleanUp';
    var oneWeek = 1000 * 60 * 60 * 24 * 7;
    var fourWeeks = 4 * oneWeek;

    var dummy = {};
    // Visible for testing
    function _resetDummy() {
        dummy = {};
    }

    /**
     * Build a key for use in client storage
     * @param {string[]|string} components a string or array of strings to build into a key for client storage.
     * @param {string} [context] One of 'pull-request', 'repo', 'project', or 'user' for scoping the key. Each is progressively more weakly scoped than the previous.
     * @return {string} key
     */
    function buildKey(components, context) {
        if (_lodash2.default.isString(components)) {
            components = [components];
        }

        if (!_lodash2.default.isArray(components)) {
            throw new Error('keyBuilder requires an array of components');
        }

        if (context) {
            // Add the context to the key
            components.push(context);

            // This switch falls through each level adding progressively more detail the higher up you start
            // e.g. the user context just adds the current user's username,
            // but `pull-request` adds the pull request id, the repo slug, the project key and the current username
            // This may need refactoring if we introduce new contexts that don't fit into this waterfall.
            switch (context) {
                case contexts.PULL_REQUEST:
                    components.push(_pageState2.default.getPullRequest() && _pageState2.default.getPullRequest().getId());
                /* falls through */
                case contexts.REPO:
                    components.push(_pageState2.default.getRepository() && _pageState2.default.getRepository().getSlug());
                /* falls through */
                case contexts.PROJECT:
                    components.push(_pageState2.default.getProject() && _pageState2.default.getProject().getKey());
                /* falls through */
                case contexts.USER:
                    components.push(_pageState2.default.getCurrentUser() && _pageState2.default.getCurrentUser().getName());
                    break;
            }
        }

        return components.join(componentDelimiter);
    }

    /**
     * Get an item directly from client storage, without the clientStorage wrapping/unwrapping being applied.
     * The item will be JSON.parse'd if appropriate.
     * @param {string} key the identifier of the item to retrieve from storage
     * @param {string} [type='local'] one of 'local' or 'session' to get the value from.
     * @return {*}
     */
    function getRawItem(key, type) {
        //Get the entire JSON object from localStorage.
        //Use if you want to access the metadata of an entry
        var rawItem = void 0;
        var item = void 0;

        if (_featureDetect2.default.localStorage()) {
            rawItem = window[(type || storageType.LOCAL) + 'Storage'].getItem(key);
        } else {
            rawItem = _lodash2.default.has(dummy, key) ? dummy[key] : null;
        }

        try {
            item = JSON.parse(rawItem);
        } catch (exception) {
            item = rawItem;
        }

        return item;
    }

    /**
     * Get an item from client storage, invoking JSON and clientStorage-specific unwrapping transforms on it.
     * @param {string} key the identifier of the item to retrieve from storage
     * @param {string} [type='local'] one of 'local' or 'session' to get the value from.
     * @return {*}
     */
    function getItem(key, type) {
        //Return the `data` attribute of the JSON object stored in localStorage, or the raw value if it's not wrapped in a object.
        //`type` is LOCAL by default
        var item = getRawItem(key, type);
        return _jquery2.default.isPlainObject(item) && _lodash2.default.has(item, 'data') ? item.data : item;
    }

    /**
     * If the item is not present in the current context, attempt to retrieve it from higher level contexts (up to the user).
     * @param {string} keyPrefix the identifier for this item in storage
     * @param {string} context the starting context
     * @param {string} [type='local'] one of 'local' or 'session' to set the value in.
     */
    function getItemProgressively(keyPrefix, context, type) {
        if (!context || !_lodash2.default.includes(contextsOrder, context)) {
            throw new Error('getItemProgressively requires a context to be specified');
        }

        var key = buildKey(keyPrefix, context);
        if (context === 'user') {
            return getItem(key, type);
        }

        context = contextsOrder[contextsOrder.indexOf(context) + 1];
        return getItem(key, type) || getItemProgressively(keyPrefix, context, type);
    }

    /**
     * Get an item from sessionStorage, invoking JSON and clientStorage-specific unwrapping transforms on it.
     * @param {string} key the identifier of the item to retrieve from storage
     * @return {*}
     */
    function getSessionItem(key) {
        return getItem(key, storageType.SESSION);
    }

    /**
     * Get a flash item (from sessionStorage), invoking JSON and clientStorage-specific unwrapping transforms on it.
     * The item will be removed from storage and won't be available when next requested.
     * @param {string} key the identifier of the item to retrieve from storage
     * @return {*}
     */
    function getFlashItem(key) {
        var val = getItem(FLASH_PREFIX + key, storageType.SESSION);
        removeFlashItem(key);
        return val;
    }

    /**
     * Set an item in client storage, invoking only a JSON.stringify transform on it.
     * @param {string} key the identifier for this item in storage
     * @param {*} obj the object to store. Note that circular references within the object, or DOM objects will cause this method to throw errors.
     * @param {string} [type='local'] one of 'local' or 'session' to set the value in.
     */
    function setRawItem(key, obj, type) {
        //Save the object as is to client storage, don't add meta data
        if (_featureDetect2.default.localStorage()) {
            try {
                window[(type || storageType.LOCAL) + 'Storage'].setItem(key, JSON.stringify(obj));
            } catch (e) {
                if (e.code === 22 || e.code === 1014) {
                    // 22 - the correct code most browsers use
                    // 1014 - Firefox's code
                    console.warn('WARN: Ran out of space in localStorage');
                    if (doCleanup()) {
                        setRawItem(key, obj, type);
                    }
                } else {
                    throw e;
                }
            }
        } else {
            dummy[key] = JSON.stringify(obj);
        }
    }

    /**
     * Set an item in client storage, invoking JSON and clientStorage-specific wrapping transforms on it.
     * @param {string} key the identifier for this item in storage
     * @param {*} obj the object to store. Note that circular references within the object, or DOM objects will cause this method to throw errors.
     * @param {Object} [extraProperties] Extra metadata to store about the object that will not be returned with it.
     * @param {boolean} [extraProperties.noCleanup] If specified as true, this object will not be cleaned up after a month.
     * @param {string} [type='local'] one of 'local' or 'session' to set the value in.
     */
    function setItem(key, obj, extraProperties, type) {
        //Don't allow extraProperties to overwrite the core attributes, `data` and `timestamp`;
        //Currently the only useful extraProperty is Boolean `noCleanup`
        //`type` is LOCAL by default
        var item = _lodash2.default.assign({}, extraProperties, {
            timestamp: new Date().getTime(),
            data: obj
        });

        setRawItem(key, item, type);

        if (!type || type === storageType.LOCAL) {
            //Defer cleanup task until after the calling code has finished executing
            _lodash2.default.defer(checkCleanup);
        }
    }

    /**
     * Set an item in the provided context and higher level contexts up to the user context. Does not override existing values in higher level contexts.
     * @param {string} keyPrefix the identifier for this item in storage
     * @param {string} context the starting (most specific) context for an item
     * @param {*} obj the object to store. Note that circular references within the object, or DOM objects will cause this method to throw errors.
     */
    function setItemProgressively(keyPrefix, context, obj) {
        if (!context || !_lodash2.default.includes(contextsOrder, context)) {
            throw new Error('setItemProgressively requires a context to be specified');
        }

        contextsOrder.slice(contextsOrder.indexOf(context)).forEach(function (context) {
            setItem(buildKey(keyPrefix, context), obj);
        });
    }

    /**
     * Set an item in sessionStorage, invoking JSON and clientStorage-specific wrapping transforms on it.
     * @param {string} key the identifier for this item in storage
     * @param {*} obj the object to store. Note that circular references within the object, or DOM objects will cause this method to throw errors.
     * @param {Object} [extraProperties] Extra metadata to store about the object that will not be returned with it.
     * @param {boolean} [extraProperties.noCleanup] If specified as true, this object will not be cleaned up after a month. This is not very useful for session storage.
     */
    function setSessionItem(key, obj, extraProperties) {
        setItem.call(this, key, obj, extraProperties, storageType.SESSION);
    }

    /**
     * Set a flash item's value (in sessionStorage), invoking JSON and clientStorage-specific wrapping transforms on it.
     * @param {string} key the identifier for this item in storage
     * @param {*} obj the object to store. Note that circular references within the object, or DOM objects will cause this method to throw errors.
     * @param {Object} [extraProperties] Extra metadata to store about the object that will not be returned with it.
     * @param {boolean} [extraProperties.noCleanup] If specified as true, this object will not be cleaned up after a month. This is not very useful for flash storage.
     */
    function setFlashItem(key, obj, extraProperties) {
        setItem.call(this, FLASH_PREFIX + key, obj, extraProperties, storageType.SESSION);
    }

    /**
     * Remove an item from client storage.
     * @param {string} key the identifier for which item to remove
     * @param {string} [type='local'] one of 'local' or 'session' to remove the value from
     */
    function removeItem(key, type) {
        if (_featureDetect2.default.localStorage()) {
            window[(type || storageType.LOCAL) + 'Storage'].removeItem(key);
        } else {
            delete dummy[key];
        }
    }

    /**
     * Remove an item from sessionStorage.
     * @param {string} key the identifier for which item to remove
     */
    function removeSessionItem(key) {
        removeItem(key, storageType.SESSION);
    }

    /**
     * Remove a flash item (from sessionStorage).
     * @param {string} key the identifier for which item to remove
     */
    function removeFlashItem(key) {
        removeItem(FLASH_PREFIX + key, storageType.SESSION);
    }

    function checkCleanup() {
        if (getRawItem(hasCheckedCleanUpKey, storageType.SESSION)) {
            //Short circuit if we have already checked for cleanup this page/session
            return;
        }

        var lastCleanup = getRawItem(cleanupKey);

        if (!lastCleanup || new Date().getTime() - lastCleanup > fourWeeks) {
            doCleanup();
        }

        setRawItem(hasCheckedCleanUpKey, true, storageType.SESSION); //Prevent reruns of the cleanup check for the life of this session
    }

    function doCleanup(minAge) {
        minAge = minAge || fourWeeks;
        var currTime = new Date().getTime();
        var numKeysBefore = Object.keys(localStorage).length;
        Object.keys(localStorage).forEach(function (key) {
            if (key !== cleanupKey) {
                //don't cleanup the cleanup tracker
                var item = getRawItem(key);
                if (item && item.timestamp && !item.noCleanup && currTime - item.timestamp > minAge) {
                    removeItem(key);
                }
            }
        });
        setRawItem(cleanupKey, new Date().getTime());
        var itemsRemoved = numKeysBefore - Object.keys(localStorage).length;
        if (!itemsRemoved && minAge - oneWeek >= oneWeek) {
            return doCleanup(minAge - oneWeek);
        }
        return itemsRemoved;
    }

    exports.default = {
        _doCleanup: doCleanup,
        LOCAL: storageType.LOCAL,
        SESSION: storageType.SESSION,
        _resetDummy: _resetDummy,
        buildKey: buildKey,
        contexts: contexts,
        getItem: getItem,
        getItemProgressively: getItemProgressively,
        getFlashItem: getFlashItem,
        getSessionItem: getSessionItem,
        setItem: setItem,
        setItemProgressively: setItemProgressively,
        setFlashItem: setFlashItem,
        setSessionItem: setSessionItem,
        removeItem: removeItem,
        removeFlashItem: removeFlashItem,
        removeSessionItem: removeSessionItem
    };
    module.exports = exports['default'];
});