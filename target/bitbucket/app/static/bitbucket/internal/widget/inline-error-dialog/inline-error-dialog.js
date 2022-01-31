define('bitbucket/internal/widget/inline-error-dialog/inline-error-dialog', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/deprecation'], function (module, exports, _jquery, _lodash, _deprecation) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _deprecation2 = babelHelpers.interopRequireDefault(_deprecation);

    /**
     * Very simple inline dialog wrapper for showing a list of errors with a title
     * @param {HTMLElement|jQuery} anchor - the element to anchor the inline dialog to visually, but showing the dialog won't be bound to it.
     * @param {object} opts
     * @param {boolean} opts.persistent - Should the inline dialog be persistent or close on outside click?
     * @constructor InlineErrorDialog
     */
    function InlineErrorDialog(anchor, opts) {
        this.init.apply(this, arguments);
    }

    /**
     * Initialise the InlineErrorDialog
     * @param {HTMLElement|jQuery} anchor - the element to anchor the inline dialog to visually, but showing the dialog won't be bound to it.
     * @param {{id: *, content: string}} opts
     * @param {boolean} opts.persistent - Should the inline dialog be persistent or close on outside click?
     */
    InlineErrorDialog.prototype.init = function (anchor, opts) {
        this.errors = [];
        this.options = _jquery2.default.extend({ persistent: true }, opts);
        this._destroyables = [];

        _lodash2.default.bindAll(this, 'hide', 'show', 'refresh', 'add', 'reset', 'destroy');

        opts = babelHelpers.extends({}, opts, {
            id: _lodash2.default.uniqueId('inline-error-dialog-'),
            content: ''
        });
        this._$inlineDialog = (0, _jquery2.default)(aui.inlineDialog2.inlineDialog2(opts));
        this._$inlineDialog.appendTo(document.body).on('click', '.dismiss-button', this.hide);
        this._inlineDialog = document.getElementById(opts.id);
        (0, _jquery2.default)(anchor).attr({
            'aria-controls': opts.id
        });
    };

    /**
     * Hide the InlineErrorDialog
     */
    InlineErrorDialog.prototype.hide = function () {
        this._inlineDialog.open = false;
        this.reset();
    };

    /**
     * Rerender the contents and show the inline dialog, recalculating the size and position
     */
    InlineErrorDialog.prototype.show = function () {
        this._$inlineDialog.find('.aui-inline-dialog-contents').html(bitbucket.internal.widget.inlineErrorDialog.contents({
            title: _lodash2.default.isFunction(this.options.title) ? this.options.title(this.errors) : this.options.title,
            subtitle: _lodash2.default.isFunction(this.options.subtitle) ? this.options.subtitle(this.errors) : this.options.subtitle,
            errors: this.errors,
            persistent: this.options.persistent
        })).addClass('inline-error-contents');
        this._inlineDialog.open = true;
    };

    /**
     * Refresh the InlineErrorDialog (reattach to anchor position)
     */
    InlineErrorDialog.prototype.refresh = _deprecation2.default.fn(function () {}, 'This dialog now automatically refreshes because it uses AUI dialog2', null, '5.7', '6.0');

    /**
     * Add an error to the InlineErrorDialog
     * @param error
     */
    InlineErrorDialog.prototype.add = function (error) {
        this.errors.push(error);
    };

    /**
     * Remove all the errors from the inline dialog
     */
    InlineErrorDialog.prototype.reset = function () {
        this.errors.length = 0;
    };

    /**
     * Destroy the instance
     */
    InlineErrorDialog.prototype.destroy = function () {
        this.errors.length = 0;
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
        this._$inlineDialog.remove();
    };

    exports.default = InlineErrorDialog;
    module.exports = exports['default'];
});