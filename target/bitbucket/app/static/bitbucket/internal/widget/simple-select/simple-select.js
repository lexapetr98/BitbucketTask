define('bitbucket/internal/widget/simple-select/simple-select', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    /**
     * Turns a dropdown2 into a simple select control
     * @param trigger Either a DOM node, jQuery object or a jQuery selector for the dropdown2 trigger
     * @param menu Either a DOM node, jQuery object or a jQuery selector for the dropdown2 menu
     * @param options Extra options see {@link SimpleSelect.prototoype.defaults}
     */
    function SimpleSelect(trigger, menu, options) {
        this.options = _jquery2.default.extend({}, SimpleSelect.prototype.defaults, options);
        this.$trigger = (0, _jquery2.default)(trigger);
        this.$menu = (0, _jquery2.default)(menu);
        this.init();
    }

    /**
     * Default options
     * @param onSelect Callback function when an item is selected by the user
     */
    SimpleSelect.prototype.defaults = {
        onSelect: _jquery2.default.noop
    };

    SimpleSelect.prototype.init = function () {
        var self = this;
        this._setSelectedFromList();

        this.$menu.on('click', 'li', function (e) {
            e.preventDefault();
            var $selected = (0, _jquery2.default)(this);
            self._setSelected($selected);
            self.options.onSelect($selected.attr('data-value'), $selected.text());
        });
    };

    SimpleSelect.prototype._setSelectedFromList = function () {
        var $selected = this.$menu.find('li[data-selected]');
        $selected = $selected.length ? $selected : this.$menu.find('li:first');
        this._setSelected($selected);
    };

    SimpleSelect.prototype._setSelected = function ($selected) {
        if ($selected && $selected.length) {
            this.$menu.find('li[data-selected]').removeAttr('data-selected');
            $selected.attr('data-selected', '');

            this.$trigger.text($selected.text());
        }
    };

    SimpleSelect.prototype.updateList = function (listContent) {
        this.$menu.html(listContent);
        this._setSelectedFromList();
    };

    SimpleSelect.prototype.getSelectedId = function () {
        return this.$menu.find('li[data-selected]').attr('data-id');
    };

    SimpleSelect.prototype.getSelectedValue = function () {
        return this.$menu.find('li[data-selected]').attr('data-value');
    };

    exports.default = SimpleSelect;
    module.exports = exports['default'];
});