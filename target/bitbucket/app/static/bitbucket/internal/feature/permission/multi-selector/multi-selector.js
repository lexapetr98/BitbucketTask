define('bitbucket/internal/feature/permission/multi-selector/multi-selector', ['module', 'exports', '@atlassian/aui', 'backbone-brace', 'jquery', 'lodash', 'bitbucket/internal/feature/user/group-multi-selector/group-multi-selector', 'bitbucket/internal/feature/user/user-multi-selector/user-multi-selector'], function (module, exports, _aui, _backboneBrace, _jquery, _lodash, _groupMultiSelector, _userMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _groupMultiSelector2 = babelHelpers.interopRequireDefault(_groupMultiSelector);

    var _userMultiSelector2 = babelHelpers.interopRequireDefault(_userMultiSelector);

    var entityTypeToSelectorConstructor = {
        user: _userMultiSelector2.default,
        group: _groupMultiSelector2.default
    };

    function createGetSelected(delegate, entityType) {
        return function () {
            return _lodash2.default.map(delegate(), entityType);
        };
    }

    var PermissionMultiSelector = _backboneBrace2.default.View.extend({
        events: {
            'click .add-button': '_onClickAdd'
        },

        /**
         * @param {Object} opts the options available to the PermissionMultiSelector. Valid options are:
         *
         * * {String}   entityType (required) either 'user' or 'group'
         * * {String}   url        (required) the REST resource to search
         * * {Function} add        (required) the callback to be invoked when the add button is clicked
         *
         */
        initialize: function initialize(opts) {
            var $field = this.$el.find('.permission-multi-selector');
            this._$addButton = this.$el.find('.add-button');

            var DelegateMultiSelector = entityTypeToSelectorConstructor[opts.entityType];
            if (!DelegateMultiSelector) {
                throw new Error('Unknown entity type: ' + opts.entityType);
            }
            this._delegate = new DelegateMultiSelector($field, {
                dataSource: opts.dataSource
            });

            if (!_lodash2.default.isFunction(opts.add)) {
                throw new Error('must provide an add function');
            }

            // This must be bound on the dropdown as it is moved around the DOM
            var $dropdown = this.$el.find('.permission-type-dropdown');
            $dropdown.on('click', 'a', _lodash2.default.bind(this._onSelectPermission, this));

            this._permission = $dropdown.find('li:first-child').attr('data-value');

            this._delegate.on('change', _lodash2.default.bind(this._onChangeEntitySelection, this));
            this._onChangeEntitySelection();

            this.$el.on('keydown', _lodash2.default.bind(function (e) {
                // If a keydown event bubbles up to the container from the multi-select
                // then We should add the selected. This allows for easier use of the selector
                // via the keyboard
                if (e.which === _aui2.default.keyCode.ENTER && e.target.tagName === 'INPUT' && this.getSelected().length) {
                    e.preventDefault();
                    this._addSelected();
                }
            }, this));
        },
        getSelected: function getSelected() {
            return this._delegate.getSelectedItems();
        },
        getPermission: function getPermission() {
            return this._permission;
        },
        showError: function showError(data) {
            this.clearError();
            var $errors = this._$errors = (0, _jquery2.default)('<div></div>');
            var errors = _lodash2.default.get(data, 'errors.length') ? data.errors : [{
                message: _aui2.default.I18n.getText('bitbucket.web.permission.multiselector.unexpected.error')
            }];
            _lodash2.default.forEach(errors, function (error) {
                (0, _jquery2.default)('<p class="error-message"></p>').text(error.message).appendTo($errors);
            });
            $errors.appendTo(this.$el.children('th'));
        },
        clearError: function clearError() {
            if (this._$errors) {
                this._$errors.remove();
                this._$errors = null;
            }
        },
        clear: function clear() {
            this.clearError();
            this._delegate.clearSelectedItems();
            this._setAddButtonDisabled(true);
        },
        _addSelected: function _addSelected() {
            this._setAddButtonDisabled(true);
            _jquery2.default.when(this.options.add({
                entities: this.getSelected(),
                permission: this.getPermission()
            })).always(_lodash2.default.bind(this._setAddButtonDisabled, this, false)).done(_lodash2.default.bind(this.clear, this)).fail(_lodash2.default.bind(function (xhr, statusText, errorType, data) {
                this.showError(data);
            }, this));
        },
        _setAddButtonDisabled: function _setAddButtonDisabled(disabled) {
            this._$addButton.toggleClass('disabled', disabled).prop('disabled', disabled);
        },
        _onClickAdd: function _onClickAdd(e) {
            e.preventDefault();
            this._addSelected();
        },
        _onSelectPermission: function _onSelectPermission(e) {
            e.preventDefault();
            var $anchor = (0, _jquery2.default)(e.target);
            this._permission = $anchor.closest('li').attr('data-value');
            this.$el.find('.permission-type-trigger').text($anchor.text());
        },
        _onChangeEntitySelection: function _onChangeEntitySelection() {
            this._setAddButtonDisabled(!this.getSelected().length);
        }
    });

    exports.default = PermissionMultiSelector;
    module.exports = exports['default'];
});