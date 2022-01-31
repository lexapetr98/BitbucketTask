define('bitbucket/internal/bbui/pull-request-list-table/components/summary', ['module', 'exports', 'prop-types', 'react', 'bitbucket/internal/feature/pull-request/state-lozenge', 'bitbucket/internal/impl/urls', 'bitbucket/internal/util/time', 'bitbucket/internal/widget/icons/icons', '../../ref-label/ref-label'], function (module, exports, _propTypes, _react, _stateLozenge, _urls, _time, _icons, _refLabel) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _stateLozenge2 = babelHelpers.interopRequireDefault(_stateLozenge);

    var _urls2 = babelHelpers.interopRequireDefault(_urls);

    var _refLabel2 = babelHelpers.interopRequireDefault(_refLabel);

    var propTypes = {
        refCallback: _propTypes2.default.func,
        pullRequest: _propTypes2.default.object.isRequired,
        showStateLozenge: _propTypes2.default.bool
    };

    var customMapping = {
        aMomentAgo: function aMomentAgo() {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.a.moment.ago');
        },
        oneMinuteAgo: function oneMinuteAgo() {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.one.minute.ago');
        },
        xMinutesAgo: function xMinutesAgo(param) {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.x.minutes.ago', param);
        },
        oneHourAgo: function oneHourAgo() {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.one.hour.ago');
        },
        xHoursAgo: function xHoursAgo(param) {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.x.hours.ago', param);
        },
        oneDayAgo: function oneDayAgo() {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.one.day.ago');
        },
        xDaysAgo: function xDaysAgo(param) {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.x.days.ago', param);
        },
        oneWeekAgo: function oneWeekAgo() {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.one.week.ago');
        },
        absolute: function absolute(param) {
            return AJS.I18n.getText('bitbucket.pull.request.updated.date.format.absolute', param);
        }
    };

    var Summary = function (_Component) {
        babelHelpers.inherits(Summary, _Component);

        function Summary() {
            babelHelpers.classCallCheck(this, Summary);
            return babelHelpers.possibleConstructorReturn(this, (Summary.__proto__ || Object.getPrototypeOf(Summary)).apply(this, arguments));
        }

        babelHelpers.createClass(Summary, [{
            key: 'shouldComponentUpdate',
            value: function shouldComponentUpdate(newProps) {
                return this.props.pullRequest.id !== newProps.pullRequest.id || this.props.pullRequest.state !== newProps.pullRequest.state || this.props.pullRequest.title !== newProps.pullRequest.title || this.props.pullRequest.toRef.id !== newProps.pullRequest.toRef.id || this.props.pullRequest.updatedDate !== newProps.pullRequest.updatedDate || this.props.refCallback !== newProps.refCallback || this.props.showStateLozenge !== newProps.showStateLozenge;
            }
        }, {
            key: 'render',
            value: function render() {
                var _props = this.props,
                    pullRequest = _props.pullRequest,
                    refCallback = _props.refCallback,
                    showStateLozenge = _props.showStateLozenge;


                return _react2.default.createElement(
                    'td',
                    {
                        className: 'summary',
                        'data-pull-request-id': pullRequest.id,
                        'data-username': pullRequest.author.user.name
                    },
                    _react2.default.createElement(
                        'div',
                        { className: 'title-and-target-branch' },
                        showStateLozenge ? _react2.default.createElement(_stateLozenge2.default, { pullRequest: pullRequest }) : null,
                        _react2.default.createElement(
                            'a',
                            {
                                className: 'pull-request-title',
                                title: pullRequest.title,
                                href: _urls2.default.pullRequest(pullRequest),
                                ref: function ref(el) {
                                    return refCallback ? refCallback(el) : null;
                                }
                            },
                            pullRequest.title
                        ),
                        _react2.default.createElement(_icons.ArrowRightIcon, null),
                        _react2.default.createElement(
                            'span',
                            { className: 'pull-request-target-branch' },
                            _react2.default.createElement(_refLabel2.default, { scmRef: pullRequest.toRef })
                        )
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'pr-author-number-and-timestamp' },
                        _react2.default.createElement(
                            'span',
                            null,
                            pullRequest.author.user.displayName,
                            ' - #',
                            pullRequest.id,
                            ',',
                            ' '
                        ),
                        _react2.default.createElement(
                            'time',
                            {
                                title: (0, _time.format)(pullRequest.updatedDate, 'full'),
                                dateTime: (0, _time.format)(pullRequest.updatedDate, 'timestamp')
                            },
                            (0, _time.format)(pullRequest.updatedDate, 'shortAge', customMapping)
                        )
                    )
                );
            }
        }]);
        return Summary;
    }(_react.Component);

    var headerPropTypes = {
        colSpan: _propTypes2.default.number
    };

    var Header = function Header(props) {
        return _react2.default.createElement(
            'th',
            { className: 'summary', scope: 'col', colSpan: props.colSpan },
            AJS.I18n.getText('bitbucket.pull.request.table.title.summary')
        );
    };

    Header.propTypes = headerPropTypes;
    Summary.propTypes = propTypes;

    Summary.Header = Header;

    exports.default = Summary;
    module.exports = exports['default'];
});