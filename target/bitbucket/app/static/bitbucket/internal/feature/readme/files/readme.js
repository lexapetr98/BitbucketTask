define('bitbucket/internal/feature/readme/files/readme', ['exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/feature/readme/common/readme-common', 'bitbucket/internal/model/path', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events', 'bitbucket/internal/util/syntax-highlight'], function (exports, _aui, _jquery, _lodash, _readmeCommon, _path, _ajax, _events, _syntaxHighlight) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = undefined;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _syntaxHighlight2 = babelHelpers.interopRequireDefault(_syntaxHighlight);

    /** Readme jQuery object */
    var $readme;

    /**
     * Mock Ajax response so we don't have to do null checks.
     */
    var mockResponse = {
        abort: _jquery2.default.noop
    };

    /**
     * Finds the readme file in a list containing objects that have the structure {name: "foo"}.
     *
     * The nice thing about doing this here, rather than requesting just the directory is that we cache the result
     * more aggressive (ie based on the file blob). We can pass the supported file extensions via page-data and always
     * request the correct file.
     */
    var findReadmeFile = function findReadmeFile(files, data) {
        var README = data.name,
            extensions = data.extensions;


        var readmeFiles = files.filter(function (_ref) {
            var name = _ref.name,
                type = _ref.type;

            name = name.toUpperCase();
            return (name === README || (0, _lodash.startsWith)(name, README + '.')) && type === 'FILE';
        });

        var filesByExt = (0, _lodash.groupBy)(readmeFiles, function (_ref2) {
            var name = _ref2.name;
            return new _path2.default(name).getExtension().toUpperCase();
        });

        return extensions.map(function (ext) {
            return (0, _lodash.head)(filesByExt[ext.toUpperCase()]);
        }).filter(function (a) {
            return a;
        })[0];
    };

    // Current request in flight
    var currentRequest = mockResponse;

    /**
     * Finds the first readme file, fetches the markup and inserts the result into $readme.
     * @return the ajax response that can be aborted (or a similar mock object).
     */
    var updateFromFirstReadme = function updateFromFirstReadme(_ref3) {
        var files = _ref3.files,
            path = _ref3.path,
            revision = _ref3.revision;

        _readmeCommon.DATA.then(function (data) {
            return findReadmeFile(files, data);
        }).done(function (file) {
            if (!file) {
                return;
            }
            var $content = $readme.find('.filebrowser-readme-content').empty();
            $readme.find('.filebrowser-readme-title').text(file.name);
            var clearReadmeStatus = function clearReadmeStatus() {
                clearReadme();
                return false;
            };
            var showReadme = function showReadme(html) {
                // Move this out of this function to show loading spinner.
                // The downside is what to do with 'unknown' readme types?
                $readme.show();
                $content.html((0, _readmeCommon.updateLinks)((0, _jquery2.default)(html), window.location.pathname));
                _syntaxHighlight2.default.container($content);
                _events2.default.trigger('bitbucket.internal.feature.readme.rendered');
            };
            path = new _path2.default(path);
            currentRequest = _ajax2.default.rest({
                url: (0, _readmeCommon.createUrl)(path.getComponents().concat(file.name), revision, file.contentId),
                dataType: 'html',
                statusCode: {
                    400: clearReadmeStatus,
                    413: function _() {
                        showReadme(_aui2.default.messages.warning({
                            body: _aui2.default.I18n.getText('bitbucket.web.sourceview.readme.toolarge'),
                            closeable: false
                        }));
                        return false;
                    },
                    415: clearReadmeStatus,
                    500: clearReadmeStatus
                }
            }).done(function (html) {
                if (_jquery2.default.trim(html)) {
                    showReadme(html);
                } else {
                    clearReadme();
                }
            });
        });
    };

    /** Cancel any in-flight calls. Otherwise we introduce a race condition for dirs that don't a readme. */
    var clearReadme = function clearReadme() {
        currentRequest.abort();
        $readme.hide();
    };

    /**
     * Initialises the readme on the first request, and then listens for subsequent directory changes.
     * The initial loading could also be done server side.
     * The disadvantage is for higher-latency users on their first request.
     * The advantage we have with this approach is faster response times, browser caching and having a separate plugin.
     */
    var onReady = function onReady(selector) {
        var cachedData;

        $readme = (0, _jquery2.default)(selector).html(bitbucket.internal.feature.readme.readme());
        clearReadme();

        // Listen for url changes and hide the readme view
        _events2.default.on('bitbucket.internal.page.filebrowser.revisionRefChanged', clearReadme);
        _events2.default.on('bitbucket.internal.page.filebrowser.urlChanged', clearReadme);
        _events2.default.on('bitbucket.internal.feature.filetable.showSpinner', clearReadme);

        _events2.default.on('bitbucket.internal.feature.filebrowser.filesChanged', function (data) {
            cachedData = data;
            updateFromFirstReadme(data);
        });

        _events2.default.on('bitbucket.internal.feature.filetable.showFind', clearReadme);
        _events2.default.on('bitbucket.internal.feature.filetable.hideFind', function () {
            if (cachedData) {
                updateFromFirstReadme(cachedData);
            }
        });
    };

    exports.onReady = onReady;
});