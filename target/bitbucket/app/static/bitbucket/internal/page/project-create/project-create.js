define('bitbucket/internal/page/project-create/project-create', ['module', 'exports', 'jquery', 'bitbucket/util/events', 'bitbucket/internal/feature/project/project-avatar-picker/project-avatar-picker'], function (module, exports, _jquery, _events, _projectAvatarPicker) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _projectAvatarPicker2 = babelHelpers.interopRequireDefault(_projectAvatarPicker);

    function onReady() {
        (0, _jquery2.default)('#key').generateFrom((0, _jquery2.default)('#name'), {
            maxNameLength: 128,
            maxKeyLength: 128
        });

        var xsrfToken = {
            name: 'atl_token',
            value: (0, _jquery2.default)('.project-create input[name=atl_token]').val()
        };

        new _projectAvatarPicker2.default('.avatar-picker-field', {
            xsrfToken: xsrfToken
        });

        (0, _jquery2.default)('#avatar-picker-button').on('click', _events2.default.trigger.bind(null, 'bitbucket.internal.ui.project-create.change-avatar.clicked'));
        (0, _jquery2.default)('form.project-settings').on('submit', function (e) {
            var descriptionLength = (0, _jquery2.default)('#description').val().length;
            var avatarChanged = (0, _jquery2.default)('#avatar').val().length > 0;
            _events2.default.trigger('bitbucket.internal.ui.project-create.submitted', null, {
                descriptionLength: descriptionLength,
                avatarChanged: avatarChanged
            });
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});