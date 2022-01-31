define('bitbucket/internal/widget/button-trigger/button-trigger', ['module', 'exports', 'jquery', 'lodash'], function (module, exports, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var defaults = {
        triggerEvent: 'click',
        stopEvent: true,
        triggerHandler: function triggerHandler(value, event) {
            throw new Error('triggerHandler must be implemented');
        }
    };

    function ButtonTrigger(selectorTrigger, opts) {
        this._opts = _jquery2.default.extend({}, defaults, opts);

        var self = this;

        this._$trigger = (0, _jquery2.default)(selectorTrigger).on(this._opts.triggerEvent, _lodash2.default.bind(this.triggerClicked, self));
    }

    ButtonTrigger.prototype.setTriggerDisabled = function (toggle) {
        toggle = toggle === undefined ? true : !!toggle;
        this._$trigger.prop('disabled', toggle).attr('aria-disabled', toggle);
    };

    ButtonTrigger.prototype.isTriggerDisabled = function () {
        return this._$trigger.attr('aria-disabled') === 'true';
    };

    ButtonTrigger.prototype.setTriggerActive = function (toggle) {
        this._$trigger.attr('aria-pressed', toggle === undefined ? true : !!toggle);
    };

    ButtonTrigger.prototype.isTriggerActive = function () {
        return this._$trigger.attr('aria-pressed') === 'true';
    };

    ButtonTrigger.prototype.triggerClicked = function (event) {
        var isOn = this.isTriggerActive();

        if (this.isTriggerDisabled()) {
            if (this._opts.stopEvent) {
                event && event.stopPropagation && event.stopPropagation();
                return false;
            }
            return;
        }

        this._opts.triggerHandler.apply(this, [!isOn].concat(_lodash2.default.toArray(arguments)));

        if (this._opts.stopEvent) {
            event && event.stopPropagation && event.stopPropagation();
            return false;
        }
    };

    exports.default = ButtonTrigger;
    module.exports = exports['default'];
});