define('bitbucket/internal/feature/alerts/alerts-trigger', ['module', 'exports', '@atlassian/aui', 'classnames', 'lodash', './selectors'], function (module, exports, _aui, _classnames, _lodash, _selectors) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _classnames2 = babelHelpers.interopRequireDefault(_classnames);

    var getMostSevere = function getMostSevere(alerts) {
        return (0, _lodash.get)(alerts, '0.type');
    };

    var Trigger = function () {
        function Trigger($trigger, store) {
            babelHelpers.classCallCheck(this, Trigger);

            this.$el = $trigger;
            this.stateStore = store;
            this.stateStore.subscribe(this.maybeUpdate.bind(this));
            this.render(this.getAlerts());
        }

        babelHelpers.createClass(Trigger, [{
            key: 'getAlerts',
            value: function getAlerts() {
                return (0, _selectors.alertsBySeverity)(this.stateStore.getState());
            }
        }, {
            key: 'maybeUpdate',
            value: function maybeUpdate() {
                var alerts = this.getAlerts();
                if (this.alertCount !== alerts.length || this.mostSevere !== getMostSevere(alerts)) {
                    this.render(alerts);
                }
            }
        }, {
            key: 'render',
            value: function render(alerts) {
                this.alertCount = alerts.length;
                this.mostSevere = getMostSevere(alerts);

                if (!alerts || alerts.length === 0) {
                    this.$el.attr('class', (0, _classnames2.default)('alerts-menu', {
                        hidden: !(0, _selectors.dialogOpen)(this.stateStore.getState())
                    }));
                    return this.$el.html(bitbucket.internal.feature.alerts.emptyTrigger());
                }

                var title = _aui2.default.I18n.getText('bitbucket.web.alerts.title');
                this.$el.attr('class', (0, _classnames2.default)('alerts-menu', this.mostSevere));
                this.$el.html(bitbucket.internal.feature.alerts.trigger({
                    count: this.alertCount,
                    mostSevereType: this.mostSevere,
                    title: title
                }));
            }
        }]);
        return Trigger;
    }();

    exports.default = Trigger;
    module.exports = exports['default'];
});