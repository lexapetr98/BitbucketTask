define('bitbucket/internal/feature/repository/cloneUrlGen/cloneUrlGen', ['module', 'exports', 'jquery', 'lodash', 'unorm', 'bitbucket/util/navbuilder', 'bitbucket/internal/model/page-state'], function (module, exports, _jquery, _lodash, _unorm, _navbuilder, _pageState) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _unorm2 = babelHelpers.interopRequireDefault(_unorm);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    function slugify(name) {
        return _unorm2.default.nfkd(name).replace(/[^\x00-\x7F]+/g, '').replace(/[^a-zA-Z\-_0-9\\.]+/g, '-').toLowerCase();
    }

    function bindUrlGeneration(el, options) {
        var $el = (0, _jquery2.default)(el);
        var defaults = {
            elementsToWatch: [],
            getProject: _pageState2.default.getProject.bind(_pageState2.default),
            getRepoName: _lodash2.default.constant('')
        };

        options = _lodash2.default.assign(defaults, options);
        var $elementsToWatch = options.elementsToWatch.reduce(function ($elements, el) {
            return $elements.add(el);
        }, (0, _jquery2.default)());

        $elementsToWatch.on('input change', function () {
            var slug = slugify(options.getRepoName());
            $el.text(slug && _navbuilder2.default.project(options.getProject()).repo(slug).clone('git').buildAbsolute());
        }).trigger('change');
    }

    exports.default = {
        bindUrlGeneration: bindUrlGeneration,
        slugify: slugify
    };
    module.exports = exports['default'];
});