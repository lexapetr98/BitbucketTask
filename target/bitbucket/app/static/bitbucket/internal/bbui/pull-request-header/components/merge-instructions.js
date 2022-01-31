define('bitbucket/internal/bbui/pull-request-header/components/merge-instructions', ['module', 'exports', 'prop-types', 'react', 'bitbucket/internal/enums', 'bitbucket/internal/impl/urls', '../../codeblock/codeblock'], function (module, exports, _propTypes, _react, _enums, _urls, _codeblock) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _urls2 = babelHelpers.interopRequireDefault(_urls);

    var _codeblock2 = babelHelpers.interopRequireDefault(_codeblock);

    var MergeInstructions = function (_Component) {
        babelHelpers.inherits(MergeInstructions, _Component);

        function MergeInstructions() {
            var _ref;

            babelHelpers.classCallCheck(this, MergeInstructions);

            for (var _len = arguments.length, props = Array(_len), _key = 0; _key < _len; _key++) {
                props[_key] = arguments[_key];
            }

            var _this = babelHelpers.possibleConstructorReturn(this, (_ref = MergeInstructions.__proto__ || Object.getPrototypeOf(MergeInstructions)).call.apply(_ref, [this].concat(props)));

            var sourceRepo = _this.props.pullRequest.fromRef.repository;
            var targetRepo = _this.props.pullRequest.toRef.repository;
            var sourceRemote = null;
            var targetRemote = null;

            if (sourceRepo.id !== targetRepo.id) {
                sourceRemote = _urls2.default.remote(sourceRepo);
                targetRemote = _urls2.default.remote(targetRepo);
            }

            _this.refDetails = {
                sourceBranch: _this.props.pullRequest.fromRef.displayId,
                targetBranch: _this.props.pullRequest.toRef.displayId,
                sourceRemote: sourceRemote,
                targetRemote: targetRemote
            };
            return _this;
        }

        babelHelpers.createClass(MergeInstructions, [{
            key: 'mergeSteps',
            value: function mergeSteps() {
                // Stable source branch means we have to merge the source into the target
                // (and thus remotely merging the pull request). This is also the  approach for automerge conflicts.
                if (this.props.stability === _enums.BranchStability.STABLE || this.props.isAutoMergeConflict) {
                    return _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(
                            'p',
                            null,
                            _react2.default.createElement(
                                'strong',
                                null,
                                AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step1'),
                                ' '
                            ),
                            AJS.I18n.getText('bitbucket.component.pull.request.merge.source.into.target.resolve.conflicts')
                        ),
                        _react2.default.createElement(
                            _codeblock2.default,
                            { instructionBlock: true },
                            _react2.default.createElement(
                                'line',
                                null,
                                'git checkout ',
                                this.refDetails.targetBranch
                            ),
                            _react2.default.createElement(
                                'line',
                                null,
                                'git pull',
                                ' ',
                                this.refDetails.sourceRemote ? this.refDetails.sourceRemote : 'origin',
                                ' ',
                                this.refDetails.sourceBranch
                            )
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            _react2.default.createElement(
                                'strong',
                                null,
                                AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step2'),
                                ' '
                            ),
                            AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step2.text')
                        ),
                        _react2.default.createElement(
                            _codeblock2.default,
                            { instructionBlock: true },
                            _react2.default.createElement(
                                'line',
                                null,
                                'git commit'
                            ),
                            _react2.default.createElement(
                                'line',
                                null,
                                'git push',
                                ' ',
                                this.refDetails.targetRemote ? this.refDetails.targetRemote : 'origin',
                                ' ',
                                'HEAD'
                            )
                        ),
                        _react2.default.createElement(
                            'p',
                            null,
                            _react2.default.createElement(
                                'strong',
                                null,
                                AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step3'),
                                ' '
                            ),
                            AJS.I18n.getText('bitbucket.component.pull.request.merge.merged.remotely')
                        )
                    );
                }
                // Unstable source branch means we can merge the target into the source
                return _react2.default.createElement(
                    'div',
                    null,
                    _react2.default.createElement(
                        'p',
                        null,
                        _react2.default.createElement(
                            'strong',
                            null,
                            AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step1'),
                            ' '
                        ),
                        AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step1.text')
                    ),
                    _react2.default.createElement(
                        _codeblock2.default,
                        { instructionBlock: true },
                        _react2.default.createElement(
                            'line',
                            null,
                            'git checkout ',
                            this.refDetails.sourceBranch
                        ),
                        _react2.default.createElement(
                            'line',
                            null,
                            'git pull',
                            ' ',
                            this.refDetails.targetRemote ? this.refDetails.targetRemote : 'origin',
                            ' ',
                            this.refDetails.targetBranch
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _react2.default.createElement(
                            'strong',
                            null,
                            AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step2'),
                            ' '
                        ),
                        AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step2.text')
                    ),
                    _react2.default.createElement(
                        _codeblock2.default,
                        { instructionBlock: true },
                        _react2.default.createElement(
                            'line',
                            null,
                            'git commit'
                        ),
                        _react2.default.createElement(
                            'line',
                            null,
                            'git push',
                            ' ',
                            this.refDetails.sourceRemote ? this.refDetails.sourceRemote : 'origin',
                            ' ',
                            'HEAD'
                        )
                    ),
                    _react2.default.createElement(
                        'p',
                        null,
                        _react2.default.createElement(
                            'strong',
                            null,
                            AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step3'),
                            ' '
                        ),
                        AJS.I18n.getText('bitbucket.component.pull.request.merge.help.step3.text')
                    )
                );
            }
        }, {
            key: 'render',
            value: function render() {
                var intro = AJS.I18n.getText('bitbucket.component.pull.request.merge.help.introduction');
                if (this.props.isAutoMergeConflict) {
                    intro = AJS.I18n.getText('bitbucket.component.pull.request.automerge.help.introduction');
                }
                var explanation = AJS.I18n.getText('bitbucket.component.pull.request.merge.help.introduction.unstable.source', this.refDetails.targetBranch);
                if (this.props.stability === _enums.BranchStability.STABLE || this.props.isAutoMergeConflict) {
                    explanation = AJS.I18n.getText('bitbucket.component.pull.request.merge.help.introduction.stable.source', this.refDetails.targetBranch);
                }

                return _react2.default.createElement(
                    'div',
                    { className: 'merge-instructions' },
                    _react2.default.createElement(
                        'p',
                        { className: 'intro' },
                        intro
                    ),
                    _react2.default.createElement(
                        'p',
                        { className: 'intro' },
                        explanation
                    ),
                    this.mergeSteps()
                );
            }
        }]);
        return MergeInstructions;
    }(_react.Component);

    MergeInstructions.propTypes = {
        stability: _propTypes2.default.oneOf(Object.keys(_enums.BranchStability).map(function (k) {
            return _enums.BranchStability[k];
        })),
        isAutoMergeConflict: _propTypes2.default.bool,
        pullRequest: _propTypes2.default.object.isRequired
    };
    MergeInstructions.defaultProps = {
        stability: _enums.BranchStability.STABLE
    };
    exports.default = MergeInstructions;
    module.exports = exports['default'];
});