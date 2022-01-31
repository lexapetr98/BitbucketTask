(function(window) {
    /* global require: true, define: true */

    'use strict';

    // Almond claims to be AMD compatible, but isn't.
    delete define.amd;

    //  List of special cases in our AMD shims
    var internalModules = ['@atlassian/aui', 'bacon', 'resemble'];

    function warnOnInternalUse(name, deps) {
        var isInternal = (name.indexOf('bitbucket/') === 0 ||
            name.indexOf('bitbucket-plugin-') === 0 ||
            internalModules.indexOf(name) !== -1
        );

        if (!isInternal) {
            var restrictedDeps = deps.filter(function (dep) {
                return dep.indexOf('bitbucket/internal') === 0;
            });
            if (restrictedDeps.length > 0) {
                var msg = name === 'require' ?
                    "Internal modules "  + restrictedDeps.join(', ') +  " should not be require()'d." :
                    'AMD module ' + name + ' should not depend on internal module(s) ' + restrictedDeps.join(', ') + '.';
                console.warn(msg +
                    ' This will stop working in Bitbucket Server 6.0. See the API changelog for details: ' +
                    'https://developer.atlassian.com/server/bitbucket/reference/api-changelog/#expected-future-changes');
            }
        }
    }

    var oldRequire = require;
    var logged = false;
    require = function(modules, cb) {
        if (typeof modules === 'string' && typeof cb === 'function') {
            if (!logged) {
                logged = true;
                console.log('WARN: require(string, function) has been deprecated in 2.11 and will throw an error' +
                    ' in 6.0. Use an array of dependencies - require(Array<string> function). (requiring '  + modules + ')');
            }
            modules = [modules];
        }

        // to enable this, I have to refactor us away from using HTML as our starting point and instead have JS as our starting point.
        //
        //if (false && modules) {
        //    warnOnInternalUse('require', Array.isArray(modules) ? modules : [modules]);
        //}

        //only allow the use of a callback as the second param, don't expose any other almond internal params.
        //https://github.com/requirejs/almond/blob/0.3.0/almond.js#L337
        if (cb && typeof cb !== 'function') {
            cb = undefined;
        }
        return oldRequire.call(window, modules, cb);
    };

    var oldDefine = define;
    define = function(name, deps, callback) {
        // duplicate logic from Almond to check if deps is a callback (ie. no dependencies)
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        warnOnInternalUse(name, deps);

        var requireIndex = deps.indexOf('require');
        if (requireIndex !== -1) {
            var oldCallback = callback;
            callback = function() {
                var oldRequire = arguments[requireIndex];
                arguments[requireIndex] = function(modules) {
                    if (modules) {
                        warnOnInternalUse(name, Array.isArray(modules) ? modules : [modules]);
                    }
                    return oldRequire.apply(this, arguments);
                };
                return oldCallback.apply(this, arguments);
            };
        }

        return oldDefine.call(window, name, deps, callback);
    };

    window.requireLite = require; // Used for testing
    window.defineLite = define; // Used for testing
})(window || this);
