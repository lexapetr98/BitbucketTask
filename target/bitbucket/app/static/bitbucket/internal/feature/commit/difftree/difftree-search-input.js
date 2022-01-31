define('bitbucket/internal/feature/commit/difftree/difftree-search-input', ['module', 'exports', '@atlassian/aui', 'baconjs', 'jquery', 'lodash', 'bitbucket/internal/util/events', 'bitbucket/internal/util/function'], function (module, exports, _aui, _baconjs, _jquery, _lodash, _events, _function) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    _baconjs2.default; // TODO: Remove this once we have an annotation for checkstyle to ignore a file or specific dependencies
    function SearchInput(opts) {
        this.$el = (0, _jquery2.default)(bitbucket.internal.feature.difftree.searchInput(opts));

        this._destroyables = [];

        var $input = this.$el.find('input');
        var $deleteButton = this.$el.find('.delete-button');
        this._destroyables.push(_events2.default.chainWith($deleteButton).on('click', function (e) {
            e.preventDefault();
            $input.val('').trigger('input');
        }));
        this._destroyables.push(_events2.default.chainWith($input).on('input', function (e) {
            $deleteButton.toggle(!!this.value);
        }));
    }

    /**
     * @returns {Bacon<string>} a stream of text inputs, where blank indicates the user wants to clear the search
     */
    SearchInput.prototype.getInputs = function () {
        var clearEvents = this.$el.find('.delete-button').asEventStream('click');
        var keyup = this.$el.find('input').asEventStream('keyup');
        var keyCodeEq = _function2.default.dotEq.bind(null, 'keyCode');
        var escapeStream = keyup.filter(keyCodeEq(_aui2.default.keyCode.ESCAPE));

        var isEnterKey = keyCodeEq(_aui2.default.keyCode.ENTER);

        return keyup.filter(isEnterKey).merge(escapeStream).doAction('.preventDefault').doAction('.currentTarget.blur').filter(isEnterKey).flatMap(function (e) {
            return e.target.value;
        }).merge(clearEvents.map(_function2.default.constant(''))).skipDuplicates();
    };

    SearchInput.prototype.destroy = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    exports.default = SearchInput;
    module.exports = exports['default'];
});