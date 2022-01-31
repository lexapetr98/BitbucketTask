define('bitbucket/internal/feature/pull-request/activity/pull-request-activity', ['module', 'exports', '@atlassian/aui', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/enums', 'bitbucket/internal/feature/comments/comments', 'bitbucket/internal/feature/file-content/file-content', 'bitbucket/internal/model/commit-range', 'bitbucket/internal/model/diff-type', 'bitbucket/internal/model/file-change', 'bitbucket/internal/model/file-content-modes', 'bitbucket/internal/model/page-state', 'bitbucket/internal/model/path', 'bitbucket/internal/model/path-and-line', 'bitbucket/internal/model/revision', 'bitbucket/internal/util/ajax', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/codemirror', 'bitbucket/internal/util/dom-event', 'bitbucket/internal/util/events', 'bitbucket/internal/util/history', 'bitbucket/internal/util/scroll', 'bitbucket/internal/util/syntax-highlight', 'bitbucket/internal/util/time-i18n-mappings', 'bitbucket/internal/widget/paged-scrollable'], function (module, exports, _aui, _jquery, _lodash, _navbuilder, _enums, _comments, _fileContent, _commitRange, _diffType, _fileChange, _fileContentModes, _pageState, _path, _pathAndLine, _revision, _ajax, _clientStorage, _codemirror, _domEvent, _events, _history, _scroll, _syntaxHighlight, _timeI18nMappings, _pagedScrollable) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _aui2 = babelHelpers.interopRequireDefault(_aui);

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _enums2 = babelHelpers.interopRequireDefault(_enums);

    var _comments2 = babelHelpers.interopRequireDefault(_comments);

    var _fileContent2 = babelHelpers.interopRequireDefault(_fileContent);

    var _commitRange2 = babelHelpers.interopRequireDefault(_commitRange);

    var _diffType2 = babelHelpers.interopRequireDefault(_diffType);

    var _fileChange2 = babelHelpers.interopRequireDefault(_fileChange);

    var _fileContentModes2 = babelHelpers.interopRequireDefault(_fileContentModes);

    var _pageState2 = babelHelpers.interopRequireDefault(_pageState);

    var _path2 = babelHelpers.interopRequireDefault(_path);

    var _pathAndLine2 = babelHelpers.interopRequireDefault(_pathAndLine);

    var _revision2 = babelHelpers.interopRequireDefault(_revision);

    var _ajax2 = babelHelpers.interopRequireDefault(_ajax);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _codemirror2 = babelHelpers.interopRequireDefault(_codemirror);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var _history2 = babelHelpers.interopRequireDefault(_history);

    var _scroll2 = babelHelpers.interopRequireDefault(_scroll);

    var _syntaxHighlight2 = babelHelpers.interopRequireDefault(_syntaxHighlight);

    var _timeI18nMappings2 = babelHelpers.interopRequireDefault(_timeI18nMappings);

    var _pagedScrollable2 = babelHelpers.interopRequireDefault(_pagedScrollable);

    var EFFECTIVE = _diffType2.default.EFFECTIVE,
        COMMIT = _diffType2.default.COMMIT,
        RANGE = _diffType2.default.RANGE;


    function bindAddGeneralCommentHandler(keys) {
        (this.execute ? this : _aui2.default.whenIType(keys)).execute(function () {
            var $form = (0, _jquery2.default)('.general-comment-form');
            _scroll2.default.scrollTo($form);
            $form.find('textarea').focus();
        });
    }

    function lastCommentDeletedHandler($container) {
        $container.closest('.diff-comment-activity, .file-comment-activity').remove();
    }

    function getPathAndLine(fileChange) {
        var path = fileChange.getPath();
        var firstHunk = fileChange.getDiff().hunks[0];
        if (!firstHunk) {
            return new _pathAndLine2.default(path);
        }

        if (firstHunk.sourceLine !== 0) {
            return new _pathAndLine2.default(path, firstHunk.sourceLine, 'FROM');
        }
        return new _pathAndLine2.default(path, firstHunk.destinationLine, 'TO');
    }

    function getPullRequestCommentLinkUrl(activity, fileChange) {
        var commentLinkUrl = _navbuilder2.default.currentPullRequest();

        if (activity.commentAnchor && activity.commentAnchor && (activity.commentAnchor.diffType === COMMIT || activity.commentAnchor.diffType === RANGE)) {
            // PR commit / range comment
            commentLinkUrl = commentLinkUrl.commit(activity.commentAnchor.toHash);

            if (fileChange) {
                // line comment
                commentLinkUrl = commentLinkUrl.change(getPathAndLine(fileChange).toString());
            }

            if (activity.commentAnchor.diffType === RANGE) {
                commentLinkUrl = commentLinkUrl.withParams({
                    since: activity.commentAnchor.fromHash
                });
            }
        } else if (activity.commentAnchor) {
            // PR effective diff comment
            var pathAndLine = fileChange ? getPathAndLine(fileChange).toString() : new _path2.default(activity.commentAnchor.path);
            commentLinkUrl = commentLinkUrl.diff().change(pathAndLine);
        }

        return commentLinkUrl.build();
    }

    function PullRequestActivity(contextSelector, pullRequest, fromType, fromId, options) {
        this._$container = (0, _jquery2.default)(contextSelector);
        this.pullRequest = pullRequest;
        this.pullRequestPathComponents = {
            projectKey: _pageState2.default.getProject().getKey(),
            repoSlug: _pageState2.default.getRepository().getSlug(),
            pullRequestId: this.pullRequest.getId()
        };
        this.fromType = fromType;
        this.fromId = fromId;
        this.dataLoadedEvent = 'bitbucket.internal.feature.pullRequestActivity.dataLoaded';

        this._$spinner = (0, _jquery2.default)('<div class="spinner"/>').insertAfter(this._$container);

        _pagedScrollable2.default.call(this, options.scrollableElement || contextSelector, {
            pageSize: 25 /* Makes a lot of git calls on each request. Fewer items => faster response. */
            , dataLoadedEvent: this.dataLoadedEvent,
            autoLoad: 'next',
            paginationContext: 'pull-request-activity'
        });
    }

    _jquery2.default.extend(PullRequestActivity.prototype, _pagedScrollable2.default.prototype);

    PullRequestActivity.prototype.init = function (options) {
        this.renderedDiffFileContents = [];
        _pagedScrollable2.default.prototype.init.call(this, options);

        this._inited = true;

        if (!this.loadedRange.isEmpty()) {
            // render the initial diffs now since attachNewContent won't be called.
            this.renderedDiffFileContents = this.renderedDiffFileContents.concat(PullRequestActivity.renderDiffs(this._$container.children('.diff-comment-activity'), options.diffCommentData, this.pullRequest));
        }

        _comments2.default.bindContext(this._$container, new _comments2.default.PullRequestAnchor(this.pullRequest));
        var self = this;

        this._reviewerSelfHandler = function (data) {
            var isAdded = data.action === 'ADD_SELF';
            self.addNewActivity({
                currentUser: _pageState2.default.getCurrentUser().toJSON(),
                pullRequest: data.pullRequest,
                isNew: true,
                activity: {
                    action: 'UPDATED',
                    createdDate: new Date(),
                    user: data.user,
                    addedReviewers: isAdded ? [data.user] : [],
                    removedReviewers: !isAdded ? [data.user] : []
                }
            });
        };

        this._reviewerStatusHandler = function (data) {
            if (data.oldState === _enums2.default.ApprovalStatus.NEEDS_WORK && data.newState === _enums2.default.ApprovalStatus.UNAPPROVED) {
                return;
            }
            self.addNewActivity({
                currentUser: _pageState2.default.getCurrentUser().toJSON(),
                pullRequest: data.pullRequest,
                activity: {
                    // the *action* for NEEDS_WORK is REVIEWED
                    action: data.newState === _enums2.default.ApprovalStatus.NEEDS_WORK ? 'REVIEWED' : data.newState,
                    createdDate: new Date(),
                    user: data.user
                }
            });
        };

        this._declineHandler = function (data) {
            self.addNewActivity({
                currentUser: _pageState2.default.getCurrentUser().toJSON(),
                pullRequest: data.pullRequest,
                activity: {
                    action: 'DECLINED',
                    createdDate: data.pullRequest.updatedDate,
                    user: data.user
                }
            });
        };

        this._pushStateIfDiffOrCommitUrl = function (e) {
            var url = (0, _jquery2.default)(e.target).prop('href');
            var sameTabUrl = _lodash2.default.startsWith(url, _navbuilder2.default.currentPullRequest().diff().buildAbsolute()) || _lodash2.default.startsWith(url, _navbuilder2.default.currentPullRequest().commit('').buildAbsolute() + '/');
            if (sameTabUrl && (0, _domEvent.openInSameTab)(e)) {
                e.preventDefault();
                window.scrollTo(0, 0);
                _history2.default.pushState(null, '', url);
            }
        };

        this._mergeHandler = function (data) {
            self.addNewActivity({
                currentUser: _pageState2.default.getCurrentUser().toJSON(),
                pullRequest: data.pullRequest,
                activity: {
                    action: 'MERGED',
                    createdDate: data.pullRequest.updatedDate,
                    user: data.user,
                    simpleMerge: true,
                    commit: data.pullRequest.properties.mergeCommit
                }
            });
        };

        this._reopenedHandler = function (data) {
            self.addNewActivity({
                currentUser: _pageState2.default.getCurrentUser().toJSON(),
                pullRequest: data.pullRequest,
                activity: {
                    action: 'REOPENED',
                    createdDate: data.pullRequest.updatedDate,
                    user: data.user
                }
            });
        };

        this._destroyables = [];
        this._destroyables.push(_events2.default.chainWith((0, _jquery2.default)(document)).on('click', '.pull-request-activity .activity-item a', this._pushStateIfDiffOrCommitUrl).on('click', '.diff-comment-activity .breadcrumbs a,' + '.rescope a.commitid,' + '.actions button.delete,' + '.comment-likes-button', function (e) {
            var eventName;
            var classList = e.target.classList;
            if (classList.contains('stub')) {
                eventName = 'overview.comment.open';
            } else if (classList.contains('commitid')) {
                eventName = 'overview.commit.open';
            } else if (classList.contains('delete')) {
                eventName = 'overview.comment.delete.clicked';
            } else if (classList.contains('comment-likes-button')) {
                eventName = 'overview.comment.like.clicked';
            }

            // Analytics event: stash.client.pullRequest.overview.comment.open
            // Analytics event: stash.client.pullRequest.overview.commit.open
            // Analytics event: stash.client.pullRequest.overview.comment.delete.clicked
            // Analytics event: stash.client.pullRequest.overview.comment.like.clicked
            if ((0, _jquery2.default)(e.target).closest('#pull-request-activity')) {
                _events2.default.trigger('bitbucket.internal.feature.pullRequest.' + eventName);
            }
        }));
        this._destroyables.push(_events2.default.chain().on('bitbucket.internal.feature.pullRequest.reopened', this._reopenedHandler).on('bitbucket.internal.feature.pullRequest.declined', this._declineHandler).on('bitbucket.internal.feature.pullRequest.merged', this._mergeHandler).on('bitbucket.internal.feature.pullRequest.reviewerStatus.changed', this._reviewerStatusHandler).on('bitbucket.internal.feature.comments.lastCommentDeleted', lastCommentDeletedHandler).on('bitbucket.internal.keyboard.shortcuts.pullrequest.addCommentHandler', bindAddGeneralCommentHandler).on('bitbucket.internal.feature.pullRequest.self.added', this._reviewerSelfHandler).on('bitbucket.internal.feature.pullRequest.self.removed', this._reviewerSelfHandler));
    };

    PullRequestActivity.prototype.reset = function () {
        _lodash2.default.invokeMap(this._destroyables, 'destroy');

        _lodash2.default.chain(this.renderedDiffFileContents).map('inlineInfo').map('fileContent').invokeMap('destroy').value();
        delete this.renderedDiffFileContents;

        _lodash2.default.invokeMap(this.fileCommentContexts, 'destroy');
        delete this.fileCommentContexts;

        _comments2.default.unbindContext(this._$container);

        _pagedScrollable2.default.prototype.reset.call(this);
        this.currentTime = undefined;
        this._inited = false;
    };

    PullRequestActivity.prototype.checkCommentIsNew = function (comment) {
        comment.isUnread = comment.updatedDate > this.lastViewed && (!_pageState2.default.getCurrentUser() || comment.author.name !== _pageState2.default.getCurrentUser().getName());

        if (comment.comments.length) {
            _lodash2.default.forEach(comment.comments, _lodash2.default.bind(this.checkCommentIsNew, this));
        }
    };

    PullRequestActivity.prototype.checkCommentActivitiesAreNew = function (activities) {
        var self = this;

        _lodash2.default.forEach(_lodash2.default.filter(activities, { action: 'COMMENTED' }), function (activity) {
            self.checkCommentIsNew(activity.comment);
        });
    };

    PullRequestActivity.prototype.requestData = function (start, limit) {
        var self = this;
        //Use permalink params only for the first page request where the current page url is clearly a permalink
        var permalinkParams = start === 0 && !_lodash2.default.isUndefined(this.fromType) && !_lodash2.default.isUndefined(this.fromId) ? { fromType: this.fromType, fromId: this.fromId } : {};

        this._$spinner.spin('large');
        return _ajax2.default.rest({
            url: _navbuilder2.default.rest().project(this.pullRequestPathComponents.projectKey).repo(this.pullRequestPathComponents.repoSlug).pullRequest(this.pullRequestPathComponents.pullRequestId).activities().withParams(_jquery2.default.extend(permalinkParams, {
                start: start,
                limit: limit,
                avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                    size: 'medium'
                }),
                markup: true
            })).build(),
            statusCode: {
                //A 404 occurs when a effective diff cannot be generated. In this case the errors object
                //contains additional information that can be used to validate this and respond appropriately.
                //This is new behavior introduced in 4.8 with the addition of zero downtime backup.
                //More commonly a 404 happens if the current URL is for a permalink and the comment or activity has
                //been deleted or activity ID is invalid
                404: function _(xhr, textStatus, errorThrown, errors, dominantError) {
                    var options = void 0;
                    var error = _lodash2.default.get(errors, 'errors.0', null);
                    if (error && error.exceptionName === 'com.atlassian.bitbucket.commit.NoSuchCommitException') {
                        options = {
                            canClose: true,
                            fallbackTitle: _aui2.default.I18n.getText('bitbucket.web.ajax.back.to.dashboard'),
                            fallbackUrl: _navbuilder2.default.dashboard().build(),
                            message: error.message,
                            shouldReload: false,
                            title: _aui2.default.I18n.getText('bitbucket.web.couldnt.find.title')
                        };
                    } else {
                        options = {
                            canClose: false,
                            fallbackTitle: _aui2.default.I18n.getText('bitbucket.web.pullrequest.activity.notfound.fallback.title'),
                            fallbackUrl: _navbuilder2.default.project(self.pullRequestPathComponents.projectKey).repo(self.pullRequestPathComponents.repoSlug).pullRequest(self.pullRequestPathComponents.pullRequestId).overview().build(),
                            shouldReload: false
                        };
                        if (self.fromType === 'activity') {
                            options.message = _aui2.default.I18n.getText('bitbucket.web.pullrequest.activity.notfound.message');
                            options.title = _aui2.default.I18n.getText('bitbucket.web.pullrequest.activity.notfound.title');
                        } else {
                            options.message = _aui2.default.I18n.getText('bitbucket.web.pullrequest.comment.notfound.message');
                            options.title = _aui2.default.I18n.getText('bitbucket.web.pullrequest.comment.notfound.title');
                        }
                    }
                    return babelHelpers.extends({}, dominantError, options);
                }
            }
        }).done(function (data, textStatus, xhr) {
            // Only set the currentTime on the first rest request for activity
            if (!self.currentTime) {
                // Use server time otherwise fallback to client time
                var currentTime = new Date(xhr.getResponseHeader('Date')).getTime();
                var lastViewedKey = _clientStorage2.default.buildKey('last-viewed', 'pull-request');

                self.currentTime = isNaN(currentTime) ? new Date().getTime() : currentTime;

                // If first time viewing, we don't want all the comments to be marked as unread
                self.lastViewed = _clientStorage2.default.getItem(lastViewedKey) || self.currentTime;
                _clientStorage2.default.setItem(lastViewedKey, self.currentTime);
            }

            self.checkCommentActivitiesAreNew(data.values);
        }).fail(function () {
            self._$spinner.spinStop();
        });
    };

    PullRequestActivity.prototype.attachContent = function attach(method, elem) {
        this._$container[method === 'html' ? 'append' : method](elem);
    };

    PullRequestActivity.prototype.decorateForFocus = function (data) {
        var isActivityPermalink = this.fromType === 'activity';
        var focusedActivityId;
        if (isActivityPermalink) {
            var activityId = parseInt(this.fromId, 10);
            _lodash2.default.some(data.values, function (activity, index) {
                if (activity.id === activityId) {
                    activity.isFocused = true;
                    focusedActivityId = activityId;
                    return true;
                }
                return false;
            });
        } else {
            var commentId = parseInt(this.fromId, 10);

            var focusComment = function focusComment(comment) {
                if (comment.id === commentId) {
                    comment.isFocused = true;
                    return true;
                } else if (comment.comments) {
                    return _lodash2.default.some(comment.comments, function (reply) {
                        return focusComment(reply);
                    });
                }
                return false;
            };

            _lodash2.default.some(data.values, function (activity, index) {
                if (activity.comment && focusComment(activity.comment)) {
                    focusedActivityId = activity.id;
                    return true;
                }
                return false;
            });
        }
        return focusedActivityId;
    };

    PullRequestActivity.prototype.onAttachFirstPermalinkPage = function (data, attachmentMethod) {
        var self = this;

        var $loadPrevious = (0, _jquery2.default)(bitbucket.internal.feature.pullRequest.loadPreviousActivities());
        this.attachContent(attachmentMethod, $loadPrevious);
        var $loadPreviousLink = $loadPrevious.find('a');

        var $topSpinner = $loadPrevious.append((0, _jquery2.default)('<div class="spinner"/>'));

        var fromId = data.previousPageStartId;
        var lastFromId = data.values[0].id;

        function loadPreviousActivities() {
            $loadPreviousLink.hide();
            $topSpinner.spin('large');

            var params = self.loadedRange.pageBefore(self.options.pageSize);
            _ajax2.default.rest({
                url: _navbuilder2.default.rest().project(self.pullRequestPathComponents.projectKey).repo(self.pullRequestPathComponents.repoSlug).pullRequest(self.pullRequestPathComponents.pullRequestId).activities().withParams(_jquery2.default.extend(params, {
                    avatarSize: bitbucket.internal.widget.avatarSizeInPx({
                        size: 'medium'
                    }),
                    markup: true
                })).build()
            }).done(function (data, textStatus, xhr) {
                self.loadedRange.add(data.start, data.size, data.isLastPage, data.nextPageStart);

                //Remove duplicates from this new previous page - this may happen
                //when loading the very first page because we've run out of activities
                var oldActivityIndex;
                _lodash2.default.some(data.values, function (activity, index) {
                    if (activity.id === lastFromId) {
                        oldActivityIndex = index;
                        return true;
                    }
                });
                var nonDuplicates = data.values.slice(0, oldActivityIndex);

                self.checkCommentActivitiesAreNew(nonDuplicates);

                //Attach new activities after the load-previous button
                self.attachActivities(nonDuplicates, function (element) {
                    $loadPrevious.after(element);
                });

                if (data.isFirstPage || self.loadedRange.reachedStart()) {
                    //Delete the tear and load previous button because we've loaded everything
                    $loadPreviousLink.unbind('click');
                    $loadPrevious.remove();
                    $topSpinner.remove();
                } else {
                    //Set up for the next load request
                    lastFromId = fromId;
                    fromId = data.previousPageStartId;
                }

                _events2.default.trigger(self.dataLoadedEvent, self, data.start, data.limit, data);
            }).always(function () {
                $topSpinner.spinStop();
                $loadPreviousLink.show();
            });
        }

        $loadPreviousLink.click(function (e) {
            e.preventDefault();
            loadPreviousActivities();
        });
    };

    PullRequestActivity.prototype.attachActivities = function (values, attach) {
        var self = this;
        var index = 0;
        var $newItems = (0, _jquery2.default)(_lodash2.default.map(values, function (activity) {
            var anchor = activity.commentAnchor;
            var commitRange = anchor ? new _commitRange2.default({
                diffType: anchor.diffType,
                pullRequest: self.pullRequest,
                untilRevision: new _revision2.default({ id: anchor.toHash }),
                sinceRevision: anchor.fromHash ? new _revision2.default({ id: anchor.fromHash }) : undefined
            }) : new _commitRange2.default({
                pullRequest: self.pullRequest,
                diffType: EFFECTIVE
            });
            var commentLinkUrl = void 0;
            if (activity.action === 'COMMENTED') {
                var repository = commitRange.getPullRequest().getToRef().getRepository();
                // if it's a line comment with a diff object, pass fileChange as a param
                var fileChange = activity.diff ? _fileChange2.default.fromDiff(activity.diff, commitRange, repository) : null;
                commentLinkUrl = getPullRequestCommentLinkUrl(activity, fileChange);
            }
            var activityItem = bitbucket.internal.feature.pullRequest.activityListItem({
                activity: activity,
                pullRequest: self.pullRequest.toJSON(),
                isNew: false,
                commitId: activity.commentAnchor && activity.commentAnchor.toHash,
                commentLink: commentLinkUrl,
                customMapping: _timeI18nMappings2.default.commentEditedAge
            });
            index++;
            return activityItem;
        }).join(''));

        // perform any syntax highlighting necessary
        // Note that this will highlight only the activity-comments and not diff-comments
        _syntaxHighlight2.default.container($newItems);

        var dataByActivityId = _lodash2.default.reduce(values, function (map, activityData) {
            map[activityData.id] = activityData;
            return map;
        }, {});

        // Must attach before rendering diffs because the diffs need to know their width.
        // We never use 'html' because we have loaded one "item" already, which is the general activity form.
        // Doing this ruins our ability to "reset" (if we every want to switch to another activity stream) after
        // we've already loaded items. We'll have to manually reset if we ever want that.
        attach($newItems);

        this.fileCommentContexts = PullRequestActivity.addBreadcrumbsAndBindFileComments($newItems.filter('.file-comment-activity'), dataByActivityId, this.pullRequest);

        var diffs = PullRequestActivity.renderDiffs($newItems.filter('.diff-comment-activity'), dataByActivityId, this.pullRequest);

        this.renderedDiffFileContents = this.renderedDiffFileContents.concat(diffs);

        this._$container.find('.pull-request-diff-outdated-lozenge').tooltip({
            gravity: 'ne'
        });

        this._$container.find('.reviewers-updated-activity .aui-avatar img').tooltip({
            gravity: 'n'
        });

        return diffs;
    };

    PullRequestActivity.prototype.attachNewContent = function (data, attachmentMethod) {
        var self = this;

        var $commentContainer = (0, _jquery2.default)('#pull-request-activity > li.comment-form-container');
        var isPermalinked = !_lodash2.default.isUndefined(this.fromId) && !_lodash2.default.isUndefined(this.fromType);
        var isCommentPermalink = this.fromType === 'comment';
        var isFirstAttach = $commentContainer.siblings().length === 0;

        var focusedActivityId;
        if (isPermalinked && isFirstAttach) {
            focusedActivityId = this.decorateForFocus(data);
        }

        if (isPermalinked && !data.isFirstPage && isFirstAttach) {
            //Only show the tear and load-previous button if we are in fact
            //permalinking, we are not permalinked to the very first activity
            //and this is the very first page of results we are showing
            this.onAttachFirstPermalinkPage(data, attachmentMethod);
        }

        var inlineInfos = this.attachActivities(data.values, function (element) {
            self.attachContent(attachmentMethod, element);
        }); //attach fn

        this._$spinner.spinStop();
        if (data.isLastPage) {
            this._$spinner.remove();
        }

        function scrollToFocused($root) {
            if (!self._inited) {
                // destroyed in the meantime.
                return;
            }

            var $focused = isCommentPermalink ? (0, _jquery2.default)('.comment.focused', $root) : (0, _jquery2.default)('.activity-item.focused', $root);
            if ($focused.length) {
                _scroll2.default.scrollTo($focused, {
                    waitForImages: true,
                    cancelIfScrolled: true,
                    duration: 400
                });
                _events2.default.trigger('bitbucket.internal.feature.pullRequestActivity.focused', null, $focused);
                return;
            }

            if (isCommentPermalink) {
                // wasn't found initially, wait until more comments are rendered.
                _events2.default.once('bitbucket.internal.feature.comments.commentContainerAdded', scrollToFocused);
            }
        }

        if (focusedActivityId != null) {
            var focusedActivityData = _lodash2.default.find(inlineInfos, {
                activityId: focusedActivityId
            });
            if (focusedActivityData) {
                focusedActivityData.inlineInfo.initPromise.done(scrollToFocused.bind(null, null));
            } else {
                scrollToFocused();
            }
        }
    };

    PullRequestActivity.renderDiffForComment = function ($container, data, pullRequest) {
        var anchor = data.commentAnchor;
        var fileContent = new _fileContent2.default($container);
        var repository = pullRequest.getToRef().getRepository();
        var isCurrent = !anchor.orphaned;
        var diffType = anchor.diffType;
        var commitRange = new _commitRange2.default({
            diffType: anchor.diffType,
            pullRequest: pullRequest,
            untilRevision: new _revision2.default({ id: anchor.toHash }),
            sinceRevision: anchor.fromHash ? new _revision2.default({ id: anchor.fromHash }) : undefined
        });
        var fileChange = _fileChange2.default.fromDiff(data.diff, commitRange, repository);
        var initPromise = fileContent.init(fileChange, {
            commentMode: _fileContent2.default.commentMode.REPLY_ONLY,
            lineComments: [data.comment],
            asyncDiffModifications: false,
            attachScroll: false,
            autoResizing: true,
            scrollStyle: 'inline',

            isExcerpt: true,
            contentMode: _fileContentModes2.default.DIFF,
            changeTypeLozenge: false, //TODO maybe we can add this later? Don't have the data now though.
            changeModeLozenge: false,
            fileIcon: true,
            breadcrumbs: true,
            scrollPaneSelector: 'self',
            pullRequestDiffLink: true,
            pullRequestDiffCurrent: isCurrent,
            diffType: diffType,
            pullRequestDiffLinkUrl: getPullRequestCommentLinkUrl(data, fileChange),
            toolbarWebFragmentLocationPrimary: 'bitbucket.pull-request.activity.diff.toolbar.primary',
            toolbarWebFragmentLocationSecondary: 'bitbucket.pull-request.activity.diff.toolbar.secondary'
        });

        return {
            fileContent: fileContent,
            initPromise: initPromise
        };
    };

    PullRequestActivity.renderDiffs = function ($diffContainers, preloadData, pullRequest) {
        var elAndDatas = [];

        // reads first (probably irrelevant for performance)
        _lodash2.default.forEach($diffContainers, function (el) {
            var activityId = Number(el.getAttribute('data-activityid'));
            elAndDatas.push({
                activityId: activityId,
                el: el,
                data: preloadData[activityId]
            });
        });

        //then writes
        return _codemirror2.default.doInOperation(function () {
            return _lodash2.default.map(elAndDatas, function (elAndData) {
                return {
                    activityId: elAndData.activityId,
                    inlineInfo: PullRequestActivity.renderDiffForComment((0, _jquery2.default)(elAndData.el).find('.detail'), elAndData.data, pullRequest)
                };
            });
        });
    };

    /**
     * Add breadcrumbs to file comment activity items and binds comment context
     * @param {jQuery} $fileCommentActivities - File comment activity jQuery elements
     * @param {Object} dataByActivityId - Preloaded activity data grouped by activity ID
     * @param {PullRequest} pullRequest - Pull request
     * @return commentContexts - Array of comment contexts created per file comment
     */
    PullRequestActivity.addBreadcrumbsAndBindFileComments = function ($fileCommentActivities, dataByActivityId, pullRequest) {
        var commentContexts = [];

        $fileCommentActivities.each(function () {
            var $el = (0, _jquery2.default)(this);
            var activityId = $el.attr('data-activityid');
            var activityData = dataByActivityId[activityId];
            var anchor = activityData.commentAnchor;

            var path = new _path2.default(anchor.path);
            var isCurrent = !(anchor && anchor.orphaned);
            var components = _lodash2.default.map(path.getComponents(), function (str) {
                return { text: str };
            });

            var urlBuilder = _navbuilder2.default.currentPullRequest();
            switch (anchor.diffType) {
                case _diffType2.default.COMMIT:
                    urlBuilder = urlBuilder.commit(anchor.toHash);
                    break;
                case _diffType2.default.RANGE:
                    urlBuilder = urlBuilder.commit(anchor.toHash).since(anchor.fromHash);
                    break;
                case _diffType2.default.EFFECTIVE:
                default:
                    urlBuilder = urlBuilder.diff();
            }

            $el.find('.breadcrumbs').append(bitbucket.internal.widget.breadcrumbs.crumbs({
                pathComponents: components,
                primaryLink: isCurrent ? urlBuilder.change(path).build() : undefined
            }));

            var fileChange = new _fileChange2.default({
                repository: _pageState2.default.getRepository(),
                commitRange: new _commitRange2.default({
                    diffType: anchor.diffType,
                    pullRequest: pullRequest,
                    untilRevision: new _revision2.default({ id: anchor.toHash }),
                    sinceRevision: anchor.fromHash ? new _revision2.default({ id: anchor.fromHash }) : undefined
                }),
                path: path
            });
            var context = _comments2.default.bindContext($el, new _comments2.default.DiffAnchor(fileChange), {
                $toolbar: $el.find('.file-toolbar'),
                commentMode: _comments2.default.commentMode.REPLY_ONLY
            });
            commentContexts.push(context);
        });

        return commentContexts;
    };

    /**
     * Adds a new activity item to the feed.
     *
     * @param {Object} opts
     * @param {StashUserJSON} opts.currentUser - the current user
     * @param {Object} opts.activity
     * @param {number} opts.activity.date - timestamp of the activity
     * @param {StashUserJSON} opts.activity.user - the user that undertook the action
     * @param {boolean} opts.activity.isFocused - is the activity focused?
     * @param {string} opts.activity.action - the type of activity
     * @param {Object} opts.pullRequest - pull request JSON
     */
    PullRequestActivity.prototype.addNewActivity = function (opts) {
        var $generalCommentForm = (0, _jquery2.default)('#pull-request-activity .comment-form-container').first();
        var $item = (0, _jquery2.default)(bitbucket.internal.feature.pullRequest.activityListItem({
            currentUser: opts.currentUser.name ? opts.currentUser : opts.currentUser.toJSON(),
            activity: opts.activity,
            pullRequest: opts.pullRequest.id ? opts.pullRequest : opts.pullRequest.toJSON(),
            isNew: true,
            customMapping: _timeI18nMappings2.default.commentEditedAge
        })).hide().insertAfter($generalCommentForm).fadeIn('slow');

        // remove the 'new' class after a few seconds so there won't
        // be a bunch of highlighed items in the feed when users interact with the page.
        setTimeout(function () {
            $item.removeClass('new');
        }, 3000);
    };

    // TODO
    PullRequestActivity.prototype.handleErrors = _jquery2.default.noop;

    exports.default = PullRequestActivity;
    module.exports = exports['default'];
});