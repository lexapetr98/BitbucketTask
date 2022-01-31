define('bitbucket/internal/widget/updating-section/updating-section', ['module', 'exports', 'jquery', 'lodash'], function (module, exports, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    /**
     * Updates the content of an element based on a Bacon EventStream using
     * a Soy template.
     *
     * @param {jQuery|HTMLElement} el logical container for the element that is being updated, a
     *						contained element with class .replacement-placeholder will
     *						be what is actually updated
     * @param {EventStream} updateEventStream the stream to listen to for events
     * @param {function} template Soy template function that is used to update the content
     * @param {object} [options] additional options
     * @constructor
     */
    function UpdatingSection(el, updateEventStream, template, options) {
        this.init.apply(this, arguments);
    }

    UpdatingSection.defaults = {
        context: {},
        isVisibleProperty: null
    };

    /**
     * Updates the content of an element based on a Bacon EventStream using
     * a Soy template.
     *
     * @param {jQuery|HTMLElement} el logical container for the element that is being updated, a
     *						contained element with class .replacement-placeholder will
     *						be what is actually updated
     * @param {EventStream} updateEventStream the stream to listen to for events
     * @param {function} template Soy template function that is used to update the content
     * @param {object} [options] additional options
     */
    UpdatingSection.prototype.init = function (el, updateEventStream, template, options) {
        this._$el = (0, _jquery2.default)(el);
        this._template = template;
        this._options = _lodash2.default.assign({}, UpdatingSection.defaults, options);
        this._$placeholder = this._$el.find('.replacement-placeholder');

        this._currentValue = {}; // the current template data

        _lodash2.default.bindAll(this, 'updateValue', 'updateVisibility');

        this._destroyCallbacks = [updateEventStream.onValue(this.updateValue)];

        if (this._options.isVisibleProperty) {
            this._destroyCallbacks.push(this._options.isVisibleProperty.onValue(this.updateVisibility));
        }
    };

    /**
     * Update the visibility of the container by setting the 'hidden' class
     *
     * @param {boolean} isVisible should the container be visible?
     */
    UpdatingSection.prototype.updateVisibility = function (isVisible) {
        this._$el.toggleClass('hidden', !isVisible);
    };

    /**
     * Update the value of the replaceable content within the container based
     * on a new value
     *
     * @param {object} newValue new template parameters, will be merged with the
     *							context parameters to produce the object passed
     *							to the Soy template
     */
    UpdatingSection.prototype.updateValue = function (newValue) {
        var value = _lodash2.default.assign({}, newValue, this._options.context);

        // Only update the DOM for this section if different values are passed in.
        if (_lodash2.default.isEqual(value, this._currentValue)) {
            return;
        }

        this._currentValue = value;
        var replacementContent = this._template(value);

        this._$placeholder.stop // stop any existing transitions
        ().fadeOut(0 // and only fadeout the element to avoid other elements shifting around
        ).html(replacementContent).fadeIn();
    };

    /**
     * Stop updating the UpdatingSection
     */
    UpdatingSection.prototype.destroy = function () {
        /**
         * Destroyables in this case is an array of functions returned from
         * Bacon, so we want to just call those functions in order to unsubscribe
         * (there isn't a "destroy" function)
         */
        this._destroyCallbacks.forEach(Function.prototype.call, Function.prototype.call);
    };

    exports.default = UpdatingSection;
    module.exports = exports['default'];
});