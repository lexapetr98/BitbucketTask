define('bitbucket/internal/test/waiter', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/promise'], function (module, exports, _jquery, _lodash, _promise) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _promise2 = babelHelpers.interopRequireDefault(_promise);

    /**
     * This function creates a Waiter object that can be used for async testing and wait on conditions.
     *
     * Example usage:
     * <code>
     *     var watier = testHelper.createWaiter(assert);
     *     var $fruit = $('.fruit');
     *
     *     $fruit.click();
     *
     *     waiter.waitFor({
     *         predicate: $fruit.is.bind($fruit, '.an-apple'),
     *         message: 'Fruit element should become an apple'
     *     }).then(function() {
     *         // assert things about the current state
     *         $fruit.click();
     *     }).then(waiter.thenWaitFor({
     *         predicate: $fruit.is.bind($fruit, '.an-orange'),
     *         message: 'Fruit element should become an orange'
     *     })).then(function() {
     *         //assert other things about the current state
     *     }).always(waiter.resume);
     * </code>
     *
     * You must make sure that waiter.resume is always called at the end of your chain so QUnit will resume.
     *
     * @param {QUnit.assert} assert - The qunit assert object.
     */
    function createWaiter(assert) {
        var resume = assert.async();

        /**
         *
         * @param {object}       opts
         * @param {string}       opts.message         - The message to show if the predicate does not satisfy.
         * @param {function}     opts.predicate       - Function which return truthy if wait should be ended
         * @param {number}       [opts.initialWait=0] - Time to wait before checking the predicate for the first time.
         * @param {number}       [opts.interval=100]
         * @param {number}       [opts.timeout=10000]
         * @returns {Promise}
         */
        function waitFor(opts) {
            var initialWaitP = _jquery2.default.Deferred();
            if (opts.initialWait) {
                setTimeout(initialWaitP.resolve.bind(initialWaitP), opts.initialWait);
            } else {
                initialWaitP.resolve();
            }

            return initialWaitP.promise().then(_promise2.default.waitFor.bind(_promise2.default, _lodash2.default.pick(opts, ['predicate', 'timeout', 'interval']))).then(assert.ok.bind(assert, true, opts.message)).fail(assert.ok.bind(assert, false, opts.message));
        }

        return {
            waitFor: waitFor,
            thenWaitFor: function thenWaitFor(opts) {
                return waitFor.bind(null, opts);
            },
            resume: resume
        };
    }

    exports.default = createWaiter;
    module.exports = exports['default'];
});