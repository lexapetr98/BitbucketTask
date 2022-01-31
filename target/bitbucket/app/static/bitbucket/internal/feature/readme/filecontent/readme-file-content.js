define('bitbucket/internal/feature/readme/filecontent/readme-file-content', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/feature/readme/common/readme-common', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/syntax-highlight'], function (module, exports, _aui, _jquery, _lodash, _readmeCommon, _ajax, _syntaxHighlight) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    exports.default = function (options) {
        if (options.contentMode !== 'source') {
            return null;
        }
        var fileChange = options.fileChange;
        return _readmeCommon.DATA.then(function (_ref) {
            var extensions = _ref.extensions,
                extensionsRaw = _ref.extensionsRaw;

            var ext = fileChange.path.extension.toLowerCase();
            if (ext && (0, _lodash.includes)(extensions, ext) && !(0, _lodash.includes)(extensionsRaw, ext)) {
                var until = fileChange.commitRange.untilRevision.id;
                return _ajax2.default.rest({
                    // Note that we're using the commit instead of the blob, which is still unique but sadly won't hit
                    // the same browser cache as the request on the file page
                    url: (0, _readmeCommon.createUrl)(fileChange.path.components, until, until),
                    dataType: 'html',
                    statusCode: {
                        413: function _() {
                            return _jquery2.default.Deferred().reject(_aui2.default.I18n.getText('bitbucket.web.sourceview.readme.toolarge.detail'));
                        }
                    }
                }).then(function (html) {
                    options.$container.empty().append((0, _readmeCommon.updateLinks)((0, _jquery2.default)(bitbucket.internal.feature.readme.renderMarkup({
                        content: html
                    }))));
                    _syntaxHighlight2.default.container(options.$container);

                    return {
                        editing: {
                            editable: false,
                            reason: _aui2.default.I18n.getText('bitbucket.web.sourceview.button.edit.disabled')
                        }
                    };
                });
            }
            return _jquery2.default.Deferred().reject();
        });
    };

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _syntaxHighlight2 = babelHelpers.interopRequireDefault(_syntaxHighlight);

    module.exports = exports['default'];
});