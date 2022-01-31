define('bitbucket/internal/widget/confirm-dialog/confirm-dialog', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/util/ajax', 'bitbucket/internal/widget/submit-spinner/submit-spinner'], function (module, exports, _aui, _jquery, _ajax, _submitSpinner) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _submitSpinner2 = babelHelpers.interopRequireDefault(_submitSpinner);

    var CONTENT_SELECTOR = '.aui-dialog2-content';

    var ConfirmDialog = function () {

        /**
         * Create a new {@see ConfirmDialog} instance with the given options
         * @param {object} [dialogOptions={@see ConfirmDialog.dialogDefaults}]
         * @param {object} [ajaxOptions]
         */
        function ConfirmDialog(dialogOptions, ajaxOptions) {
            babelHelpers.classCallCheck(this, ConfirmDialog);

            this.dialogOptions = babelHelpers.extends({}, ConfirmDialog.dialogDefaults, dialogOptions);
            this.ajaxOptions = ajaxOptions || {};
            this._selectors = [];
            this._okCallbacks = _jquery2.default.Callbacks();
            this._cancelCallback = _jquery2.default.Callbacks();
            this._detachers = _jquery2.default.Callbacks();
        }

        babelHelpers.createClass(ConfirmDialog, [{
            key: 'getConfirmButton',
            value: function getConfirmButton() {
                return (0, _jquery2.default)('#' + this.dialogOptions.id + ' .' + this.dialogOptions.confirmButtonClass);
            }
        }, {
            key: 'getButtons',
            value: function getButtons() {
                var $buttons = this.getConfirmButton();
                var dialogId = this.dialogOptions.id;
                $buttons = $buttons.add('#' + dialogId + ' .confirm-dialog-cancel');
                this._selectors.forEach(function (selector) {
                    $buttons = $buttons.add('#' + dialogId + ' ' + selector);
                });
                return $buttons;
            }
        }, {
            key: 'setButtonsDisabled',
            value: function setButtonsDisabled(disabled) {
                var $buttons = this.getButtons();
                $buttons.attr({ disabled: disabled }).toggleClass('disabled', disabled);
            }
        }, {
            key: 'remove',
            value: function remove() {
                if (this._dialog) {
                    this.setButtonsDisabled(false);
                    // this condition matches the check in AUI (despite my aversion to $.fn.data)
                    if (this._dialog.$el.data('aui-remove-on-hide')) {
                        // NOTE: data-aui-remove-on-hide="true" must be set for this to not leak dialogs into the DOM.
                        // And unfortunately, we can't call .remove() here, because AUI doesn't guard itself and tries to double remove it
                        // when you call remove.
                        this._dialog.hide();
                    } else {
                        this._dialog.remove();
                    }
                    this._dialog = null;
                }
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.remove();
                this._detachers.fire();
                this._detachers = null;
            }
        }, {
            key: 'getContentElement',
            value: function getContentElement() {
                if (this._dialog) {
                    return this._dialog.$el.find(CONTENT_SELECTOR).get(0);
                }
                return null;
            }
        }, {
            key: 'attachTo',
            value: function attachTo(anchorSelector, onShow, container) {
                var _this = this;

                var dialogOptions = this.dialogOptions;
                var ajaxOptions = this.ajaxOptions;
                var okCallbacks = this._okCallbacks;
                var cancelCallbacks = this._cancelCallback;

                container = container || document;
                var $container = (0, _jquery2.default)(container);

                // Fix this: this doesn't take into account a container
                this._selectors.push(anchorSelector);

                var removeDialog = function removeDialog() {
                    return _this.remove();
                };

                /**
                 * @param {jQuery} $trigger - the jQuery reference to the element that originally opened the dialog
                 */
                var submitHandler = function submitHandler($trigger) {
                    _this.setButtonsDisabled(true);
                    var promise = null;
                    var spinner = new _submitSpinner2.default(_this.getConfirmButton(), 'before');
                    if (dialogOptions.submitToHref) {
                        spinner.show();

                        if ($trigger.is('a')) {
                            promise = _ajax2.default.rest(babelHelpers.extends({
                                url: $trigger.attr('href')
                            }, ajaxOptions)).always(function () {
                                spinner.hide();
                                removeDialog();
                            });
                        } else {
                            $trigger.closest('form').submit();
                        }
                    }
                    okCallbacks.fire(promise, $trigger, function () {
                        removeDialog();
                    }, _this._dialog, spinner);
                };

                var clickHandler = function clickHandler(e) {
                    e.preventDefault();
                    var $trigger = (0, _jquery2.default)(e.currentTarget);
                    if ($trigger.is(':disabled')) {
                        return;
                    }

                    _this._dialog = (0, _aui.dialog2)(bitbucket.internal.dialogs.confirm(babelHelpers.extends({}, dialogOptions, {
                        modal: true
                    })));

                    _this._dialog.$el.on('click', '.confirm-dialog-submit', function (e) {
                        submitHandler($trigger);
                    }).on('click', '.confirm-dialog-cancel', function (e) {
                        removeDialog();
                        cancelCallbacks.fire($trigger);
                    }).on('keydown', function (e) {
                        if (e.keyCode === _aui.keyCode.ESCAPE) {
                            e.preventDefault();
                            removeDialog();
                        }
                    });

                    _this._dialog.show();
                    if (dialogOptions.focusSelector) {
                        _this._dialog.$el.find(dialogOptions.focusSelector).focus();
                    }
                    if (onShow) {
                        onShow($trigger.get(0), _this._dialog, _this);
                    }
                };

                $container.on('click', anchorSelector, clickHandler);

                this._detachers.add(function () {
                    $container.off('click', anchorSelector, clickHandler);
                });
            }
        }, {
            key: 'addConfirmListener',
            value: function addConfirmListener(func) {
                this._okCallbacks.add(func);
            }
        }, {
            key: 'addCancelListener',
            value: function addCancelListener(func) {
                this._cancelCallback.add(func);
            }
        }]);
        return ConfirmDialog;
    }();

    ConfirmDialog.dialogDefaults = {
        id: null,
        titleText: _aui.I18n.getText('bitbucket.web.title.confirm'),
        titleClass: 'confirm-header',
        confirmButtonClass: 'confirm-button',
        panelContent: '<p>' + _aui.I18n.getText('bitbucket.web.dialog.confirm') + '</p>',
        panelClass: 'panel-body',
        submitText: _aui.I18n.getText('bitbucket.web.button.confirm'),
        submitToHref: true,
        focusSelector: '.confirm-button'
    };
    exports.default = ConfirmDialog;
    module.exports = exports['default'];
});