define('bitbucket/internal/feature/integrity/alert', ['exports', '@atlassian/aui', 'bitbucket/util/navbuilder', 'bitbucket/internal/feature/alerts/alerts', 'bitbucket/internal/util/ajax'], function (exports, _aui, _navbuilder, _alerts, _ajax) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.init = init;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var MessageType = {
        INFO: 'info',
        WARN: 'warning'
    };
    var State = {
        STARTED: {
            closeable: false,
            title: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.started.banner.title'),
            description: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.started.banner.text')
        },
        INCONSISTENT: {
            closeable: false,
            title: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.inconsistent.banner.title'),
            description: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.inconsistent.banner.text')
        },
        COMPLETED: {
            closeable: true,
            title: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.completed.banner.title'),
            description: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.completed.banner.text')
        },
        INCONSISTENT_COMPLETED: {
            closeable: true,
            title: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.inconsistent.completed.banner.title'),
            description: _aui2.default.I18n.getText('bitbucket.web.admin.integrity.check.inconsistent.completed.banner.text')
        }
    };

    function init(states) {
        if (!states || states.length === 0) {
            return;
        }
        var _state = void 0;
        var messageType = void 0;
        switch (states[0]) {
            case 'acknowledged':
                // Bail out. The banner need not be shown.
                return;
            case 'started':
                messageType = MessageType.INFO;
                _state = State.STARTED;
                break;
            case 'inconsistency':
                if (states[1] === 'started') {
                    messageType = MessageType.WARN;
                    _state = State.INCONSISTENT;
                } else {
                    // Bail out. The banner need not be shown.
                    // This can happen when triggering checks via REST.
                    return;
                }
                break;
            case 'completed':
                // Done
                if (states[1] === 'inconsistency') {
                    messageType = MessageType.WARN;
                    _state = State.INCONSISTENT_COMPLETED;
                } else {
                    messageType = MessageType.INFO;
                    _state = State.COMPLETED;
                }
                break;
            default:
                console.warn('Could not identify integrity checks state.', states);
                return;
        }

        var alertObj = babelHelpers.extends({
            type: messageType,
            closeCallback: function closeCallback() {
                _ajax2.default.rest({
                    url: _navbuilder2.default.newBuilder('admin').addPathComponents('integrity-check', 'acknowledge').build(),
                    type: 'POST'
                });
            }
        }, _state);

        (0, _alerts.add)(alertObj);

        return alertObj;
    }
});