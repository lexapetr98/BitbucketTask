define('bitbucket/internal/impl/data-provider/participants', ['module', 'exports', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/data-provider/participants', 'bitbucket/internal/util/object'], function (module, exports, _navbuilder, _participants, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _participants2 = babelHelpers.interopRequireDefault(_participants);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    /**
     * Provides paged user data
     *
     * @param {Object} options
     * @param {string?} options.avatarSize
     * @param {Repository} options.repository
     * @param {*} initialData
     * @constructor
     */
    function ParticipantsDataProvider(options, initialData) {
        _participants2.default.apply(this, arguments);
    }
    _object2.default.inherits(ParticipantsDataProvider, _participants2.default);

    /**
     * @see bitbucket/internal/spi/data-provider._transform for how this works.
     *
     * Get a NavBuilder for the REST resource URL this should hit (/rest/project<key>/repo/<slug>/participants).
     *
     * @returns {NavBuilder} builder - the {@link NavBuilder} function
     * @protected
     */
    ParticipantsDataProvider.prototype._getBuilder = function () {
        return _navbuilder2.default.rest().project(this.options.repository.project).repo(this.options.repository).participants().withParams(getParams(this.options.avatarSize, this.options.filter.term, this.options.filter.role));
    };

    /**
     * @see bitbucket/internal/spi/data-provider._transform for how this works.
     *
     * @param {Object} page - the data returned from the REST resource - in our case this is always a page.
     * @returns {Array<models.user>} an array of users
     * @private
     */
    ParticipantsDataProvider.prototype._transform = function (page) {
        return page.values;
    };

    /**
     * returns the params object to grab query string params from
     *
     * @param {string} avatarSize - size of avatar to add to the users - t-shirt sizes.
     * @param {string} term - search word
     * @param {string} role - A pull request role (AUTHOR|REVIEWER|PARTICIPANT)
     * @returns {{avatarSize: *}}
     */
    function getParams(avatarSize, term, role) {
        var params = {
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: avatarSize || 'small'
            })
        };
        if (role) {
            params.role = role;
        }
        if (term) {
            // not strictly supported by SPI
            params.filter = term;
        }
        return params;
    }

    exports.default = ParticipantsDataProvider;
    module.exports = exports['default'];
});