define('bitbucket/internal/feature/moustash/moustash', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash'], function (module, exports, _aui, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var ready = false;
    var moustashImg;
    var POSITIONING = {
        MIN_CANVAS_WIDTH: 0.1, // min face/canvas width
        M_F_WIDTH: 0.9, // moustash width as percentage of face width
        M_F_HEIGHT: 0.2, // moustash height as percentage of face height
        M_F_LEFT: 0.05, // moustash position from left of face as percentage of face width
        M_F_TOP: 0.675 // moustash position from top of face as percentage of face height
    };

    function _loadFaceDetectionResources() {
        var faceDetectionResourceKey = 'com.atlassian.bitbucket.server.bitbucket-web:face-detection';
        return WRM.require('wr!' + faceDetectionResourceKey);
    }

    function _loadMoustashImg() {
        var imgPromise = _jquery2.default.Deferred();
        moustashImg = new Image();
        moustashImg.onload = function () {
            imgPromise.resolve();
        };
        moustashImg.src = _aui2.default.contextPath() + '/s/1/_/download/resources/com.atlassian.bitbucket.server.bitbucket-web:moustash/moustash.png';
        return imgPromise;
    }

    function _loadResources() {
        return _jquery2.default.when(_loadFaceDetectionResources(), _loadMoustashImg()).done(function () {
            ready = true;
        });
    }

    function isReady() {
        return ready;
    }

    function addToFaces(canvas) {
        if (!isReady()) {
            throw new Error('Face-detection resources not loaded yet');
        }
        // pass null as second param to prevent the require from being extracted to the top level AMD module by the babel transform
        var ccv = require('lib/ccv/ccv', null);
        var faceCascade = require('lib/ccv/face-cascade', null);
        var faces = ccv.detect_objects({
            canvas: canvas,
            cascade: faceCascade,
            interval: 5,
            min_neighbors: 1
        });
        var ctx = canvas.getContext('2d');

        _lodash2.default.forEach(faces, _lodash2.default.bind(function (face) {
            if (face.width / canvas.width > POSITIONING.MIN_CANVAS_WIDTH) {
                var y = face.y + face.height * POSITIONING.M_F_TOP;
                var x = face.x + face.width * POSITIONING.M_F_LEFT;
                var width = face.width * POSITIONING.M_F_WIDTH;
                var height = face.height * POSITIONING.M_F_HEIGHT;

                ctx.drawImage(moustashImg, x, y, width, height);
            }
        }));
    }

    exports.default = {
        loadResources: _lodash2.default.once(_loadResources),
        isReady: isReady,
        addToFaces: addToFaces
    };
    module.exports = exports['default'];
});