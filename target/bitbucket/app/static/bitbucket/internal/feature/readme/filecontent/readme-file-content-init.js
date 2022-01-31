'use strict';

require('bitbucket/feature/files/file-handlers').register({
    weight: 3000,
    handle: function handle(options) {
        return require('bitbucket/internal/feature/readme/filecontent/readme-file-content').apply(this, arguments);
    }
});