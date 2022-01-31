define('bitbucket/internal/widget/autocomplete-dialog/autocomplete-dialog', ['module', 'exports', 'backbone', 'jquery', 'lodash'], function (module, exports, _backbone, _jquery, _lodash) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _backbone2 = babelHelpers.interopRequireDefault(_backbone);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    exports.default = _backbone2.default.View.extend({
        className: 'aui-dropdown2 aui-style-default aui-dropdown2-tailed',
        initialize: function initialize() {
            var minZIndex = parseInt(this.options.minZIndex, 10);

            if (minZIndex) {
                this.$el.css('z-index', minZIndex + 1);
            }

            (0, _jquery2.default)(document.body).append(this.el);

            if (this.options.anchor) {
                this.updateAnchorPosition(this.options.anchor);
            }

            this.template = this.options.template || _jquery2.default.noop;
            this.highlighter = this.options.highlighter;
            this.collection = this.collection || new _backbone2.default.Collection();
            this.collection.bind('reset', this.render, this);
            this.render();
        },
        events: {
            'click li.result': 'onClickItem'
        },
        render: function render() {
            var results = this.collection.toJSON();
            var query = this.collection.query;
            var activeItemIndex = this.collection.indexOf(this.selectedResult);

            //Template is supplied by caller
            var $html = (0, _jquery2.default)(this.template({
                query: query,
                results: results,
                activeItemIndex: activeItemIndex >= 0 ? activeItemIndex : 0
            }));

            if (query && results.length && _lodash2.default.isFunction(this.highlighter)) {
                $html = this.highlighter($html, query);
            }

            this.$el.html($html);

            if (this.$spinner) {
                //we were spinning previously, so re-add the spinner
                this.$spinner.appendTo(this.$('ul'));
            }

            return this;
        },
        toggleSpinner: function toggleSpinner(toggle) {
            if (toggle) {
                if (!this.$spinner) {
                    this.$spinner = (0, _jquery2.default)('<li/>').addClass('spinContainer').appendTo(this.$('ul')).spin('small');
                }
            } else {
                this.$spinner && this.$spinner.spinStop().remove();
                this.$spinner = null;
            }
        },
        moveSelectionUp: function moveSelectionUp() {
            this.moveSelection(this.DIRECTION_UP);
        },
        moveSelectionDown: function moveSelectionDown() {
            this.moveSelection(this.DIRECTION_DOWN);
        },
        moveSelection: function moveSelection(direction) {
            var $items = this.$('li');

            if ($items.length <= 1) {
                return;
            }

            var $currentHighlight = $items.filter('.active');
            var index = _jquery2.default.inArray($currentHighlight.get(0), $items);
            var activeClass = 'active';

            if (direction === this.DIRECTION_DOWN ? index < $items.length - 1 : index > 0) {
                index = index + direction;
                $items.removeClass(activeClass).eq(index).addClass(activeClass);
                this.selectedResult = this.collection.at(index);
            }
        },
        getSelectedItemIndex: function getSelectedItemIndex() {
            return this.$('li.active').index();
        },
        onClickItem: function onClickItem(e) {
            this.trigger('itemSelected', this.$(e.currentTarget).index());
        },
        anchorOptions: {
            dropdownTailBufferLeft: 25, //Left margin on tail + half width of tail
            dropdownTailBufferRight: 35, //Need to shift the entire tail past the anchor when right anchored.
            viewportWidth: (0, _jquery2.default)(window).width(),
            bufferTop: 2
        },
        updateAnchorPosition: function updateAnchorPosition(anchor) {
            //Align left (dropdown extends to the right) unless it won't fit on screen.
            if (this.anchorOptions.viewportWidth - anchor.left > this.$el.outerWidth()) {
                this.$el.css({
                    top: anchor.top + this.anchorOptions.bufferTop,
                    left: anchor.left - this.anchorOptions.dropdownTailBufferLeft
                }).attr('data-dropdown2-alignment', 'left');
            } else {
                this.$el.css({
                    top: anchor.top + this.anchorOptions.bufferTop,
                    left: anchor.left - this.$el.outerWidth() + this.anchorOptions.dropdownTailBufferRight
                }).attr('data-dropdown2-alignment', 'right');
            }
        },
        DIRECTION_UP: -1,
        DIRECTION_DOWN: 1
    });
    module.exports = exports['default'];
});