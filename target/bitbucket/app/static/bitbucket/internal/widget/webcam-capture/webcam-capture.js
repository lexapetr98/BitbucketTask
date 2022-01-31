define('bitbucket/internal/widget/webcam-capture/webcam-capture', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/feature/moustash/moustash', 'bitbucket/internal/util/feature-detect', 'bitbucket/internal/util/user-media'], function (module, exports, _aui, _jquery, _lodash, _moustash, _featureDetect, _userMedia) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _moustash2 = babelHelpers.interopRequireDefault(_moustash);

    var _featureDetect2 = babelHelpers.interopRequireDefault(_featureDetect);

    var _userMedia2 = babelHelpers.interopRequireDefault(_userMedia);

    /**
     * This widget creates a webcam video stream and takes a photo. Has the ability to add a moustache disguise to
     * captured photo.
     *
     * @param {jQuery} $container   - webcam capture element
     * @param {Object} opts         - options
     *
     * @constructor
     */
    function WebcamCapture($container, opts) {
        _lodash2.default.bindAll(this, 'start', '_setVideoSize', '_capture', '_takePhoto', '_onKeypress', '_onTakePhotoClicked', '_onUserMediaSuccess', '_onUserMediaError');
        this.opts = _lodash2.default.assign({}, WebcamCapture.defaults, opts);

        this.$container = $container;
        this.video = $container.find('video')[0];
        this.$takePhoto = $container.find('.take-photo');
        this.$countdown = $container.find('.countdown');
        this.$videoPlaceholder = $container.find('.video-placeholder');

        this.width = this.opts.width;
        this.snapSound = new Audio();

        (0, _jquery2.default)(this.video).toggleClass('mirror', this.opts.mirror).on('canplay', this._setVideoSize);

        this.$takePhoto.on('click', this._onTakePhotoClicked).tooltip({
            gravity: 'w',
            fade: true
        });
        this.$container.find('.retry-webcam').on('click', function () {
            this.$container.find('.no-access').addClass('hidden');
            this.$container.find('.grant-access').removeClass('hidden');
            setTimeout(this.start, 50); // Chrome will instantly error out if access is still denied so we want to at least flash it
            return false;
        }.bind(this));
    }

    /**
     * Check if the browser supports API's required to stream webcam
     * @return {boolean}
     */
    WebcamCapture.isSupported = _lodash2.default.once(function () {
        return _featureDetect2.default.getUserMedia() && _featureDetect2.default.video();
    });

    /**
     * Default options
     * @property {boolean} countdown    - use a 3s 3-2-1 countdown before taking the photo
     * @property {boolean} mirror       - video stream orientation will be mirrored
     * @property {boolean} width        - px width of the photo image
     * @property {Function} onCapture   - function to be called when a photo is taken
     */
    WebcamCapture.defaults = {
        countdown: false,
        mirror: true,
        width: 640,
        onCapture: _jquery2.default.noop
    };

    /**
     * Request access to webcam. On success, begin webcam video stream. On error, update with error message
     */
    WebcamCapture.prototype.start = function () {
        // audio src needs to be reset each time
        this.snapSound.src = _aui2.default.contextPath() + '/s/1/_/download/resources/com.atlassian.bitbucket.server.bitbucket-web:webcam-capture/camera-snap.wav';

        if (!this.stream) {
            (0, _userMedia2.default)({
                video: true,
                audio: false
            }, this._onUserMediaSuccess, this._onUserMediaError);
        } else {
            this.video.play();
            this.isStreaming = true;
            this.$takePhoto.focus();
        }
    };

    /**
     * Pause the video stream
     */
    WebcamCapture.prototype.pause = function () {
        if (this.isStreaming) {
            this.video.pause();
            this.isStreaming = false;
        }
    };

    /**
     * Stop the webcam stream and the connection to the webcam
     */
    WebcamCapture.prototype.stop = function () {
        if (this.stream) {
            this.pause();
            this.video.src = '';
            this.stream.getTracks().forEach(function (track) {
                return track.stop();
            });
            this.stream = null;
            (0, _jquery2.default)(document).off('keypress', this._onKeypress);
        }

        this.$takePhoto.tipsy('hide');
        this.$container.removeClass('streaming');
    };

    WebcamCapture.prototype._onUserMediaSuccess = function (stream) {
        this.stream = stream;
        this.video.src = window.URL.createObjectURL(stream);
        this.video.play();
        this.isStreaming = true;

        _moustash2.default.loadResources();

        this.$container.addClass('streaming');
        this.$takePhoto.focus();
        (0, _jquery2.default)(document).on('keypress', this._onKeypress);
    };

    WebcamCapture.prototype._onUserMediaError = function () {
        this.$videoPlaceholder.find('.no-access').removeClass('hidden');
        this.$videoPlaceholder.find('.grant-access').addClass('hidden');
    };

    WebcamCapture.prototype._onKeypress = function (e) {
        if (String.fromCharCode(e.which).toLowerCase() === 'm') {
            this._takePhoto(true);
        }
    };

    WebcamCapture.prototype._onTakePhotoClicked = function () {
        this._takePhoto(false);
    };

    WebcamCapture.prototype._takePhoto = function (addDisguise) {
        var self = this;
        if (this.isStreaming && !this.$takePhoto.is(':disabled')) {
            if (this.opts.countdown) {
                this.$takePhoto.prop('disabled', true);
                this._doCountdown().always(function () {
                    self.$takePhoto.prop('disabled', false);
                    self.$countdown.addClass('hidden');
                }).done(function () {
                    self._capture(addDisguise);
                });
            } else {
                this._capture(addDisguise);
            }
        }
    };

    /**
     * Set video height and width attributes based on stream video aspect ratio
     * @private
     */
    WebcamCapture.prototype._setVideoSize = function () {
        this.height = this.video.videoWidth ? this.video.videoHeight / (this.video.videoWidth / this.width) : this.width * (240 / 320); // most webcam videos are 320x240 ratio
        this.video.setAttribute('width', this.width);
        this.video.setAttribute('height', this.height);
    };

    /**
     * Show countdown then capture webcam snapshot
     * @return {Promise}    A promise resolved when countdown has completed and rejected if the video stops streaming
     * @private
     */
    WebcamCapture.prototype._doCountdown = function () {
        var self = this;
        var count = 3;
        var promise = _jquery2.default.Deferred();
        this.$countdown.removeClass('hidden');

        function countdownStep() {
            if (self.isStreaming) {
                if (count) {
                    self.$countdown.text(count--);
                    setTimeout(countdownStep, 1000);
                } else {
                    promise.resolve();
                }
            } else {
                promise.reject();
            }
        }

        countdownStep();

        return promise;
    };

    /**
     * Capture a snapshot from the webcam stream. Calls the onCapture callback
     * @private
     */
    WebcamCapture.prototype._capture = function (addDisguise) {
        /* Firefox does not have videoHeight set correctly on video canplay event so set it again just in case */
        this._setVideoSize();

        var canvas = (0, _jquery2.default)('<canvas/>').attr('width', this.width).attr('height', this.height)[0];
        var ctx = canvas.getContext('2d');

        this.snapSound.play();
        var $flasher = (0, _jquery2.default)('<div class="flasher"/>');
        _aui2.default.LayerManager.global.push($flasher);
        $flasher.on('animationend webkitAnimationEnd MSAnimationEnd oanimationend', function () {
            _aui2.default.LayerManager.global.popUntil($flasher);
            $flasher.remove();
        }).appendTo('body');

        ctx.drawImage(this.video, 0, 0, this.width, this.height);

        if (addDisguise && _moustash2.default.isReady()) {
            _moustash2.default.addToFaces(canvas);
        }

        if (this.opts.mirror) {
            canvas = this._mirrorCanvas(canvas);
        }

        var dataUrl = canvas.toDataURL('image/png');
        this.opts.onCapture(dataUrl);
        this.$takePhoto.tipsy('hide'); // tipsy does not hide if using keyboard shortcut so manually do it
    };

    WebcamCapture.prototype._mirrorCanvas = function (canvas) {
        // Needs to use a new canvas for mirroring because if moustashes are drawn, they will be incorrectly positioned
        var mirroredCanvas = (0, _jquery2.default)('<canvas/>').attr('width', this.width).attr('height', this.height)[0];

        var mirrorCtx = mirroredCanvas.getContext('2d');
        mirrorCtx.translate(this.width, 0);
        mirrorCtx.scale(-1, 1);
        mirrorCtx.drawImage(canvas, 0, 0);

        return mirroredCanvas;
    };

    exports.default = WebcamCapture;
    module.exports = exports['default'];
});