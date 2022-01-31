define('bitbucket/internal/model/diff-type', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var DiffType = {
        EFFECTIVE: 'EFFECTIVE',
        RANGE: 'RANGE',
        COMMIT: 'COMMIT'
    };
    var EFFECTIVE = DiffType.EFFECTIVE,
        RANGE = DiffType.RANGE,
        COMMIT = DiffType.COMMIT;
    exports.default = DiffType;
    exports.EFFECTIVE = EFFECTIVE;
    exports.RANGE = RANGE;
    exports.COMMIT = COMMIT;
});