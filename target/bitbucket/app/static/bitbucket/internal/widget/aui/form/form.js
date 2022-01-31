define('bitbucket/internal/widget/aui/form/form', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    function enablePasswordEdit($protectedPassword, $passwordOverlayButton) {
        $protectedPassword.prop('disabled', false);
        $protectedPassword.focus();
        $passwordOverlayButton.remove();
    }

    function preventDefault(e) {
        e.preventDefault();
    }

    function setSubmissionPrevented($form, shouldPrevent) {
        $form.data('preventSubmission', shouldPrevent);
        $form.find(':submit').toggleClass('disabled', shouldPrevent).prop('disabled', shouldPrevent);
        $form.find('a, button, input[type="button"]')[shouldPrevent ? 'on' : 'off']('click', preventDefault).toggleClass('disabled', shouldPrevent);
    }

    function preventSubmission($form) {
        setSubmissionPrevented($form, true);
    }

    function allowSubmission($form) {
        setSubmissionPrevented($form, false);
    }

    function isSubmissionPrevented($form) {
        return $form.data('preventSubmission');
    }

    function addUnloadHandlerOnce(func) {
        var $window = (0, _jquery2.default)(window);

        // Safari and FF disable caching when using the unload handler, but both support pagehide, so use that instead
        var event = Object.prototype.hasOwnProperty.call(window, 'onpagehide') ? 'pagehide' : 'unload';

        var handler = function handler() {
            $window.off(event, handler);
            return func.apply(this, arguments);
        };

        $window.on(event, handler);
    }

    function onReady() {
        // This will prevent double-submit on all forms that are submitted natively (e.g., no AJAXy stuff).
        (0, _jquery2.default)(document).on('submit', '.prevent-double-submit', function (e) {
            var $form = (0, _jquery2.default)(e.target);

            if (isSubmissionPrevented($form)) {
                e.preventDefault();
            } else {
                // We need to ensure we are the last ones to handle this.
                // otherwise some other JS can come later and do a preventDefault, but we'll think
                // the submit went through and prevent the next submit.
                // We also need to ensure that we don't affect the current submit when we disable buttons and such.
                // To those ends, we use a setTimeout here.
                setTimeout(function () {
                    if (!e.isDefaultPrevented()) {
                        setSubmissionPrevented($form, true);

                        addUnloadHandlerOnce(function () {
                            // Firefox and Safari cache page state.  So we have to reenable the buttons before leaving
                            // the page, otherwise the form won't work after you hit the back button to return.
                            setSubmissionPrevented($form, false);
                        });
                    }
                }, 0);
            }
        });

        // Make the protected password field editable on click or focus. Protected password fields are required on pages
        // where the password differs from the user's instance password, e.g. mail server settings page.
        (0, _jquery2.default)(document).on('click focus', '.autofill-protected-password-overlay', function () {
            var $overlay = (0, _jquery2.default)(this);
            enablePasswordEdit($overlay.siblings('.autofill-protected-password'), $overlay);
        });
    }

    exports.default = {
        preventSubmission: preventSubmission,
        allowSubmission: allowSubmission,
        isSubmissionPrevented: isSubmissionPrevented,
        onReady: onReady
    };
    module.exports = exports['default'];
});