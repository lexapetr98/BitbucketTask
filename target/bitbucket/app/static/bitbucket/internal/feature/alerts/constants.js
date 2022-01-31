define('bitbucket/internal/feature/alerts/constants', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * @enum AlertType
     * @type {Object<string>}
     */
    var AlertType = exports.AlertType = {
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info',
        SUCCESS: 'success'
    };

    // The array order also defines the sort order in the UI
    var TYPES = exports.TYPES = [AlertType.ERROR, AlertType.WARNING, AlertType.INFO, AlertType.SUCCESS];
});