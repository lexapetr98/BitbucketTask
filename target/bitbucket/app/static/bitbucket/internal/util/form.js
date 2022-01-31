define('bitbucket/internal/util/form', ['exports', 'jquery', 'lodash'], function (exports, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.formToJSON = formToJSON;

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    // turn form inputs into [{name:'blah', value:'blah'}, ...] with serializeArray,
    // then into { blah: 'blah', ...} via reduce
    function formToJSON(form) {
        var $form = (0, _jquery2.default)(form);
        // Find all the checked checkboxes with the value 'on' and store them in an object
        var checkboxes = (0, _lodash.reduce)($form.find('input[type=checkbox]:checked'), function (obj, entry) {
            var $entry = (0, _jquery2.default)(entry);
            // Only process checkboxes with 'on' which is the default for Chrome/Firefox/IE9
            if ($entry.attr('value') === 'on') {
                obj[$entry.attr('name')] = true;
            }
            return obj;
        }, {});
        return (0, _lodash.reduce)($form.serializeArray(), function (obj, entry) {
            //paraphrased from http://stackoverflow.com/a/1186309/37685

            var existingVal = obj[entry.name];
            var newVal = entry.value === undefined ? '' : entry.value;

            // Override the checkbox value (most likely 'on') with true
            if (checkboxes[entry.name]) {
                newVal = true;
            }

            if (existingVal !== undefined) {
                // make it an array if it's not, since we have multiple values.
                if (!_jquery2.default.isArray(existingVal)) {
                    obj[entry.name] = [existingVal];
                }

                // add the new value to the array
                obj[entry.name].push(newVal);
            } else {
                obj[entry.name] = newVal;
            }

            return obj;
        }, {
            //seed with new object
        });
    }
});