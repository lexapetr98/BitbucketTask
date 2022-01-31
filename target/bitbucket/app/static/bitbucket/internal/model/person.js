define('bitbucket/internal/model/person', ['module', 'exports', 'backbone-brace'], function (module, exports, _backboneBrace) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backboneBrace2 = babelHelpers.interopRequireDefault(_backboneBrace);

    exports.default = _backboneBrace2.default.Model.extend({
        namedAttributes: {
            emailAddress: 'string',
            name: 'string'
        },
        idAttribute: 'name',
        initialize: function initialize() {
            // If there isn't an ID attribute in the namedAttributes, set the
            // ID to the value of the property that the idAttribute points to
            if (this.namedAttributes.id == null) {
                this.setId(this.attributes[this.idAttribute]);
            }
        }
    });
    module.exports = exports['default'];
});