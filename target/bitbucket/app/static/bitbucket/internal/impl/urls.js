define('bitbucket/internal/impl/urls', ['module', 'exports', 'bitbucket/util/navbuilder', 'bitbucket/internal/bbui/javascript-errors/javascript-errors', 'bitbucket/internal/bbui/urls/urls', 'bitbucket/internal/util/object'], function (module, exports, _navbuilder, _javascriptErrors, _urls, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _navbuilder2 = babelHelpers.interopRequireDefault(_navbuilder);

    var _javascriptErrors2 = babelHelpers.interopRequireDefault(_javascriptErrors);

    var _urls2 = babelHelpers.interopRequireDefault(_urls);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    /* globals bitbucket_help_url:false */
    function Urls() {
        _urls2.default.call(this);
    }

    _object2.default.inherits(Urls, _urls2.default);

    var fileChanges = function fileChanges(repository, commitRange) {
        //throw new NotImplementedError();
    };

    Urls.prototype.avatarUrl = function (person, size) {
        return _navbuilder2.default._avatarUrl(person, size).build();
    };

    Urls.prototype.pullRequest = function (pullRequest) {
        return _navbuilder2.default.currentRepo().pullRequest(pullRequest).build();
    };

    Urls.prototype.inboxPullRequest = function (proj, repo, pullRequest) {
        return _navbuilder2.default.project(proj).repo(repo).pullRequest(pullRequest).build();
    };

    Urls.prototype.createPullRequest = function (repository) {
        return _navbuilder2.default.project(repository.project).repo(repository).createPullRequest().build();
    };

    Urls.prototype.allPullRequests = function (repository, state) {
        if (state) {
            return _navbuilder2.default.project(repository.project).repo(repository).allPullRequests().state(state).build();
        }
        return _navbuilder2.default.project(repository.project).repo(repository).allPullRequests().build();
    };

    Urls.prototype.help = function (key) {
        switch (key) {
            case 'help.mirroring.clone.dialog':
                return bitbucket_help_url('bitbucket.help.mirroring.clone.dialog');
            case 'help.mirroring.getting.started':
                return bitbucket_help_url('bitbucket.help.mirroring.getting.started');
            case 'help.mirroring.setup':
                return bitbucket_help_url('bitbucket.help.mirroring.setup.guide');
            case 'help.pull.request':
                return bitbucket_help_url('bitbucket.help.pull.request');
            case 'help.search.guide':
                return bitbucket_help_url('bitbucket.go.search.guide'); // TODO replace with 'bitbucket.help' link prior to GA
            case 'help.search.troubleshoot':
                return bitbucket_help_url('bitbucket.go.search.troubleshoot'); // TODO replace with 'bitbucket.help' link prior to GA
            case 'help.search.query':
                return bitbucket_help_url('bitbucket.go.search.query'); // TODO replace with 'bitbucket.help' link prior to GA
            default:
                throw new _javascriptErrors2.default.NotImplementedError();
        }
    };

    Urls.prototype.search = function (terms) {
        return _navbuilder2.default.search(terms).build();
    };

    Urls.prototype.project = function (project) {
        return _navbuilder2.default.project(project).build();
    };

    Urls.prototype.repo = function (repository) {
        return _navbuilder2.default.project(repository.project).repo(repository).build();
    };

    Urls.prototype.user = function (user) {
        return _navbuilder2.default.user(user.slug).build();
    };

    Urls.prototype.remote = function (repository) {
        return _navbuilder2.default.project(repository.project.key).repo(repository.slug).clone(repository.scmId).buildAbsolute();
    };

    exports.default = new Urls();
    module.exports = exports['default'];
});