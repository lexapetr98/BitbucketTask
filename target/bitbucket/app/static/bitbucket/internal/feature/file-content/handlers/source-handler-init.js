'use strict';

(function () {
    var fileHandlerApi = require('bitbucket/feature/files/file-handlers');

    function registerType(weight, handleProp) {
        fileHandlerApi.register({
            weight: weight,
            extraClasses: 'source-file-content',
            builtIn: true,
            handle: function handle(options) {
                return require('bitbucket/internal/feature/file-content/handlers/source-handler')[handleProp](options);
            }
        });
    }

    registerType(9000, 'handleDirectory');
    registerType(10000, 'handleImage');
    registerType(10300, 'handleBinary');
    registerType(10700, 'handleEmptyFile');
    registerType(11000, 'handleText');
})();