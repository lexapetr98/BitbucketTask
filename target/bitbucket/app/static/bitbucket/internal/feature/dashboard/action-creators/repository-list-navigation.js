define('bitbucket/internal/feature/dashboard/action-creators/repository-list-navigation', ['module', 'exports', '@atlassian/aui', 'lodash', '../actions'], function (module, exports, _aui, _lodash, _actions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (_ref) {
        var event = _ref.event;
        var eventType = event.type,
            keyCode = event.keyCode;


        return function (dispatch) {
            // a blur event constitutes moving away from the
            // repository list and the focus is reset
            if (eventType === 'blur') {
                dispatch({
                    type: _actions.REPOSITORIES_FOCUS_NONE
                });
                return;
            } else if (eventType === 'focus') {
                // a focus event immediately sets the focused index to 0
                dispatch({
                    type: _actions.REPOSITORIES_FOCUS_INITIAL
                });
                return;
            }

            // only dispatch for handled codes
            if (!(0, _lodash.includes)(HANDLED_CODES, keyCode)) {
                return;
            }
            event.preventDefault();

            switch (keyCode) {
                case _aui.keyCode.UP:
                    {
                        dispatch({
                            type: _actions.REPOSITORIES_FOCUS_PREVIOUS
                        });
                        break;
                    }

                case _aui.keyCode.DOWN:
                    {
                        dispatch({
                            type: _actions.REPOSITORIES_FOCUS_NEXT
                        });
                        break;
                    }
            }
        };
    };

    var HANDLED_CODES = [_aui.keyCode.UP, _aui.keyCode.DOWN];

    /**
     * @param {Event} event
     * @returns {Function}
     */
    module.exports = exports['default'];
});