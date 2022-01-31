define('bitbucket/internal/feature/repository/sticky-branches', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/util/navbuilder', 'bitbucket/internal/util/browser-location', 'bitbucket/internal/util/client-storage', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _navbuilder, _browserLocation, _clientStorage, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _browserLocation2 = babelHelpers.interopRequireDefault(_browserLocation);

    var _clientStorage2 = babelHelpers.interopRequireDefault(_clientStorage);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    var $fileBrowseLink;
    var $commitsLink;
    var $branchesLink;

    function onReady() {
        var pageUrl = _navbuilder2.default.parse(_browserLocation2.default.location.href);
        var browseUrl = _navbuilder2.default.currentRepo().browse().build();
        var commitsUrl = _navbuilder2.default.currentRepo().commits().build();
        var isBrowsePage = _lodash2.default.startsWith(pageUrl.path(), browseUrl); //treat all sub-pages (folders and files) like the browse page
        var isCommitsPage = pageUrl.path() === commitsUrl;
        var customRef = isBrowsePage ? pageUrl.getQueryParamValue('at') : isCommitsPage ? pageUrl.getQueryParamValue('until') : undefined;
        var resetIfNoCustomRef = isBrowsePage || isCommitsPage;
        var branchSessionKey = _clientStorage2.default.buildKey('current-branch', 'repo');
        var sessionRef = _clientStorage2.default.getSessionItem(branchSessionKey);

        $fileBrowseLink = (0, _jquery2.default)('#repository-nav-files');
        $commitsLink = (0, _jquery2.default)('#repository-nav-commits');
        $branchesLink = (0, _jquery2.default)('#repository-nav-branches');

        var isCustomRefCommit;

        // if we have a custom ref and we're on the browse page then we check if this
        // custom ref is a commit id
        if (customRef && isBrowsePage) {
            var revisionRef = (0, _jquery2.default)('[data-revision-ref]', '#repository-layout-revision-selector').data('revision-ref');
            // On the "browse" page we consider the customRef a commit id if:
            // - the branch selector is showing the same commit as our customRef
            // - the branch selector is not showing our customRef, it's a branch or tag, but the customRef is still "commit id-ish". This occurs
            //   when there is an existing branch or tag that matches the "at" commit id that clicking on "View Source" has added.
            //   The regex should never match a real branch/tag "at" as that will include "refs/{heads,tags}".
            isCustomRefCommit = revisionRef && (revisionRef.id === customRef && revisionRef.type.id === 'commit' || revisionRef.id !== customRef && (revisionRef.type.id === 'branch' || revisionRef.type.id === 'tag') && /^[0-9a-f]{7,40}$/.test(customRef));
        }

        // we don't want to use the customRef if we're on the browse page and it IS a commit id
        var useCustomRef = !(isBrowsePage && isCustomRefCommit);

        if (customRef && useCustomRef) {
            customRef = decodeURIComponent(customRef);

            if (customRef !== sessionRef) {
                //update the stored ref in the session
                _clientStorage2.default.setSessionItem(branchSessionKey, customRef);
            }

            addRefToNavLinks(customRef);
        } else if (resetIfNoCustomRef && useCustomRef) {
            // If we are on the browse or commits page, and the user visits without a ref specified,
            // even if we have a ref in the session storage, reset to the default branch and clear the session storage
            // Prevents inconsistency between nav links and branch selector (branch selector would have default branch,
            // but the nav links would link to the session ref)
            _clientStorage2.default.removeSessionItem(branchSessionKey);
        } else if (sessionRef) {
            // If we have a ref stored in the session, use it
            addRefToNavLinks(sessionRef);
        }

        _events2.default.on('bitbucket.internal.layout.branch.revisionRefChanged', function (revisionRef) {
            if (revisionRef) {
                if (!revisionRef.getIsDefault()) {
                    var refId = revisionRef.getId();

                    addRefToNavLinks(refId);
                    _clientStorage2.default.setSessionItem(branchSessionKey, refId);
                } else {
                    removeRefFromNavLinks();
                    _clientStorage2.default.removeSessionItem(branchSessionKey);
                }
            }
        });

        // Eve is not greedy with its wild card matching. We are assuming the first part
        // is page|feature|widget|layout and the second part is the name of the component
        _events2.default.on('bitbucket.internal.*.*.revisionRefRemoved', function (ref) {
            // This is definitely _not_ perfect. This can potentially incorrectly
            // match when the suffix. Ideally we would be comparing ids but often
            // branchSessionKey stores a displayId. However .refRemoved is not a
            // common action so it is safer to just clear the history.
            var branch = _clientStorage2.default.getSessionItem(branchSessionKey);
            if (branch && _lodash2.default.endsWith(ref.id, branch)) {
                removeRefFromNavLinks();
                _clientStorage2.default.removeSessionItem(branchSessionKey);
            }
        });
    }

    function addRefToNavLinks(ref) {
        if (ref) {
            $fileBrowseLink.attr('href', _navbuilder2.default.parse($fileBrowseLink.attr('href')).replaceQueryParam('at', ref));
            $commitsLink.attr('href', _navbuilder2.default.parse($commitsLink.attr('href')).replaceQueryParam('until', ref));
            $branchesLink.attr('href', _navbuilder2.default.parse($branchesLink.attr('href')).replaceQueryParam('base', ref));
        } else {
            removeRefFromNavLinks();
        }
    }

    function removeRefFromNavLinks() {
        $fileBrowseLink.attr('href', _navbuilder2.default.parse($fileBrowseLink.attr('href')).deleteQueryParam('at'));
        $commitsLink.attr('href', _navbuilder2.default.parse($commitsLink.attr('href')).deleteQueryParam('until'));
        $branchesLink.attr('href', _navbuilder2.default.parse($branchesLink.attr('href')).deleteQueryParam('base'));
    }

    exports.default = {
        onReady: onReady
    };
    module.exports = exports['default'];
});