define('bitbucket/internal/feature/admin/db/dbConfigFields', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash'], function (module, exports, _aui, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    function updateDatabaseMessages(dbType) {
        var $type = (0, _jquery2.default)('#type');
        var $fieldGroup = $type.closest('.field-group');
        var $container = $fieldGroup.parent();

        $fieldGroup.find('.help-url').attr('href', dbType.helpUrl);
        $fieldGroup.find('.driver-unavailable').toggleClass('hidden', dbType.driverAvailable || !dbType.dcSupported);
        $fieldGroup.find('.not-clusterable').toggleClass('hidden', dbType.dcSupported).find('.not-clusterable-database').text(dbType.displayName);

        $container.find('input').add((0, _jquery2.default)('#test,#submit')).toggleClass('disabled', !(dbType.dcSupported && dbType.driverAvailable)).prop('disabled', !(dbType.dcSupported && dbType.driverAvailable));
    }

    function toggleDatabaseLabel(dbType) {
        // Replace the text in the first textNode. Using .text() will remove all innerHtml
        var $fieldGroup = (0, _jquery2.default)('#database').closest('.field-group');
        var $label = $fieldGroup.children('label');
        var $labelChildren = $label.children();
        var $description = $fieldGroup.children('.description');
        var labelText;
        var descriptionText;
        if (dbType.usesSid) {
            labelText = _aui2.default.I18n.getText('bitbucket.web.admin.db.service.label');
            descriptionText = _aui2.default.I18n.getText('bitbucket.web.admin.db.service.description');
        } else {
            labelText = _aui2.default.I18n.getText('bitbucket.web.admin.db.database.label');
            descriptionText = _aui2.default.I18n.getText('bitbucket.web.admin.db.database.description');
        }
        $label.text(labelText).append($labelChildren);
        $description.text(descriptionText);
    }

    function fillDefaultsInFields(oldDbType, newDbType) {
        var defaults = newDbType.defaults;
        _lodash2.default.forEach(oldDbType.defaults, function (defaultValue, fieldName) {
            var $field = (0, _jquery2.default)('#' + fieldName);
            var val = $field.val();
            if (val === defaultValue) {
                $field.val(defaults[fieldName] || '');
            }
        });
    }

    function onReady(dbTypes) {
        var $typeField = (0, _jquery2.default)('#type');
        var dbTypeByKey = {};
        _lodash2.default.forEach(dbTypes, function (dbType) {
            dbTypeByKey[dbType.key] = dbType;
        });
        var selectedDbType = dbTypeByKey[$typeField.val()];
        $typeField.on('change', function () {
            var newDbType = dbTypeByKey[(0, _jquery2.default)(this).val()];
            toggleDatabaseLabel(newDbType);
            fillDefaultsInFields(selectedDbType, newDbType);
            updateDatabaseMessages(newDbType);
            selectedDbType = newDbType;
        });
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});