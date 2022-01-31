'use strict';

require('bitbucket/feature/files/file-handlers').register({
    weight: 5000,
    builtIn: true,
    handle: function handle(options) {
        var diffHandler = require('bitbucket/internal/feature/file-content/handlers/diff-handler');
        return diffHandler.handler.apply(this, arguments);
    }
});