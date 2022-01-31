define('bitbucket/internal/feature/file-content/binary-view/binary-view', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder'], function (module, exports, _aui, _jquery, _lodash, _navbuilder) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    /**
     * Returns the ?raw URL for a file at a revision
     * @param {Object} path
     * @param {string|JSON.CommitJSON} revision - commitJSON or a commit ID
     * @returns {string}
     */
    function getRawUrl(path, revision) {
        return _navbuilder2.default.currentRepo().raw().path(path.components).at(revision).build();
    }

    /**
     * Return the binaryHtml result for generic binary files.
     * @param {string} url raw url of the file
     * @returns {{$elem: (jQuery|HTMLElement), type: string}}
     */
    function handleBinary(url) {
        return {
            $elem: (0, _jquery2.default)(bitbucket.internal.feature.fileContent.binaryView.unrenderable({
                downloadUrl: url,
                descriptionContent: _aui2.default.I18n.getText('bitbucket.web.diffview.binary.unrenderable.description')
            })),
            type: 'link'
        };
    }

    /**
     * Return the binaryHtml result for image files.
     * @param {string} url raw url of the file
     * @param {Object|JSON.PathJSON} path to the image file
     * @returns {{$elem: (jQuery|HTMLElement), type: string}}
     */
    function handleImage(url, path) {
        return {
            $elem: (0, _jquery2.default)(bitbucket.internal.feature.fileContent.binaryView.image({
                src: url,
                extraAttributes: {
                    'data-ext': path.extension.toLowerCase()
                }
            })),
            type: 'image'
        };
    }

    /**
     * Map of file extension to HTML-returning function.
     */
    var handlerByExtension = {
        png: handleImage,
        jpg: handleImage,
        jpeg: handleImage,
        bmp: handleImage,
        ico: handleImage,
        gif: handleImage,
        svg: handleImage
    };

    /**
     * Calls the appropriate handler for the file's extension and returns the result.
     * @param {Object|JSON.PathJSON} path to the binary file
     * @param {string|JSON.CommitJSON} revision - commitJSON or a commit ID at which to display the file
     * @returns {{$elem: (jQuery|HTMLElement), type: string}}
     */
    function getBinaryHtml(path, revision) {
        var extension = path.extension && path.extension.toLowerCase();
        var url = getRawUrl(path, revision);
        var handler = handlerByExtension[extension] || handleBinary;
        return handler(url, path);
    }

    // Text files which should be handled as binary
    var binaryExtensions = ['svg'];

    function treatTextAsBinary(extension) {
        return extension && _lodash2.default.includes(binaryExtensions, extension);
    }

    exports.default = {
        getRenderedBinary: getBinaryHtml,
        treatTextAsBinary: treatTextAsBinary
    };
    module.exports = exports['default'];
});