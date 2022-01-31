define('bitbucket/internal/feature/labels/repository/label-container', ['module', 'exports', '@atlassian/aui', 'lodash', 'prop-types', 'react', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/util/analytics', 'bitbucket/internal/util/events', 'bitbucket/internal/util/is-in-viewport', 'bitbucket/internal/widget/adg2-react-select/adg2-react-select', './label', './label-option', './label-repositories-dialog'], function (module, exports, _aui, _lodash, _propTypes, _react, _navbuilder, _server, _analytics, _events, _isInViewport, _adg2ReactSelect, _label, _labelOption, _labelRepositoriesDialog) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _propTypes2 = babelHelpers.interopRequireDefault(_propTypes);

    var _react2 = babelHelpers.interopRequireDefault(_react);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _analytics2 = babelHelpers.interopRequireDefault(_analytics);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _label2 = babelHelpers.interopRequireDefault(_label);

    var _labelOption2 = babelHelpers.interopRequireDefault(_labelOption);

    var _labelRepositoriesDialog2 = babelHelpers.interopRequireDefault(_labelRepositoriesDialog);

    var LABEL_REGEX = /^[A-Za-z0-9\-]+$/;
    var MIN_LABEL_LENGTH = 3;
    var MAX_LABEL_LENGTH = 50;

    var LabelsContainer = function (_PureComponent) {
        babelHelpers.inherits(LabelsContainer, _PureComponent);

        function LabelsContainer(props) {
            babelHelpers.classCallCheck(this, LabelsContainer);

            var _this = babelHelpers.possibleConstructorReturn(this, (LabelsContainer.__proto__ || Object.getPrototypeOf(LabelsContainer)).call(this, props));

            _this.getReadmeListener = function (resolve) {
                return function () {
                    return resolve();
                };
            };

            _this.fetchLabels = function () {
                return new Promise(function (resolve) {
                    (0, _server.rest)({
                        url: _navbuilder2.default.rest().currentRepo().addPathComponents('labels').build()
                    }).done(function (_ref) {
                        var values = _ref.values;

                        _this.setState({
                            labels: values,
                            isDataLoaded: true
                        }, resolve);
                    });
                });
            };

            _this.editLabels = function () {
                _this.setState({
                    isEditing: true
                });
            };

            _this.stopEditingLabels = function () {
                _this.setState({
                    isEditing: false
                });
            };

            _this.onAdd = function (label) {
                _this.setState(function (prevState) {
                    return {
                        labels: [].concat(babelHelpers.toConsumableArray(prevState.labels), [label])
                    };
                });
                (0, _server.rest)({
                    url: _navbuilder2.default.rest().currentRepo().addPathComponents('labels').build(),
                    type: _server.method.POST,
                    data: label
                }).done(function (newLabel) {
                    _analytics2.default.add('stash.client.repository.label.added', {
                        'project.id': _this.state.repository.project.id,
                        'repository.id': _this.state.repository.id,
                        'label.length': newLabel.length
                    });
                });
            };

            _this.onDelete = function (label) {
                _this.setState({
                    labels: _this.state.labels.filter(function (filterLabel) {
                        return filterLabel.name !== label.name;
                    })
                });

                (0, _server.rest)({
                    url: _navbuilder2.default.rest().currentRepo().addPathComponents('labels').addPathComponents(label.name).build(),
                    type: _server.method.DELETE
                }).done(function () {
                    _analytics2.default.add('stash.client.repository.label.deleted', {
                        'project.id': _this.state.repository.project.id,
                        'repository.id': _this.state.repository.id
                    });
                });
            };

            _this.onChange = function (values) {
                var valuesAsLabels = values.map(function (value) {
                    return { name: value.value.toLowerCase() };
                });
                if (values.length > _this.state.labels.length) {
                    var added = (0, _lodash.differenceWith)(valuesAsLabels, _this.state.labels, _lodash.isEqual)[0];

                    /**  hack because of a weird bug that is caused by the react-select component **/
                    var hasWrappedLabel = added.name.match(/\"([^\"]+)\"/);
                    var label = hasWrappedLabel ? { name: hasWrappedLabel[1] } : added;
                    _this.onAdd(label);
                } else if (values.length < _this.state.labels.length) {
                    var deleted = (0, _lodash.differenceWith)(_this.state.labels, valuesAsLabels, _lodash.isEqual)[0];
                    _this.onDelete(deleted);
                }
            };

            _this.isValidNewOption = function (_ref2) {
                var label = _ref2.label;

                if (_this.hasMaxAmountOfLabels()) {
                    return false;
                }

                var hasLabelCorrectLength = label && label.length >= MIN_LABEL_LENGTH && label.length <= MAX_LABEL_LENGTH;

                return LABEL_REGEX.test(label) && hasLabelCorrectLength;
            };

            _this.getOptions = function () {
                return _this.state.labels.map(function (label) {
                    return { label: label.name, value: label.name };
                });
            };

            _this.openLabel = function (label) {
                _this.setState({
                    showingRepositoriesForLabel: label
                });
                _analytics2.default.add('stash.client.repository.label.clicked', {
                    'project.id': _this.state.repository.project.id,
                    'repository.id': _this.state.repository.id
                });
            };

            _this.hasMaxAmountOfLabels = function () {
                return _this.state.labels.length >= _this.props.maxAmountOfLabels;
            };

            _this.getNoResultsText = function () {
                if (_this.hasMaxAmountOfLabels()) {
                    return _aui.I18n.getText('bitbucket.web.label.select.add.error.maximum', _this.props.maxAmountOfLabels);
                }

                return _aui.I18n.getText('bitbucket.web.label.select.add.error.name');
            };

            _this.renderEditLink = function () {
                return _react2.default.createElement(
                    'button',
                    {
                        className: 'aui-button aui-button-link edit-labels-btn',
                        onClick: _this.editLabels
                    },
                    _react2.default.createElement(
                        'span',
                        { className: 'aui-icon aui-icon-small aui-iconfont-edit-small' },
                        _aui.I18n.getText('bitbucket.web.labels')
                    )
                );
            };

            _this.closeDialog = function () {
                _this.setState({
                    showingRepositoriesForLabel: []
                });
            };

            _this.filterLabels = function (options) {
                //we don't want anything returned in the selectlist if the max of labels is added
                if (_this.hasMaxAmountOfLabels()) {
                    return [];
                }
                return options.filter(function (label) {
                    return !(0, _lodash.includes)(_this.state.labels.map(function (label) {
                        return label.name;
                    }), label.value);
                });
            };

            _this.search = function (input, callback) {
                //don't bother searching until the user types something (which, indirectly, fixes BBSDEV-18041)
                //stop the search when the max amount of labels has been reached
                if (input.trim().length === 0 || _this.hasMaxAmountOfLabels()) {
                    callback(null, {
                        options: [],
                        complete: true
                    });
                }

                (0, _server.rest)({
                    url: _navbuilder2.default.rest().addPathComponents('labels').withParams({ prefix: input.toLowerCase() }).build()
                }).done(function (data) {
                    callback(null, {
                        options: data.values.map(function (_ref3) {
                            var name = _ref3.name;

                            return { label: name, value: name };
                        }),
                        complete: data.isLastPage
                    });
                });
            };

            _this.promptTextCreator = function (labelName) {
                return _aui.I18n.getText('bitbucket.web.label.select.new.label', labelName);
            };

            _this.onKeyDown = function (event) {
                switch (event.key.toLowerCase()) {
                    case 'escape':
                        _this.stopEditingLabels();
                        break;
                    case 'enter':
                        if (_this.hasMaxAmountOfLabels() || _this.isInputEmpty) {
                            _this.stopEditingLabels();
                        }
                        break;
                }
            };

            _this.onInputChange = function (inputValue) {
                _this.isInputEmpty = inputValue.trim().length === 0;
                return inputValue;
            };

            _this.state = {
                isEditing: false,
                labels: [],
                repository: props.repository,
                isDataLoaded: false,
                showingRepositoriesForLabel: []
            };

            _this.labelContainerRef = _react2.default.createRef();
            _this.readmePromise = new Promise(function (resolve) {
                _this.readmeListener = _this.getReadmeListener(resolve);
                _events2.default.once('bitbucket.internal.feature.readme.rendered', _this.readmeListener);
            });
            _this.isInputEmpty = true;
            return _this;
        }

        babelHelpers.createClass(LabelsContainer, [{
            key: 'componentDidMount',
            value: function componentDidMount() {
                var _this2 = this;

                Promise.all([this.fetchLabels(), this.readmePromise]).then(function () {
                    var elementIsVisibleInViewport = (0, _isInViewport.isInViewport)(_this2.labelContainerRef.current);
                    _analytics2.default.add('stash.client.repository.label.visible', {
                        'project.id': _this2.state.repository.project.id,
                        'repository.id': _this2.state.repository.id,
                        'label.visible': elementIsVisibleInViewport
                    });
                });
            }
        }, {
            key: 'componentWillUnmount',
            value: function componentWillUnmount() {
                _events2.default.off('bitbucket.internal.feature.readme.rendered', this.readmeListener);
            }
        }, {
            key: 'renderInitial',
            value: function renderInitial() {
                var _this3 = this;

                var labels = this.state.labels;
                var isEditable = this.props.isEditable;


                var hasLabels = labels.length > 0;

                return _react2.default.createElement(
                    'div',
                    { className: 'label-list' },
                    labels.map(function (_ref4) {
                        var name = _ref4.name;
                        return _react2.default.createElement(_label2.default, { key: name, label: name, onClick: _this3.openLabel });
                    }),
                    isEditable && hasLabels ? this.renderEditLink() : null,
                    isEditable && !hasLabels ? _react2.default.createElement(
                        'div',
                        { className: 'empty-labels-wrapper' },
                        _react2.default.createElement('input', {
                            type: 'text',
                            className: 'empty-labels-input',
                            onClick: this.editLabels,
                            onFocus: this.editLabels,
                            placeholder: _aui.I18n.getText('bitbucket.web.labels.empty.add')
                        })
                    ) : null
                );
            }
        }, {
            key: 'renderEditableContent',
            value: function renderEditableContent() {
                return _react2.default.createElement(
                    'div',
                    { className: 'label-editor' },
                    _react2.default.createElement(_adg2ReactSelect.ADG2SelectCreatableStateless, {
                        autoFocus: true,
                        cache: false,
                        className: 'label-select',
                        clearable: false,
                        name: 'select-label',
                        loadingPlaceholder: null,
                        onChange: this.onChange,
                        loadOptions: this.search,
                        valueComponent: _labelOption2.default,
                        openOnClick: false,
                        openOnFocus: false,
                        searchable: true,
                        isValidNewOption: this.isValidNewOption,
                        multi: true,
                        value: this.getOptions(),
                        onValueClick: this.openLabel,
                        onBlurResetsInput: false,
                        noResultsText: this.getNoResultsText(),
                        placeholder: _aui.I18n.getText('bitbucket.web.label.select.placeholder'),
                        searchPromptText: null,
                        filterOptions: this.filterLabels,
                        promptTextCreator: this.promptTextCreator,
                        onInputKeyDown: this.onKeyDown,
                        onInputChange: this.onInputChange
                    }),
                    _react2.default.createElement(
                        'div',
                        { className: 'label-edit-controls' },
                        _react2.default.createElement(
                            'button',
                            {
                                onClick: this.stopEditingLabels,
                                className: 'aui-button label-edit-close-btn'
                            },
                            _aui.I18n.getText('bitbucket.web.labels.done')
                        )
                    )
                );
            }
        }, {
            key: 'render',
            value: function render() {
                if (this.state.isDataLoaded !== true) {
                    return null;
                }

                var content = this.state.isEditing ? this.renderEditableContent() : this.renderInitial();

                return _react2.default.createElement(
                    'div',
                    { className: 'label-container', ref: this.labelContainerRef },
                    _react2.default.createElement(
                        'span',
                        { className: 'labels-title' },
                        _aui.I18n.getText('bitbucket.web.labels')
                    ),
                    content,
                    this.state.showingRepositoriesForLabel.length > 0 && _react2.default.createElement(_labelRepositoriesDialog2.default, {
                        onCancel: this.closeDialog,
                        labelName: this.state.showingRepositoriesForLabel
                    })
                );
            }
        }]);
        return LabelsContainer;
    }(_react.PureComponent);

    LabelsContainer.propTypes = {
        maxAmountOfLabels: _propTypes2.default.number,
        isEditable: _propTypes2.default.bool
    };
    LabelsContainer.defaultProps = {
        isEditable: false,
        maxAmountOfLabels: 5
    };
    exports.default = LabelsContainer;
    module.exports = exports['default'];
});