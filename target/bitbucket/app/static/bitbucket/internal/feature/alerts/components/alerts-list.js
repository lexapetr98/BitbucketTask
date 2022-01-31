define('bitbucket/internal/feature/alerts/components/alerts-list', ['exports', 'classnames', 'prop-types', 'react', '../constants'], function (exports, _classnames, _propTypes, _react, _constants) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.AlertsList = exports.Alert = undefined;

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var Alert = exports.Alert = function Alert(props) {
        var alertKey = props.alertKey,
            anchorCallback = props.anchorCallback,
            anchorText = props.anchorText,
            anchorLink = props.anchorLink,
            closeable = props.closeable,
            closeCallback = props.closeCallback,
            description = props.description,
            title = props.title,
            type = props.type,
            onRemove = props.onRemove;

        var makeAnchor = function makeAnchor(text, link, onClick) {
            return _react2.default.createElement(
                'a',
                { href: link, onClick: onClick },
                text
            );
        };
        var makeLinkButton = function makeLinkButton(text, onClick) {
            return _react2.default.createElement(
                'button',
                { className: 'aui-button aui-button-link', onClick: onClick },
                text
            );
        };
        var callback = function callback(e) {
            if (!anchorLink) {
                e.preventDefault();
            }
            if (anchorCallback) {
                anchorCallback();
            }
        };
        var anchor = anchorText ? _react2.default.createElement(
            'p',
            null,
            anchorLink ? makeAnchor(anchorText, anchorLink, callback) : makeLinkButton(anchorText, anchorCallback)
        ) : null;
        var closeButton = closeable ? _react2.default.createElement('span', {
            className: 'aui-icon icon-close',
            role: 'button',
            tabIndex: '0',
            onClick: function onClick(e) {
                e.preventDefault();
                if (closeCallback) {
                    closeCallback();
                }
                onRemove(alertKey);
            }
        }) : null;
        return _react2.default.createElement(
            'li',
            { className: (0, _classnames2.default)('aui-message', type, { closeable: closeable }) },
            _react2.default.createElement(
                'p',
                null,
                _react2.default.createElement(
                    'strong',
                    null,
                    title
                ),
                ' ',
                description
            ),
            anchor,
            closeButton
        );
    };

    var simpleAlert = {
        alertKey: _propTypes2.default.string.isRequired,
        type: _propTypes2.default.oneOf(_constants.TYPES).isRequired,
        title: _propTypes2.default.string.isRequired,
        description: _propTypes2.default.string,
        anchorText: _propTypes2.default.string,
        anchorCallback: _propTypes2.default.func,
        anchorLink: _propTypes2.default.string,
        closeable: _propTypes2.default.bool,
        closeCallback: _propTypes2.default.func
    };

    Alert.propTypes = babelHelpers.extends({}, simpleAlert, {
        onRemove: _propTypes2.default.func.isRequired
    });

    var AlertsList = exports.AlertsList = function AlertsList(_ref) {
        var title = _ref.title,
            alerts = _ref.alerts,
            onRemove = _ref.onRemove;
        return _react2.default.createElement(
            'div',
            { className: 'alerts-list-container' },
            _react2.default.createElement(
                'h3',
                null,
                title
            ),
            _react2.default.createElement(
                'ul',
                { className: 'alerts-list' },
                alerts.map(function (alert) {
                    return _react2.default.createElement(Alert, babelHelpers.extends({ key: alert.alertKey }, alert, { onRemove: onRemove }));
                })
            )
        );
    };

    AlertsList.propTypes = {
        alerts: _propTypes2.default.arrayOf(_propTypes2.default.shape(simpleAlert)).isRequired,
        title: _propTypes2.default.string.isRequired,
        onRemove: _propTypes2.default.func.isRequired
    };
});