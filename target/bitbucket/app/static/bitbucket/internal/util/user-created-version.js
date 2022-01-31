define('bitbucket/internal/util/user-created-version', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var RAW_VERSION = exports.RAW_VERSION = WRM.data.claim('com.atlassian.bitbucket.server.bitbucket-web:user-created-version.data') || '';

    /**
     * Parse a version string in to an array of numbers.
     * @param {string} version - a dot-separated string of numbers
     * @returns {Array<number>}
     */
    var parseVersion = function parseVersion(version) {
        return version.split('.').map(function (v) {
            return Math.abs(parseInt(v));
        });
    };

    /**
     * Map a version array or string to a map with a major, minor, patch prop
     * @param {Array<number>|string} version
     * @returns {{major: number, minor: number, patch: number}}
     */
    var mapVersion = exports.mapVersion = function mapVersion(version) {
        if (typeof version === 'string') {
            version = parseVersion(version);
        }

        return {
            major: version[0] || 0,
            minor: version[1] || 0,
            patch: version[2] || 0
        };
    };

    /**
     * The mapped version at which the current user was created
     * @type {{major: number, minor: number, patch: number}}
     */
    var userCreatedVersion = exports.userCreatedVersion = mapVersion(RAW_VERSION);

    /**
     * Check if the current user has been created before the given target version
     *
     * @param {string} targetVersion - a version string in the format "1.2.3", i.e. "Major.Minor.Patch"
     * @returns {boolean}
     */
    var userCreatedBefore = exports.userCreatedBefore = function userCreatedBefore(targetVersion) {
        var mappedTargetVersion = mapVersion(targetVersion);
        // if major is less
        if (userCreatedVersion.major < mappedTargetVersion.major) {
            return true;
        }
        // if majors are the same but minor is less
        if (userCreatedVersion.major === mappedTargetVersion.major && userCreatedVersion.minor < mappedTargetVersion.minor) {
            return true;
        }

        // if majors and minors are the same but patch is less
        if (userCreatedVersion.major === mappedTargetVersion.major && userCreatedVersion.minor === mappedTargetVersion.minor && userCreatedVersion.patch < mappedTargetVersion.patch) {
            return true;
        }

        return false;
    };
});