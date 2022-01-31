define('bitbucket/util/scheduler', ['exports', 'jquery', 'lodash'], function (exports, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MINUTE = exports.SECOND = undefined;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    /**
     * @memberOf bitbucket/util/scheduler
     * @type {number}
     */
    /**
     * Provides a way of scheduling a job that can be backed off. A schedule can be configured
     * to automatically start backing off when the user blurs the application or is inactive.
     *
     * **Web Resource:** com.atlassian.bitbucket.server.bitbucket-web-api:scheduler
     *
     * @module bitbucket/util/scheduler
     * @namespace bitbucket/util/scheduler
     */
    var SECOND = exports.SECOND = 1000;

    /**
     * @memberOf bitbucket/util/scheduler
     * @type {number}
     */
    var MINUTE = exports.MINUTE = 60 * SECOND;

    /**
     * @type {number}
     * @private
     */
    var ACTIVITY_DEBOUNCE_TIME = 100;

    /**
     * The range of jitter we will add to each run
     * @type {{min: number, max: number}}
     * @private
     */
    var JITTER_RANGE = {
        min: 50,
        max: SECOND
    };

    /**
     * Provides a way of scheduling a job that can be backed off. A schedule can be configured
     * to automatically start backing off when the user blurs the application or is inactive.
     *
     * User activity means scrolling, mouse movement, and keyboard input.
     *
     * When a user becomes active again after being inactive for a specified period of time
     * (the `inactivityTime`) then the schedule will start up again after the given `immediateTime`.
     *
     * @example
     * // ES5
     *
     * define('bitbucket/plugin/my-plugin', [
     *     'bitbucket/util/scheduler'
     * ], function(
     *     Scheduler
     * ) {
     *     var schedule = new Scheduler({
     *         backoff: {
     *             onBlur: true,
     *             onInactive: true,
     *         },
     *         maxInterval: 10 * Scheduler.MINUTE,
     *         interval: 30 * Scheduler.SECOND,
     *         job: function() {
     *             return getSomeDataFromServer(arg1, arg2);
     *         }
     *     });
     *
     *     schedule.start();
     * });
     *
     * @example
     * // ES2015+
     *
     * import Schedule, { MINUTE, SECOND } from 'bitbucket/util/scheduler';
     *
     * const schedule = new Scheduler({
     *     backoff: {
     *         onBlur: true,
     *         onInactive: true,
     *     },
     *     maxInterval: 10 * MINUTE,
     *     interval: 30 * SECOND,
     *     job: () => getSomeDataFromServer(arg1, arg2),
     * });
     *
     * schedule.start();
     *
     *
     * @memberOf bitbucket/util/scheduler
     */

    var Scheduler = function () {
        /**
         * @callback Schedulerjob
         * The Scheduler's job should return a {Deferred}.
         * If the Deferred is abortable it will be aborted when the schedule is stopped.
         *
         * @memberOf bitbucket/util/scheduler.Scheduler
         * @returns {Deferred}
         */

        /**
         * Schedule a schedule
         * @param {Object} [schedule={@link bitbucket/util/scheduler.Scheduler.defaults Scheduler.defaults}] - the schedule
         * @param {Object} [schedule.backoff] - the backoff configuration
         * @param {boolean} [schedule.backoff.onBlur] - should back off on blur?
         * @param {boolean} [schedule.backoff.onInactive] - should back off on inactivity?
         * @param {boolean} [schedule.jitter] - when enabled a random range is added to the scheduler when it starts
         *                  to reduce the likelihood that clients will all reconnect at the same time after an outage.
         * @param {number} [schedule.interval] - how often to run the schedule
         * @param {number} [schedule.immediateTime] - how long to wait to run a schedule "immediately". This is a buffer time
         *                 taken to wait when starting the schedule
         * @param {number} [schedule.maxInterval] - the max time the schedule will back off to.
         * @param {number} [schedule.inactivityTime] - the time at which a user is considered inactive.
         * @param {Schedulerjob} schedule.job -  the function that will be invoked every time the schedule runs. The scheduler
         *                                       will wait for the job function's Deferred to settle before continuing.
         */
        function Scheduler() {
            var _this = this;

            var schedule = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            babelHelpers.classCallCheck(this, Scheduler);

            this.schedule = babelHelpers.extends({}, Scheduler.defaults, schedule);

            if (typeof schedule.job !== 'function') {
                throw new Error('A schedule\'s job must be a function.');
            }
            if (schedule.interval < 1) {
                throw new Error('A schedule\'s interval must be a positive number.');
            }

            this.currentInterval = this.schedule.interval;
            this._destroyables = [];
            this.lastActiveTime = Date.now();

            var throttledActivityHandler = (0, _lodash.debounce)(function () {
                var wasInactive = Date.now() - _this.lastActiveTime > _this.schedule.inactivityTime;
                if (wasInactive) {
                    _this.start(true);
                } else {
                    _this._setActiveTime();
                }
            }, ACTIVITY_DEBOUNCE_TIME);

            var blurHandler = function blurHandler() {
                return _this._setActiveTime();
            };

            var $window = (0, _jquery2.default)(window);
            var activityEvents = [];
            if (this.schedule.backoff.onBlur === true) {
                if (!document.hasFocus()) {
                    this.stop();
                }

                activityEvents.push('focus.scheduler');

                $window.on('blur.scheduler', blurHandler);
                this._destroyables.push(function () {
                    return $window.off('blur.scheduler', blurHandler);
                });
            }

            if (this.schedule.backoff.onInactive === true) {
                activityEvents.push('mousemove.scheduler', 'keydown.scheduler', 'scroll.scheduler');
            }

            $window.on(activityEvents.join(' '), throttledActivityHandler);
            this._destroyables.push(function () {
                return $window.off(activityEvents.join(' '), throttledActivityHandler);
            });
        }

        /**
         * Set the last active time to now.
         * @private
         */


        babelHelpers.createClass(Scheduler, [{
            key: '_setActiveTime',
            value: function _setActiveTime() {
                this.lastActiveTime = Date.now();
            }
        }, {
            key: '_getJitter',
            value: function _getJitter() {
                var jitter = this.schedule.jitter;

                if (!jitter) {
                    return 0;
                }
                var diff = JITTER_RANGE.max - JITTER_RANGE.min;
                return Math.floor(JITTER_RANGE.min + diff * Math.random());
            }
        }, {
            key: 'getBackoffTime',
            value: function getBackoffTime() {
                var lastActiveDiff = Date.now() - this.lastActiveTime;
                // if the time since last active is more than 2 intervals ago then double the interval or limit to max interval
                if (lastActiveDiff >= Math.max(this.currentInterval, this.schedule.interval * 2)) {
                    return Math.min(this.currentInterval * 2, this.schedule.maxInterval);
                }
                return this.schedule.interval;
            }
        }, {
            key: 'run',
            value: function run() {
                var _this2 = this;

                var immediate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                var jitterAmount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

                if (!this.running || this._destroyed) {
                    return;
                }
                this.currentInterval = this.getBackoffTime();
                var timeout = immediate ? this.schedule.immediateTime : this.currentInterval;
                timeout += jitterAmount;
                this.runTimer = setTimeout(function () {
                    _this2.jobDeferred = _this2.schedule.job();
                    _this2.jobDeferred.always(function () {
                        if (_this2.running) {
                            _this2.run();
                        }
                    });
                }, timeout);
            }
        }, {
            key: 'stop',
            value: function stop() {
                // if a previous deferred is still unresolved and is abortable, do so now to avoid re-requesting
                if (this.jobDeferred && this.jobDeferred.abort) {
                    this.jobDeferred.abort();
                    this.jobDeferred = null;
                }
                clearTimeout(this.runTimer);
                this.running = false;
            }
        }, {
            key: 'start',
            value: function start(immediate) {
                this.stop(); // make sure there aren't rogue deferreds/timers - always stop before starting
                this._setActiveTime();
                this.running = true;
                this._currentJitter = this._getJitter();
                this.run(immediate, this._currentJitter);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.stop();
                this._destroyables.forEach(function (fn) {
                    return fn();
                });
                this._destroyed = true;
            }
        }]);
        return Scheduler;
    }();

    /**
     * @type {Object}
     * @property {Object} [backoff] - the backoff configuration
     * @property {boolean} [backoff.onBlur=true] - should back off on blur?
     * @property {boolean} [backoff.onInactive=true] - should back off on inactivity?
     * @property {boolean} [jitter=true] - when enabled a random range is added to the scheduler when it starts
     *                     to reduce the likelihood that clients will all reconnect at the same time after an outage.
     * @property {number} [interval={@link bitbucket/util/scheduler.exports.SECOND 10 * SECOND}] - how often to run the schedule (milliseconds)
     * @property {number} [immediateTime={@link bitbucket/util/scheduler.exports.SECOND SECOND}] - how long to wait to run a schedule "immediately".
     *                    This is a buffer time taken to wait when starting the schedule (milliseconds).
     * @property {number} [maxInterval={@link bitbucket/util/scheduler.exports.MINUTE 5 * MINUTE}] - the max time the schedule will back off to. (milliseconds)
     * @property {number} [inactivityTime={@link bitbucket/util/scheduler.exports.MINUTE 2 * MINUTE}] - the time at which a user is considered inactive. (milliseconds)
     */
    Scheduler.defaults = {
        immediateTime: SECOND,
        backoff: {
            onBlur: true,
            onInactive: true
        },
        jitter: true,
        interval: 10 * SECOND,
        maxInterval: 5 * MINUTE,
        inactivityTime: 2 * MINUTE
    };

    exports.default = Scheduler;
});