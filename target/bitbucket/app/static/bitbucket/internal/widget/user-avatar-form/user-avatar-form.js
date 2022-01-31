define('bitbucket/internal/widget/user-avatar-form/user-avatar-form', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/widget/avatar-picker-dialog/avatar-picker-dialog', 'bitbucket/internal/widget/confirm-dialog/confirm-dialog'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _ajax, _events, _avatarPickerDialog, _confirmDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _avatarPickerDialog2 = babelHelpers.interopRequireDefault(_avatarPickerDialog);

    var _confirmDialog2 = babelHelpers.interopRequireDefault(_confirmDialog);

    var ajaxDefaults = {
        statusCode: {
            400: false,
            401: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                /* will be thrown if the user needs to authenticate or if he/she does not have the required permission;
                   we want to skip the default error handling only for the latter. */
                return dominantError.shouldLogin;
            },
            404: false,
            500: false
        }
    };

    /**
     * Form allowing a user to select and upload a new avatar.
     *
     * @param {HTMLElement|jQuery} container
     * @param {Object} user
     * @param {Object} [xsrfToken] an optional XSRF token that is passed to and used by avatar picker components
     * @param {String} xsrfToken.name the name of the XSRF token field
     * @param {String} xsrfToken.value the value of the XSRF token
     * @constructor
     */
    function UserAvatarForm(container, user, xsrfToken) {
        _lodash2.default.bindAll(this, 'restorePreview', 'save', '_onSuccess');
        this.user = user;
        this.$container = (0, _jquery2.default)(container);
        this.$delete = this.$container.find('.avatar-delete-trigger');
        this.$image = this.$container.find('.user-avatar img');
        this.$picker = this.$container.find('.avatar-picker-trigger');
        this.xsrfToken = xsrfToken;

        this._initDialogs();
        this._toggleAvatarSource();
    }

    /**
     * Extend the form with a event mixin to enable firing local events.
     */
    _events2.default.addLocalEventMixin(UserAvatarForm.prototype);

    /**
     * Refresh all the user's avatars in the page.
     *
     * @param {String} url the new avatar URL
     */
    UserAvatarForm.prototype.refreshAll = function (url) {
        var self = this;
        (0, _jquery2.default)('.aui-avatar').filter(function () {
            return (0, _jquery2.default)(this).attr('data-username') === self.user.name;
        }).find('.aui-avatar-inner > img').each(function () {
            // Gravatar and Stash (intentionally) use the same parameter name to specify the avatar size
            // URLS for Gravatar: https://en.gravatar.com/site/implement/images/
            var avatarSize = getParameter((0, _jquery2.default)(this).attr('src'), 's');
            // in Firefox, removing and restoring the 'src' attribute is not sufficient for the browser to refetch
            // the avatar images (despite the 'no-cache' header on the responses containing the images); thus we add
            // the current timestamp to the target URL to force the refresh
            (0, _jquery2.default)(this).attr('src', addParametersToUrl(url, {
                s: avatarSize,
                t: new Date().getTime()
            }));
        });
    };

    /**
     * Restore the original avatar.
     */
    UserAvatarForm.prototype.restorePreview = function () {
        this.updatePreview(this.oldImage);
    };

    /**
     * Associate the new avatar to the user.
     *
     * @param {String} uri a data-uri encoding the new avatar selected by the user
     */
    UserAvatarForm.prototype.save = function (uri) {
        this.updatePreview(uri);
        this.upload(uri);
    };

    /**
     * Preview the avatar in the page.
     *
     * @param {String} uri a data-uri encoding the new avatar selected by the user
     */
    UserAvatarForm.prototype.updatePreview = function (uri) {
        this.oldImage = this.$image.attr('src');
        this.$image.attr('src', uri);
    };

    /**
     * Upload the new avatar to the server.
     *
     * @param {String} uri a data-uri encoding the new avatar selected by the user
     */
    UserAvatarForm.prototype.upload = function (uri) {
        // add a spinner on top of the image, like BitBucket
        var $parent = this.$image.parent();
        $parent.spin('large', { color: '#fff' });

        // prevent double submit
        this.$picker.prop('disabled', true);

        _ajax2.default.ajax(_jquery2.default.extend({
            url: this._getUploadUrl(),
            data: {
                avatar: uri
            },
            type: 'POST'
        }, ajaxDefaults)).then(getUrlFromResponse).done(this._onSuccess).fail(this.trigger.bind(this, 'avatarUploadError', _aui2.default.I18n.getText('bitbucket.web.user.avatar.upload.error'))).fail(this.restorePreview).always($parent.spinStop.bind($parent)).always(this.$picker.prop.bind(this.$picker, 'disabled', false));
    };

    /**
     * Initialise the picker and delete dialogs.
     *
     * @private
     */
    UserAvatarForm.prototype._initDialogs = function () {
        this.pickerDialog = new _avatarPickerDialog2.default({
            dialogTitle: _aui2.default.I18n.getText('bitbucket.web.user.avatar.upload.title'),
            dialogDoneButtonText: _aui2.default.I18n.getText('bitbucket.web.button.save'),
            maskShape: _avatarPickerDialog2.default.maskShapes.CIRCLE,
            trigger: this.$picker,
            onCrop: this.save,
            xsrfToken: this.xsrfToken,
            enableWebcam: true
        });
        this.deleteDialog = new _confirmDialog2.default({
            id: 'delete-avatar-dialog',
            titleClass: 'warning-header',
            titleText: _aui2.default.I18n.getText('bitbucket.web.user.avatar.delete.title'),
            panelContent: bitbucket.internal.widget.paragraph({
                text: _aui2.default.I18n.getText('bitbucket.web.user.avatar.delete.confirm')
            }),
            submitText: _aui2.default.I18n.getText('bitbucket.web.button.remove'),
            focusSelector: '.cancel-button'
        }, _jquery2.default.extend({
            type: 'DELETE'
        }, ajaxDefaults));

        var self = this;
        this.deleteDialog.addConfirmListener(function (promise) {
            promise.then(getUrlFromResponse).done(self._onSuccess).fail(self.trigger.bind(self, 'avatarDeleteError', _aui2.default.I18n.getText('bitbucket.web.user.avatar.delete.error')));
        });
        this.deleteDialog.attachTo(null, null, this.$delete);
    };

    /**
     * Get the URL where to upload the avatar.
     *
     * @returns {String} the URL where to upload the avatar
     * @private
     */
    UserAvatarForm.prototype._getUploadUrl = function () {
        var urlBuilder = _navbuilder2.default.user(this.user.slug).avatar();
        if (this.xsrfToken) {
            var xsrfToken = {};
            xsrfToken[this.xsrfToken.name] = this.xsrfToken.value;
            return urlBuilder.withParams(xsrfToken).build();
        }
        return urlBuilder.build();
    };

    /**
     * Handles a successful upload or deletion of the avatar.
     *
     * @param {String} url new URL of the avatar
     * @private
     */
    UserAvatarForm.prototype._onSuccess = function (url) {
        // refresh all the avatars in the page
        this.refreshAll(url);

        // toggle parts of the form on or off depending on the avatar source
        this._toggleAvatarSource();

        // fire a local completion event
        this.trigger('avatarChanged', this.user);

        // fire a global completion event for analytics
        _events2.default.trigger('bitbucket.internal.widget.userAvatarForm.avatarChanged', null, this.user);
    };

    /**
     * Toggle parts of the form (namely the gravatar notice and the delete trigger)
     * depending on the new avatar source (gravatar or local).
     *
     * @private
     */
    UserAvatarForm.prototype._toggleAvatarSource = function () {
        // Image URLs for Gravatar: https://en.gravatar.com/site/implement/images/
        var gravatarImageUrls = /^https?:\/\/(www|secure)\.gravatar.com\/.+/g;
        var gravatarUrl = gravatarImageUrls.test(this.$image.attr('src'));
        this.$container.toggleClass('gravatar-source', gravatarUrl);
    };

    /**
     * Extracts the new avatar URL from the response.
     *
     * @returns {String} the new avatar URL
     * @private
     */
    function getUrlFromResponse(data, textStatus, xhr) {
        return data.href || xhr.status === 201 && xhr.getResponseHeader('Location');
    }

    /**
     * Adds or replaces the query parameters on a URL.
     *
     * @param {String} url URL to edit
     * @param {Object} params object whose properties will be added as query parameters
     * @returns {String} URL with the additional or substituted query parameters
     * @private
     */
    function addParametersToUrl(url, params) {
        url = _navbuilder2.default.parse(url);
        _lodash2.default.forEach(params, function (value, key) {
            if (value) {
                url.replaceQueryParam(key, value);
            }
        });
        return url;
    }

    /**
     * Get a query parameter.
     *
     * @param {String} url URL to inspect
     * @param {String} key name of the parameter to retrieve
     * @returns {String|undefined} the value of the query parameter (or undefined it is not present in the URL)
     * @private
     */
    function getParameter(url, key) {
        return _navbuilder2.default.parse(url).getQueryParamValue(key);
    }

    exports.default = UserAvatarForm;
    module.exports = exports['default'];
});