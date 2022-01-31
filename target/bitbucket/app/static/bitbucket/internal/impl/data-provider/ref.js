define('bitbucket/internal/impl/data-provider/ref', ['module', 'exports', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/data-provider/ref', 'bitbucket/internal/util/object'], function (module, exports, _navbuilder, _ref, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _ref2 = babelHelpers.interopRequireDefault(_ref);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    /**
     * @param {Object?} options
     * @constructor
     */
    function RefDataProvider(options) {
        _ref2.default.apply(this, arguments);
    }
    _object2.default.inherits(RefDataProvider, _ref2.default);

    /**
     * Get a NavBuilder for the REST resource URL this should hit(/rest/projectsPROJ/repos/REPO/{tags|branches|commits}}.
     *
     * @returns {NavBuilder} builder - the {@link NavBuilder} function
     * @protected
     */
    RefDataProvider.prototype._getBuilder = function () {
        var refTypes = {
            tag: 'tags',
            branch: 'branches',
            commit: 'commits'
        }[this.filter.type];
        var repo = this.filter.repository;
        var key = repo.project.key;
        var slug = repo.slug;
        return _navbuilder2.default.rest().project(key).repo(slug)[refTypes]().withParams({
            filterText: this.filter.term
        });
    };

    /**
     * @see bitbucket/internal/spi/data-provider._transform for how this works.
     *
     * Our Refs don't have type or repository properties, apparently. So we use the
     * filter to populate them on the outgoing models.
     *
     * @param page - data returned from REST
     * @returns {Array<models.ref>} an array of refs
     * @private
     */
    RefDataProvider.prototype._transform = function (page) {
        var type = this.filter.type;
        var repo = this.filter.repository;
        return page.values.map(function (ref) {
            return babelHelpers.extends({}, ref, {
                repository: ref.repository || repo,
                type: type
            });
        });
    };

    exports.default = RefDataProvider;
    module.exports = exports['default'];
});