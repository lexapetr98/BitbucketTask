define('bitbucket/internal/feature/pull-request/table/pull-request-table', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/util/shortcuts', 'bitbucket/internal/widget/paged-table/paged-table'], function (module, exports, _aui, _jquery, _lodash, _shortcuts, _pagedTable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var shortcuts = babelHelpers.interopRequireWildcard(_shortcuts);

    var _pagedTable2 = babelHelpers.interopRequireDefault(_pagedTable);

    var createKeyboardShortcutsHandler = shortcuts.createKeyboardShortcutsHandler;

    var PullRequestTable = function (_PagedTable) {
        babelHelpers.inherits(PullRequestTable, _PagedTable);

        function PullRequestTable(pullRequestsNavBuilder, options) {
            babelHelpers.classCallCheck(this, PullRequestTable);

            var _this = babelHelpers.possibleConstructorReturn(this, (PullRequestTable.__proto__ || Object.getPrototypeOf(PullRequestTable)).call(this, babelHelpers.extends({}, PullRequestTable.defaults, options)));

            if ((0, _lodash.isFunction)(_this.options.onClick)) {
                _this.$table.on('click', _this.options.rowSelector + ' a:first', function (e) {
                    var row = (0, _jquery2.default)(e.target).closest(_this.options.rowSelector);
                    var rowIndex = _this.$table.find(_this.options.rowSelector).index(row);
                    _this.options.onClick({ rowIndex: rowIndex });
                });
            }

            _this.pullRequestsNavBuilder = pullRequestsNavBuilder;
            return _this;
        }

        /**
         * Returns the URL used to retrieve pull requests to fill the table based on the criteria supplied at construction
         * @param {number} start index to start the page of pull requests at.
         * @param {number} limit number of pull requests to retrieve in this page.
         */


        babelHelpers.createClass(PullRequestTable, [{
            key: 'buildUrl',
            value: function buildUrl(start, limit) {
                return this.pullRequestsNavBuilder.withParams({
                    start: start,
                    limit: limit,
                    avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                        size: 'medium'
                    })
                }).build();
            }
        }, {
            key: 'focusInitialRow',
            value: function focusInitialRow() {
                var _options = this.options,
                    rowSelector = _options.rowSelector,
                    focusedClass = _options.focusedClass;

                var $focusedRow = this.$table.find(rowSelector + ':first').addClass(focusedClass);

                $focusedRow.find('a:first').focus();
            }
        }, {
            key: 'attachNewContent',
            value: function attachNewContent(data, attachmentMethod) {
                babelHelpers.get(PullRequestTable.prototype.__proto__ || Object.getPrototypeOf(PullRequestTable.prototype), 'attachNewContent', this).call(this, data, attachmentMethod);

                var isFirstTimeRender = data.start === 0;

                this.initTooltips();

                if (isFirstTimeRender) {
                    this.focusInitialRow();
                }
            }
        }, {
            key: 'handleNewRows',
            value: function handleNewRows(data, attachmentMethod) {
                var rows = (0, _jquery2.default)(data.values.map(function (pr) {
                    return bitbucket.internal.feature.pullRequest.pullRequestRow({
                        pullRequest: pr
                    });
                }).join(''));

                this.$table.show().children('tbody')[attachmentMethod !== 'html' ? attachmentMethod : 'append'](rows);
            }
        }, {
            key: 'initTooltips',
            value: function initTooltips() {
                var toolTipArgs = {
                    hoverable: false,
                    offset: 5,
                    delayIn: 0,
                    gravity: function gravity() {
                        // Always position on screen
                        return _jquery2.default.fn.tipsy.autoNS.call(this) + _jquery2.default.fn.tipsy.autoWE.call(this);
                    },

                    live: true
                };

                this.$table.find('.aui-avatar > .aui-avatar-inner > img').tooltip(toolTipArgs);
            }
        }, {
            key: 'initShortcuts',
            value: function initShortcuts(_ref) {
                var _this2 = this,
                    _createKeyboardShortc;

                var _ref$nextItemKey = _ref.nextItemKey,
                    nextItemKey = _ref$nextItemKey === undefined ? 'j' : _ref$nextItemKey,
                    _ref$prevItemKey = _ref.prevItemKey,
                    prevItemKey = _ref$prevItemKey === undefined ? 'k' : _ref$prevItemKey,
                    _ref$openItemKey = _ref.openItemKey,
                    openItemKey = _ref$openItemKey === undefined ? 'o' : _ref$openItemKey;
                var _options2 = this.options,
                    rowSelector = _options2.rowSelector,
                    focusedClass = _options2.focusedClass;


                this.shorcutsListener = createKeyboardShortcutsHandler((_createKeyboardShortc = {}, babelHelpers.defineProperty(_createKeyboardShortc, nextItemKey, function () {
                    return _this2.moveToNextItem();
                }), babelHelpers.defineProperty(_createKeyboardShortc, prevItemKey, function () {
                    return _this2.moveToPrevItem();
                }), babelHelpers.defineProperty(_createKeyboardShortc, openItemKey, function () {
                    return _this2.openFocusedItem();
                }), _createKeyboardShortc));

                (0, _jquery2.default)(rowSelector).first().addClass(focusedClass);

                window.addEventListener('keypress', this.shorcutsListener, true);
            }
        }, {
            key: 'removeShortcuts',
            value: function removeShortcuts() {
                window.removeEventListener('keypress', this.shorcutsListener, true);
            }
        }, {
            key: 'moveToNextItem',
            value: function moveToNextItem() {
                this.handleRowFocusChange(function (_ref2) {
                    var index = _ref2.index,
                        rowsSize = _ref2.rowsSize;
                    return index < rowsSize - 1 ? index + 1 : index;
                });
            }
        }, {
            key: 'moveToPrevItem',
            value: function moveToPrevItem() {
                this.handleRowFocusChange(function (_ref3) {
                    var index = _ref3.index;
                    return index > 0 ? index - 1 : index;
                });
            }
        }, {
            key: 'handleRowFocusChange',
            value: function handleRowFocusChange(getNexIndex) {
                var _options3 = this.options,
                    rowSelector = _options3.rowSelector,
                    focusedClass = _options3.focusedClass;

                var $rows = this.$table.find(rowSelector);

                var $focusedRow = $rows.filter('.' + focusedClass);
                var index = _jquery2.default.inArray($focusedRow.get(0), $rows);
                var nextIndex = getNexIndex({ index: index, rowsSize: $rows.length });
                var $nextFocusedRow = $rows.eq(nextIndex);

                if (nextIndex === index) {
                    return;
                }

                $nextFocusedRow.addClass(focusedClass);
                $focusedRow.removeClass(focusedClass);

                $nextFocusedRow.find('a:first').focus();
            }
        }, {
            key: 'openFocusedItem',
            value: function openFocusedItem() {
                var _options4 = this.options,
                    rowSelector = _options4.rowSelector,
                    focusedClass = _options4.focusedClass;

                var $focusedRow = this.$table.find(rowSelector + '.' + focusedClass);
                var $anchor = $focusedRow.find('a:first');

                $anchor[0].click();
            }
        }]);
        return PullRequestTable;
    }(_pagedTable2.default);

    PullRequestTable.defaults = {
        allFetchedMessageHtml: bitbucket.internal.widget.paragraph({
            extraClasses: 'no-more-results',
            text: _aui2.default.I18n.getText('bitbucket.web.pullrequest.allfetched')
        }),
        bufferPixels: 150,
        target: '#pull-requests-table',
        tableMessageClass: 'pull-request-table-message',
        paginationContext: 'pull-request-table',
        pageSize: 25,
        noneFoundMessageHtml: bitbucket.internal.feature.pullRequest.pullRequestTableEmpty(),
        rowSelector: '.pull-request-row',
        focusedClass: 'focused'
    };
    exports.default = PullRequestTable;
    module.exports = exports['default'];
});