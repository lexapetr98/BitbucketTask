define("bitbucket/internal/util/user-media", ["module", "exports"], function (module, exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    exports.default = getUserMedia ? getUserMedia.bind(navigator) : undefined;
    module.exports = exports["default"];
});