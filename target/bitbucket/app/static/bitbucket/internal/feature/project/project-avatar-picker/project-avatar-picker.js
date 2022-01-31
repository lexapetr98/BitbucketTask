define('bitbucket/internal/feature/project/project-avatar-picker/project-avatar-picker', ['module', 'exports', '@atlassian/aui', 'jquery', 'bitbucket/internal/widget/avatar-picker-dialog/avatar-picker-dialog'], function (module, exports, _aui, _jquery, _avatarPickerDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _avatarPickerDialog2 = babelHelpers.interopRequireDefault(_avatarPickerDialog);

    function ProjectAvatarPicker(container, options) {
        this.init.apply(this, arguments);
    }

    ProjectAvatarPicker.prototype.init = function (container, options) {
        this.$container = (0, _jquery2.default)(container);

        var $previewImage = this.$container.find('.project-avatar-preview .aui-avatar-project img');
        var $input = this.$container.find('.project-avatar-upload input[name=avatar]');
        var $changeAvatarButton = this.$container.find('.project-avatar-upload button');

        if (!$previewImage.attr('src')) {
            (0, _jquery2.default)('<div class="project-avatar-default-preview"></div>').insertAfter($previewImage);
        }

        var projectAvatarPicker = new _avatarPickerDialog2.default({
            dialogTitle: _aui2.default.I18n.getText('bitbucket.web.project.avatar.picker.title'),
            maskShape: _avatarPickerDialog2.default.maskShapes.ROUNDED_SQUARE,
            trigger: $changeAvatarButton,
            onCrop: function onCrop(croppedDataURI) {
                $previewImage.attr('src', croppedDataURI);
                $input.val(croppedDataURI);
            },
            xsrfToken: options && options.xsrfToken ? options.xsrfToken : null
        });
    };

    exports.default = ProjectAvatarPicker;
    module.exports = exports['default'];
});