define('bitbucket/internal/feature/inbox/inbox-dialog', ['exports', '@atlassian/aui', 'jquery', 'lodash', 'react', 'react-dom', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/util/state', 'bitbucket/internal/bbui/inbox/inbox', 'bitbucket/internal/enums'], function (exports, _aui, _jquery, _lodash, _react, _reactDom, _navbuilder, _server, _state2, _inbox, _enums) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = onReady;

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _state3 = babelHelpers.interopRequireDefault(_state2);

    var _inbox2 = babelHelpers.interopRequireDefault(_inbox);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var container = void 0;

    var InboxView = function (_Component) {
        babelHelpers.inherits(InboxView, _Component);

        function InboxView(props) {
            babelHelpers.classCallCheck(this, InboxView);

            var _this = babelHelpers.possibleConstructorReturn(this, (InboxView.__proto__ || Object.getPrototypeOf(InboxView)).call(this, props));

            _this.onMorePrsRequested = function (tableProp) {
                if (_this.state[tableProp].loading) {
                    return;
                }
                _this.setState(babelHelpers.defineProperty({}, tableProp, babelHelpers.extends({}, _this.state[tableProp], {
                    loading: true
                })));

                _server2.default.rest({
                    url: _this.getInboxResourceUrlBuilder(tableProp).build(),
                    type: 'GET',
                    statusCode: {
                        0: _this.handleError,
                        401: _this.handleError,
                        500: _this.handleError,
                        502: _this.handleError
                    }
                }).done(function (data) {
                    _this.setState(babelHelpers.defineProperty({}, tableProp, babelHelpers.extends({}, _this.state[tableProp], {
                        pullRequests: _this.state[tableProp].pullRequests.concat(data.values),
                        loading: false,
                        allFetched: data.isLastPage,
                        nextPageStart: (0, _lodash.get)(data, 'nextPageStart', 0)
                    })));
                });
            };

            _this.getInboxResourceUrlBuilder = function (tableProp) {
                var role = _this.mapTablePropToRole[tableProp];

                return _navbuilder2.default.rest().addPathComponents('inbox', 'pull-requests').withParams({
                    role: role,
                    start: _this.state[tableProp].nextPageStart,
                    limit: _this.props.pageSize,
                    avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                        size: 'medium'
                    }),
                    withAttributes: true,
                    state: 'OPEN',
                    order: 'oldest'
                });
            };

            _this.mapTablePropToRole = {
                created: _enums2.default.ParticipantRole.AUTHOR,
                reviewing: _enums2.default.ParticipantRole.REVIEWER
            };


            _this.state = {
                created: {
                    pullRequests: [],
                    allFetched: false,
                    loading: false,
                    nextPageStart: 0,
                    onMoreItemsRequested: function onMoreItemsRequested() {
                        return _this.onMorePrsRequested('created');
                    }
                },
                reviewing: {
                    pullRequests: [],
                    allFetched: false,
                    loading: false,
                    nextPageStart: 0,
                    onMoreItemsRequested: function onMoreItemsRequested() {
                        return _this.onMorePrsRequested('reviewing');
                    }
                }
            };
            return _this;
        }

        babelHelpers.createClass(InboxView, [{
            key: 'handleError',
            value: function handleError(xhr, textStatus, errorThrown, response) {
                var responseError = {};
                if (response) {
                    responseError = response.errors ? response.errors[0] : response;
                }
                _reactDom2.default.unmountComponentAtNode(container);
                (0, _jquery2.default)('#inbox .aui-inline-dialog-contents').html((0, _jquery2.default)(bitbucket.internal.inbox.error({
                    title: _aui2.default.I18n.getText('bitbucket.web.header.inbox.error.title'),
                    text: responseError.message || _aui2.default.I18n.getText('bitbucket.web.header.inbox.error.unknown')
                })));
                return false;
            }
        }, {
            key: 'render',
            value: function render() {
                var _state = this.state,
                    created = _state.created,
                    reviewing = _state.reviewing;
                var _props = this.props,
                    currentUser = _props.currentUser,
                    pageSize = _props.pageSize;


                return _react2.default.createElement(_inbox2.default, { created: created, currentUser: currentUser, pageSize: pageSize, reviewing: reviewing });
            }
        }]);
        return InboxView;
    }(_react.Component);

    function onReady(inboxContainer) {
        var currentUser = _state3.default.getCurrentUser();

        if (inboxContainer && currentUser) {
            container = inboxContainer;
            _reactDom2.default.render(_react2.default.createElement(InboxView, { currentUser: currentUser, pageSize: _inbox.DEFAULT_PAGE_SIZE }), inboxContainer);
        }
    }
});