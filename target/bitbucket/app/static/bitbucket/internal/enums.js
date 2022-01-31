define('bitbucket/internal/enums', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    /**
     * Major entity names. Add to as required
     * @type {{PROJECT: string, REPOSITORY: string, USER: string}}
     */
    var Entities = exports.Entities = Object.freeze({
        PROJECT: 'project',
        REPOSITORY: 'repository',
        USER: 'user'
    });

    /**
     * Group terms for major entities. Add to as required
     * @type {{PROJECTS: string, REPOSITORIES: string, USERS: string}}
     */
    var EntityGroups = exports.EntityGroups = Object.freeze({
        PROJECTS: 'projects',
        REPOSITORIES: 'repositories',
        USERS: 'users'
    });

    /**
     * A user type
     * @enum {string}
     */
    var UserType = exports.UserType = Object.freeze({
        NORMAL: 'NORMAL',
        SERVICE: 'SERVICE'
    });

    /**
     * A project type
     * @enum {string}
     */
    var ProjectType = exports.ProjectType = Object.freeze({
        NORMAL: 'NORMAL',
        PERSONAL: 'PERSONAL'
    });

    /**
     * The SCM type
     * @enum {string}
     */
    var ScmType = exports.ScmType = Object.freeze({
        GIT: 'git',
        HG: 'hg'
    });

    /**
     * The type of a ref
     * @enum {string}
     */
    var RefType = exports.RefType = Object.freeze({
        TAG: 'TAG',
        BRANCH: 'BRANCH'
    });

    /**
     * Pull request participant's role
     * @enum {string}
     */
    var ParticipantRole = exports.ParticipantRole = Object.freeze({
        AUTHOR: 'AUTHOR',
        REVIEWER: 'REVIEWER',
        PARTICIPANT: 'PARTICIPANT'
    });

    /**
     * Pull request Participant's approval state of the pull request
     * @enum {string}
     */
    var ApprovalStatus = exports.ApprovalStatus = Object.freeze({
        APPROVED: 'APPROVED',
        NEEDS_WORK: 'NEEDS_WORK',
        UNAPPROVED: 'UNAPPROVED'
    });

    /**
     * User's actions to add/remove themselves from a PR
     * @enum {string}
     */
    var SelfAction = exports.SelfAction = Object.freeze({
        ADD_SELF: 'ADD_SELF',
        REMOVE_SELF: 'REMOVE_SELF'
    });

    /**
     * Pull request state
     * @enum {string}
     */
    var PullRequestState = exports.PullRequestState = Object.freeze({
        OPEN: 'OPEN',
        MERGED: 'MERGED',
        DECLINED: 'DECLINED'
    });

    var BranchStability = exports.BranchStability = Object.freeze({
        STABLE: 'stable',
        UNSTABLE: 'unstable'
    });

    var MergeOutcome = exports.MergeOutcome = Object.freeze({
        CLEAN: 'CLEAN',
        CONFLICTED: 'CONFLICTED',
        UNKNOWN: 'UNKNOWN'
    });

    var RepositoryState = exports.RepositoryState = Object.freeze({
        AVAILABLE: 'AVAILABLE',
        INITIALISATION_FAILED: 'INITIALISATION_FAILED',
        INITIALISING: 'INITIALISING'
    });

    /**
     * Change types of a file changset
     *
     * @enum {string}
     */
    var ChangeTypes = exports.ChangeTypes = Object.freeze({
        ADD: 'ADD',
        COPY: 'COPY',
        DELETE: 'DELETE',
        MODIFY: 'MODIFY',
        MOVE: 'MOVE',
        RENAME: 'RENAME',
        UNKNOWN: 'UNKNOWN'
    });

    exports.default = {
        ApprovalStatus: ApprovalStatus,
        BranchStability: BranchStability,
        ChangeTypes: ChangeTypes,
        Entities: Entities,
        EntityGroups: EntityGroups,
        MergeOutcome: MergeOutcome,
        ProjectType: ProjectType,
        PullRequestState: PullRequestState,
        RefType: RefType,
        ParticipantRole: ParticipantRole,
        SelfAction: SelfAction,
        ScmType: ScmType,
        UserRole: ParticipantRole,
        UserType: UserType
    };
});