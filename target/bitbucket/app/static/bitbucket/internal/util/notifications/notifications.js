define('bitbucket/internal/util/notifications/notifications', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/client-storage'], function (module, exports, _aui, _jquery, _lodash, _clientStorage) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var STORAGE_KEY = 'page-load-notifications';
    var POLLING_STORAGE_KEY = STORAGE_KEY + '-polling-';

    function load() {
        var notifications = _clientStorage2.default.getFlashItem(STORAGE_KEY);
        _clientStorage2.default.removeFlashItem(STORAGE_KEY);
        return notifications;
    }

    function save(items) {
        if (items && items.length) {
            _clientStorage2.default.setFlashItem(STORAGE_KEY, items);
        } else {
            _clientStorage2.default.removeFlashItem(STORAGE_KEY);
        }
    }

    function getItem(key) {
        var value;
        var items = load();

        if (items && _lodash2.default.has(items, key)) {
            value = items[key];
            delete items[key];
        }
        save(items);
        return value || null;
    }

    /**
     * Add a notification to be displayed later. This is usually called right before a redirect.
     *
     * @param {string} title    the flag title to be displayed
     * @param {Object?} options any optional configurations:
     *                          body: if not specified no body is displayed
     *                          type: if not specified it defaults to 'success'
     *                          close: if not specified it defaults to 'auto'
     */
    function addFlash(title, options) {
        var items = load() || [];
        options = options || {};
        items.push({
            title: title,
            body: options.body,
            type: options.type || 'success',
            close: options.close || 'auto'
        });
        save(items);
    }

    /**
     * Show notification as soon as the document is ready
     *
     * @param {Object} contains options for creating an flag (see https://docs.atlassian.com/aui/latest/docs/flag.html)
     *                 title or body is required
     */
    function showOnReady(options) {
        if (options.title || options.body) {
            (0, _jquery2.default)(document).ready(function () {
                (0, _aui.flag)(options);
            });
        }
    }

    /**
     * Drain all stored notifications and attach them to the container.
     *
     * @param {HTMLElement|jQuery|String} container the container to attach the notifications to.
     * @param {String?} attachmentMethod jQuery method to call to attach the notification to the container.
     *                                   'html', 'append', 'prepend', 'before' and 'after' will all work.
     *                                   If not specified it defaults to 'append'
     */
    function showFlashes() {
        _lodash2.default.forEach(_drainNotifications(), function (notification) {
            (0, _aui.flag)(notification);
        });
    }

    var pollingNotificationNames = POLLING_STORAGE_KEY + 'names';
    var pollingNotificationNamesToDelete = Array.isArray(_clientStorage2.default.getItem(pollingNotificationNames)) && _clientStorage2.default.getItem(pollingNotificationNames) || [];

    function _clearPollingNotifications(notificationsToClear) {
        notificationsToClear.forEach(function (notificationName) {
            var key = POLLING_STORAGE_KEY + notificationName;
            _clientStorage2.default.removeItem(key);
        });
    }

    setTimeout(function () {
        _clearPollingNotifications(pollingNotificationNamesToDelete);
    }, 5000);

    function updatePollingNotificationNamesToDelete(notificationName) {
        var index = pollingNotificationNamesToDelete.indexOf(notificationName);
        if (index < 0) {
            pollingNotificationNamesToDelete.push(notificationName);
            _clientStorage2.default.setItem(pollingNotificationNames, pollingNotificationNamesToDelete);
        } else {
            pollingNotificationNamesToDelete.splice(index, 1);
        }
    }

    function trackedFlag(item, key) {
        item.body += bitbucket.internal.util.notifications.closePollingFlag();
        var myFlag = (0, _aui.flag)(item);
        (0, _jquery2.default)(myFlag).find('.close').on('click', function () {
            myFlag.close();
            item.closed = true;
            _clientStorage2.default.setItem(key, item);
        });
    }

    /**
     * An flag notification that will:
     * - keep appearing until the user clicks the close link
     * - respect being closed until the next occurrence after a clean page load
     *
     * @param {string} notificationName the key for local storage (gets prepended)
     * @param {Object} flagOptions object with the options for an flag (standard flag defaults apply)
     */
    function polling(notificationName, flagOptions) {
        updatePollingNotificationNamesToDelete(notificationName);

        var key = POLLING_STORAGE_KEY + notificationName;
        var item = _clientStorage2.default.getItem(key);

        if (!item) {
            item = _lodash2.default.assign(flagOptions, {
                closed: false
            });
            _clientStorage2.default.setItem(key, item);
        }
        if (!item.closed) {
            trackedFlag(item, key);
        }
    }

    /**
     * drain the currently stored notifications.
     * @private
     * @returns {Array<Object>} the notifications
     */
    function _drainNotifications() {
        return load();
    }

    exports.default = {
        addFlash: addFlash,
        showOnReady: showOnReady,
        showFlashes: showFlashes,
        _clearPollingNotifications: _clearPollingNotifications,
        polling: polling,
        _drainNotifications: _drainNotifications
    };
    module.exports = exports['default'];
});