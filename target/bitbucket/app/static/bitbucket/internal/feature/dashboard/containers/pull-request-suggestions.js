define('bitbucket/internal/feature/dashboard/containers/pull-request-suggestions', ['exports', 'lodash', 'react', 'react-redux', 'redux', 'bitbucket/util/scheduler', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/property', '../action-creators/load-pull-request-suggestions', '../action-creators/suggestion-commits', '../components/pull-request-suggestion', '../components/pull-request-suggestion-web-section', '../selectors/pull-request-suggestions'], function (exports, _lodash, _react, _reactRedux, _redux, _scheduler, _analytics, _property, _loadPullRequestSuggestions, _suggestionCommits, _pullRequestSuggestion, _pullRequestSuggestionWebSection, _pullRequestSuggestions) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.PullRequestSuggestions = undefined;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _scheduler2 = babelHelpers.interopRequireDefault(_scheduler);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _property2 = babelHelpers.interopRequireDefault(_property);

    var _loadPullRequestSuggestions2 = babelHelpers.interopRequireDefault(_loadPullRequestSuggestions);

    var _suggestionCommits2 = babelHelpers.interopRequireDefault(_suggestionCommits);

    var _pullRequestSuggestion2 = babelHelpers.interopRequireDefault(_pullRequestSuggestion);

    var pollIntervalPromise = _property2.default.getFromProvider('dashboard.poll.pull-request-suggestions.interval');

    var PullRequestSuggestions = exports.PullRequestSuggestions = function (_Component) {
        babelHelpers.inherits(PullRequestSuggestions, _Component);

        function PullRequestSuggestions() {
            var _ref;

            var _temp, _this, _ret;

            babelHelpers.classCallCheck(this, PullRequestSuggestions);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = babelHelpers.possibleConstructorReturn(this, (_ref = PullRequestSuggestions.__proto__ || Object.getPrototypeOf(PullRequestSuggestions)).call.apply(_ref, [this].concat(args))), _this), _this.itemClick = function (suggestion) {
                var _suggestion$open = suggestion.open,
                    open = _suggestion$open === undefined ? false : _suggestion$open,
                    _suggestion$commits = suggestion.commits,
                    commits = _suggestion$commits === undefined ? [] : _suggestion$commits;


                if (!open) {
                    !commits.length && _this.props.loadPullRequestSuggestionCommits(suggestion);
                    _this.props.openPullRequestSuggestionCommits(suggestion);
                    _analytics2.default.add('dashboard.pullrequest-suggestion.expand');
                } else {
                    _this.props.closePullRequestSuggestionCommits(suggestion);
                    _analytics2.default.add('dashboard.pullrequest-suggestion.collapse');
                }
            }, _temp), babelHelpers.possibleConstructorReturn(_this, _ret);
        }

        babelHelpers.createClass(PullRequestSuggestions, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                pollIntervalPromise.done(function (pollInterval) {
                    if (pollInterval < 1) {
                        // If the interval is configured with a 0 or negative value, don't enable polling
                        return;
                    }
                    _this2.schedule = new _scheduler2.default({
                        backoff: {
                            onBlur: true,
                            onInactive: true
                        },
                        interval: pollInterval,
                        maxInterval: 10 * _scheduler.MINUTE, // keep the maxInterval value in sync with the max value mentioned in application-internal.properties
                        job: _this2.props.loadPullRequestSuggestions
                    });
                    _this2.schedule.start();
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                if (this.schedule) {
                    this.schedule.stop();
                }
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var pullRequestSuggestions = this.props.pullRequestSuggestions;

                var webSections = (0, _pullRequestSuggestionWebSection.getWebSections)();

                return _react2.default.createElement(
                    'div',
                    { className: 'dashboard-pull-request-suggestions' },
                    (0, _lodash.map)(pullRequestSuggestions, function (suggestion) {
                        return _react2.default.createElement(_pullRequestSuggestion2.default, {
                            key: suggestion.id,
                            suggestion: suggestion,
                            onClick: _this3.itemClick,
                            webSections: webSections
                        });
                    })
                );
            }
        }]);
        return PullRequestSuggestions;
    }(_react.Component);

    function mapDispatchToProps(dispatch) {
        return (0, _redux.bindActionCreators)({
            loadPullRequestSuggestions: _loadPullRequestSuggestions2.default,
            loadPullRequestSuggestionCommits: _suggestionCommits2.default,
            openPullRequestSuggestionCommits: _suggestionCommits.openPullRequestSuggestionCommits,
            closePullRequestSuggestionCommits: _suggestionCommits.closePullRequestSuggestionCommits
        }, dispatch);
    }

    function mapStateToProps(state) {
        return {
            isLoading: (0, _lodash.get)(state, 'ui.pullRequestSuggestions.meta.loading'),
            pullRequestSuggestions: (0, _pullRequestSuggestions.pullRequestSuggestionsSelector)(state)
        };
    }

    exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(PullRequestSuggestions);
});