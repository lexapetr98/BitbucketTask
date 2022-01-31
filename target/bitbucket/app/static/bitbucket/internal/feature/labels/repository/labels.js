define('bitbucket/internal/feature/labels/repository/labels', ['exports', 'react', 'react-dom', 'bitbucket/util/events', 'bitbucket/util/state', './label-container'], function (exports, _react, _reactDom, _events, _state, _labelContainer) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.onReady = onReady;

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _reactDom2 = babelHelpers.interopRequireDefault(_reactDom);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _state2 = babelHelpers.interopRequireDefault(_state);

    var _labelContainer2 = babelHelpers.interopRequireDefault(_labelContainer);

    var isPathAtRootLevel = function isPathAtRootLevel(_ref) {
        var components = _ref.components;
        return components.length === 0;
    };

    var initEventsListeners = function initEventsListeners(_ref2) {
        var isOnRootLevelDefault = _ref2.isOnRootLevel,
            hideLabels = _ref2.hideLabels,
            showLabels = _ref2.showLabels;

        var isOnRootLevel = isOnRootLevelDefault;

        var toggleShowLabels = function toggleShowLabels() {
            if (isOnRootLevel) {
                showLabels();
            } else {
                hideLabels();
            }
        };

        // Listen for all url or view changes and trigger hide event
        var hideEvents = ['bitbucket.internal.page.filebrowser.revisionRefChanged', 'bitbucket.internal.page.filebrowser.urlChanged', 'bitbucket.internal.feature.filetable.showSpinner', 'bitbucket.internal.feature.filetable.showFind'];
        hideEvents.forEach(function (eventName) {
            return _events2.default.on(eventName, hideLabels);
        });

        // Check if we are on root directory and show labels
        _events2.default.on('bitbucket.internal.feature.filebrowser.filesChanged', function (_ref3) {
            var path = _ref3.path;

            // Convert the component from Backbone model to a value
            var components = path.getComponents();

            isOnRootLevel = isPathAtRootLevel({ components: components });

            toggleShowLabels();
        });

        _events2.default.on('bitbucket.internal.feature.filetable.hideFind', toggleShowLabels);
    };

    function onReady() {
        var isOnRootLevel = isPathAtRootLevel(_state2.default.getFilePath());
        var labelContainerElement = document.getElementById('label-list-container');
        var isEditable = labelContainerElement.dataset.editable === 'true';

        var hideLabels = function hideLabels() {
            return labelContainerElement.hidden = true;
        };
        var showLabels = function showLabels() {
            return labelContainerElement.hidden = false;
        };

        initEventsListeners({ isOnRootLevel: isOnRootLevel, hideLabels: hideLabels, showLabels: showLabels });

        if (!isOnRootLevel) {
            hideLabels();
        }

        _reactDom2.default.render(_react2.default.createElement(_labelContainer2.default, { repository: _state2.default.getRepository(), isEditable: isEditable }), labelContainerElement);
    }
});