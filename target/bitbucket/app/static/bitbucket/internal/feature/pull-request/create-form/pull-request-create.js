define('bitbucket/internal/feature/pull-request/create-form/pull-request-create', ['module', 'exports', 'baconjs', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/util/server', 'bitbucket/internal/feature/pull-request/metadata-generator/metadata-generator', 'bitbucket/internal/feature/user/user-multi-selector/user-multi-selector', 'bitbucket/internal/model/page-state', 'bitbucket/internal/util/function', 'bitbucket/internal/util/text', 'bitbucket/internal/widget/markup-editor/markup-editor', 'bitbucket/internal/widget/searchable-multi-selector/searchable-multi-selector'], function (module, exports, _baconjs, _jquery, _lodash, _navbuilder, _server, _metadataGenerator, _userMultiSelector, _pageState, _function, _text, _markupEditor, _searchableMultiSelector) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _baconjs2 = babelHelpers.interopRequireDefault(_baconjs);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _server2 = babelHelpers.interopRequireDefault(_server);

    var _metadataGenerator2 = babelHelpers.interopRequireDefault(_metadataGenerator);

    var _userMultiSelector2 = babelHelpers.interopRequireDefault(_userMultiSelector);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _text2 = babelHelpers.interopRequireDefault(_text);

    var _markupEditor2 = babelHelpers.interopRequireDefault(_markupEditor);

    var _searchableMultiSelector2 = babelHelpers.interopRequireDefault(_searchableMultiSelector);

    /**
     * Initialises the PR form
     *
     * @param parent               - A container to put the form in
     * @param submittedReviewers   - If this is a failed submission, the reviewers who should go in the box
     * @param {Bacon.Property<SourceTargetSelectorState>} selectorProperty - The current state of the branch selectors.
     * @param {Bacon.Property<string>} tabProperty - The current state of the branch selectors.
     * @param canCreatePRProperty - A stream of True/False events describing the refs in the sourceTargetSelector
     */
    function initPullRequestForm(parent, submittedReviewers, selectorProperty, tabProperty, canCreatePRProperty) {
        var destroyables = [];

        var $form = (0, _jquery2.default)(parent);

        _markupEditor2.default.bindTo($form.find('.markup-editor'));

        var currentUser = _pageState2.default.getCurrentUser();

        var urlParams = {
            avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                size: 'xsmall'
            }),
            permission: 'LICENSED_USER' // filter out non-licensed users
        };
        var dataSource = new _searchableMultiSelector2.default.PagedDataSource(_navbuilder2.default.rest().users().build(), urlParams);

        new _userMultiSelector2.default($form.find('#reviewers'), {
            initialItems: submittedReviewers,
            excludedItems: currentUser ? [currentUser.toJSON()] : [],
            dataSource: dataSource
        });

        var updateReviewerSelector = selectorProperty.onValue(function (selectorState) {
            // filter out users with no read permission to the target
            _jquery2.default.extend(urlParams, {
                'permission.1': 'REPO_READ',
                'permission.1.repositoryId': selectorState.targetRepo.id
            });
        });
        destroyables.push({ destroy: updateReviewerSelector });

        var $button = $form.find('#submit-form');

        var destroy = canCreatePRProperty.onValue(function (notEqual) {
            $button.enable(notEqual).attr('aria-disabled', !notEqual);
        });
        destroyables.push({ destroy: destroy });

        var $title = $form.find('#title');
        if ($title.val() === '') {
            var titleChangedStream = $title.asEventStream('keydown').doAction(function (e) {
                (0, _jquery2.default)(e.target).data('title-changed', true);
            });
            destroy = selectorProperty.map(_lodash2.default.flow(_function2.default.dotX('source.getDisplayId'), _text2.default.convertBranchNameToSentence.bind(_text2.default))).takeUntil(titleChangedStream).onValue($title.val.bind($title));

            destroyables.push({ destroy: destroy });
        }

        if ((0, _jquery2.default)('#pull-request-description').val() === '') {
            destroyables.push({
                destroy: initDescriptionGeneration(selectorProperty, tabProperty)
            });
        }

        destroyables.push({ destroy: initPageState(selectorProperty) });

        return {
            destroy: function destroy() {
                _lodash2.default.invokeMap(destroyables, 'destroy');
            }
        };
    }

    /**
     * Initialise the PR create form description generation.
     *
     * @param {Bacon.Property<SourceTargetSelectorState>} selectorProperty - The current state of the branch selectors.
     * @param {Bacon.Property<string>} tabProperty - The current state of the branch selectors.
     * @returns {Function} to destroy all the listeners this function setup
     */
    function initDescriptionGeneration(selectorProperty, tabProperty) {
        var allSelected = selectorProperty.filter(function (state) {
            return state.source && state.target;
        });

        var pendingXHR;

        var onRestDone = function onRestDone(data) {
            var commits = _lodash2.default.filter(data.values, function (c) {
                return c.parents.length === 1;
            });
            var commitMessages = _lodash2.default.map(commits, _function2.default.dot('message'));
            setTitleAndDescription(commitMessages);
            pendingXHR = null;
        };

        var descriptionChangedStream = (0, _jquery2.default)('#pull-request-description').asEventStream('keydown').doAction(function (e) {
            (0, _jquery2.default)(e.target).data('description-changed', true);
            if (pendingXHR) {
                pendingXHR.abort();
                pendingXHR = null;
            }
        });

        var unsubSelector = _baconjs2.default.combineAsArray(allSelected, tabProperty
        // combineAsArray seemed to produce duplicates that need to be skipped when changing tabs
        ).skipDuplicates(function (a, b) {
            return a[0] === b[0] && a[1] === b[1];
        }).takeUntil(descriptionChangedStream).slidingWindow(2, 1).map(function (states) {
            // add a third item to the state indicating if the tab states are the same as previous
            if (states.length === 1) {
                states[0].push(false);
                return states[0];
            }
            states[1].push(states[0][1] !== states[1][1]);
            return states[1];
        }).onValue(function (states) {
            var selector = states[0];
            if (pendingXHR) {
                pendingXHR.abort();
            }
            pendingXHR = updateDescriptionFromRest(selector.source, selector.target, onRestDone);
        });

        return function () {
            unsubSelector();
        };
    }

    /**
     * Makes a REST request to get the commit information to load into the description
     *
     * @param {object} source The source branch
     * @param {object} target The target branch
     * @param {Function} onRestDone A callback to call when the rest request returns
     * @returns {jqXHR}
     */
    function updateDescriptionFromRest(source, target, onRestDone) {
        var url = _navbuilder2.default.project(source.getRepository().getProject()).repo(source.getRepository()).commits().withParams({
            until: source.getLatestCommit(),
            since: target.getLatestCommit(),
            secondaryRepositoryId: target.getRepository().getId(),
            start: 0,
            limit: 10
        }).build();

        return _server2.default.rest({
            type: 'GET',
            url: url,
            statusCode: { '*': false } // fail silently.
        }).done(onRestDone);
    }

    /**
     * Sets the title and description of the Pull Request, unless they were already changed manually.
     *
     * @param {string[]} commitMessages - commit messages to extract title/description from
     */
    function setTitleAndDescription(commitMessages) {
        if (commitMessages.length === 0) {
            return;
        }

        var $title = (0, _jquery2.default)('#title');
        var $description = (0, _jquery2.default)('#pull-request-description');
        var setTitle = !$title.data('title-changed');
        var setDescription = !$description.data('description-changed');

        if (setTitle && commitMessages.length === 1) {
            var data = _metadataGenerator2.default.generateTitleAndDescriptionFromCommitMessage(commitMessages[0]);
            $title.val(data.title);
            if (setDescription) {
                $description.val(data.description).trigger('input');
            }
        } else if (setDescription) {
            // Not setting the title is ok, as one was already set from the branch name
            var description = _metadataGenerator2.default.generateDescriptionFromCommitMessages(commitMessages);
            $description.val(description).trigger('input');
        }
    }

    /**
     * Depends on sourceTargetSelector already having been initialised
     *
     * @param {Bacon.Property<SourceTargetSelectorState>} selectorProperty - The current state of the branch selectors.
     */
    function initPageState(selectorProperty) {
        _pageState2.default.extend('targetRepository');
        _pageState2.default.extend('sourceRepository');
        _pageState2.default.extend('targetBranch');
        _pageState2.default.extend('sourceBranch');

        return selectorProperty.onValue(function (state) {
            _pageState2.default.setTargetRepository(state.targetRepo);
            _pageState2.default.setSourceRepository(state.sourceRepo);

            _pageState2.default.setTargetBranch(state.target);
            _pageState2.default.setSourceBranch(state.source);
        });
    }

    var init = initPullRequestForm;

    exports.default = {
        init: init
    };
    module.exports = exports['default'];
});