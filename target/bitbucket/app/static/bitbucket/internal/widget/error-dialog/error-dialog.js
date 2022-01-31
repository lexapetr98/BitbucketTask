define('bitbucket/internal/widget/error-dialog/error-dialog', ['module', 'exports', '@atlassian/aui', 'jquery'], function (module, exports, _aui, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var ErrorDialog = function () {
        function ErrorDialog(dialogOptions) {
            babelHelpers.classCallCheck(this, ErrorDialog);

            this._okCallbacks = _jquery2.default.Callbacks();
            this._closeCallbacks = _jquery2.default.Callbacks();
            this.reinit(dialogOptions);
        }

        babelHelpers.createClass(ErrorDialog, [{
            key: 'reinit',
            value: function reinit(dialogOptions) {
                this.dialogOptions = babelHelpers.extends({}, ErrorDialog.dialogDefaults, dialogOptions);
                // remove the dialog when it is re-inited so that it will get re-created with the new options.
                this.remove();
                return this;
            }
        }, {
            key: '_createDialog',
            value: function _createDialog() {
                var _this = this;

                if (!this._dialog) {
                    var _dialogOptions = this.dialogOptions,
                        okButtonClass = _dialogOptions.okButtonClass,
                        closeButtonClass = _dialogOptions.closeButtonClass,
                        showCloseButton = _dialogOptions.showCloseButton;


                    this._dialog = new _aui.dialog2(bitbucket.internal.dialogs.error(babelHelpers.extends({}, this.dialogOptions, {
                        extraClasses: 'error-dialog'
                    })));

                    var $dialog = this._dialog.$el;

                    $dialog.on('keydown', function (e) {
                        //override the ESC handling so we get a callback
                        if (e.keyCode === _aui.keyCode.ESCAPE) {
                            _this.hide();
                        }
                    });

                    $dialog.find('.' + okButtonClass).click(function () {
                        var e = _jquery2.default.Event('ok');
                        _this._okCallbacks.fireWith(_this, [e]);

                        if (!e.isDefaultPrevented()) {
                            _this.remove();
                        }
                    });

                    if (showCloseButton) {
                        $dialog.find('.' + closeButtonClass).click(function () {
                            _this.remove();
                        });
                    }
                }
            }
        }, {
            key: 'show',
            value: function show() {
                this._createDialog();
                this._dialog.show();

                return this;
            }
        }, {
            key: 'isShowing',
            value: function isShowing() {
                return this._dialog && this._dialog.$el.is(':visible');
            }
        }, {
            key: 'hide',
            value: function hide() {
                if (this.isShowing()) {
                    this._dialog.off('keydown');
                    this._dialog.hide();
                    this._closeCallbacks.fireWith(this, []);
                }

                return this;
            }
        }, {
            key: 'remove',
            value: function remove() {
                if (this._dialog) {
                    this.hide();
                    this._dialog.remove();
                    this._dialog = null;
                }

                return this;
            }
        }, {
            key: 'addOkListener',
            value: function addOkListener(funcOrFuncs) {
                this._okCallbacks.add(funcOrFuncs);

                return this;
            }
        }, {
            key: 'addHideListener',
            value: function addHideListener(funcOrFuncs) {
                this._closeCallbacks.add(funcOrFuncs);

                return this;
            }
        }, {
            key: 'getOkButton',
            value: function getOkButton() {
                this._createDialog();
                return this._dialog.$el.find('.' + this.dialogOptions.okButtonClass);
            }
        }]);
        return ErrorDialog;
    }();

    ErrorDialog.dialogDefaults = {
        id: null,
        titleText: _aui.I18n.getText('bitbucket.web.dialog.unexpected.error.title'),
        titleClass: 'error-header',
        panelContent: '<p>' + _aui.I18n.getText('bitbucket.web.dialog.unknown.error.detail') + '</p>',
        panelClass: 'panel-body',
        okButtonText: _aui.I18n.getText('bitbucket.web.dialog.button.ok'),
        okButtonClass: 'ok-button',
        showCloseButton: false,
        closeButtonText: _aui.I18n.getText('bitbucket.web.dialog.button.close'),
        closeButtonClass: 'close-button',
        closeOnOutsideClick: false
    };
    exports.default = ErrorDialog;
    module.exports = exports['default'];
});