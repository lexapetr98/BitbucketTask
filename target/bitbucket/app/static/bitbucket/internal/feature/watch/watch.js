define('bitbucket/internal/feature/watch/watch', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/events'], function (module, exports, _aui, _jquery, _lodash, _pageState, _ajax, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function Watch($watchButton, url) {
        var self = this;
        this.url = url;
        this.$watch = $watchButton;
        this.isWatching = _pageState2.default.getIsWatching();

        this.$watch.on('click', triggerClicked);

        _lodash2.default.bindAll(this, 'toggleWatch', 'toggleUnwatch', 'toggleTrigger');

        function triggerClicked(e, additionalOptions) {
            e.preventDefault();

            var newState = !self.isWatching; // newState is optimistic
            self.toggleTrigger(newState);

            return _ajax2.default.rest({
                url: self.url,
                type: self.isWatching ? 'DELETE' : 'POST',
                statusCode: {
                    401: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                        return _jquery2.default.extend({}, dominantError, {
                            title: _aui2.default.I18n.getText('bitbucket.web.watch.default.error.401.title'),
                            message: _aui2.default.I18n.getText('bitbucket.web.watch.default.error.401.message'),
                            fallbackUrl: false,
                            shouldReload: true
                        });
                    },
                    409: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                        return _jquery2.default.extend({}, dominantError, {
                            title: _aui2.default.I18n.getText('bitbucket.web.watch.default.error.409.title'),
                            fallbackUrl: false,
                            shouldReload: true
                        });
                    }
                }
            }).done(function () {
                self.isWatching = newState;
                _pageState2.default.setIsWatching(newState);
                var eventName = self.isWatching ? 'bitbucket.internal.web.watch-button.added' : 'bitbucket.internal.web.watch-button.removed';
                var options = _jquery2.default.extend({ watched: self.isWatching }, additionalOptions);
                _events2.default.trigger(eventName, self, options);
            }).fail(function () {
                self.toggleTrigger(self.isWatching); // Revert trigger to actual state
            });
        }
    }

    /**
     * Sets the isWatching state and sets the trigger label text
     * @param isWatching
     */
    Watch.prototype.setIsWatching = function (isWatching) {
        this.toggleTrigger(isWatching);
        this.isWatching = isWatching;
        if (_pageState2.default.getIsWatching() !== isWatching) {
            _pageState2.default.setIsWatching(isWatching);
        }
    };

    Watch.prototype.toggleWatch = function () {
        this.toggleTrigger(true);
    };

    Watch.prototype.toggleUnwatch = function () {
        this.toggleTrigger(false);
    };

    /**
     * Toggles the icon and label text for the watching trigger. Does not change isWatching state.
     * @param isWatching - If true, label will be "Unwatch ..". If false, label will be "Watch .."
     */
    Watch.prototype.toggleTrigger = function (isWatching) {
        this.$watch.fadeOut(200, function () {
            var $el = (0, _jquery2.default)(this);
            $el.find('.aui-icon').toggleClass('aui-iconfont-watch', isWatching).toggleClass('aui-iconfont-unwatch', !isWatching).end().find('.watch-text').html(bitbucket.internal.feature.watch.commitLabel({ isWatching: isWatching }));
            $el.fadeIn(200);
        });
    };

    Watch.prototype.destroy = function () {
        this.url = null;
        this.$watch = null;
        this.isWatching = null;
    };

    exports.default = Watch;
    module.exports = exports['default'];
});