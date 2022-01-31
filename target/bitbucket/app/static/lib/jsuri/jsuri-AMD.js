define('lib/jsuri', ['lib/jsuri-raw'], function(Uri) {

    // shim the old methods from 1.1.1 onto 1.3.1
    var oldQuery = Uri.prototype.query;

    var Query = window.Query = function Query(uriOrStr) {
        if (typeof uriOrStr === 'string') {
            this._uri = new Uri();
            this._uri.query(uriOrStr);
        } else if (uriOrStr instanceof Uri) {
            this._uri = uriOrStr;
        } else {
            throw new Error('Invalid argument to Query');
        }
    };
    Query.prototype.toString = function() {
        return oldQuery.call(this._uri);
    };
    Query.prototype.addParam = function(key, value) {
        this._uri.addQueryParam(key, value);
        return this;
    };
    Query.prototype.replaceParam = function(key, value) {
        this._uri.replaceQueryParam(key, value);
        return this;
    };
    Query.prototype.deleteParam = function(key) {
        this._uri.deleteQueryParam(key);
        return this;
    };
    Query.prototype.getParamValue = function(key) {
        return this._uri.getQueryParamValue(key);
    };
    Query.prototype.getParamValues = function(key) {
        return this._uri.getQueryParamValues(key);
    };

    Uri.prototype.query = function() {
        oldQuery.apply(this, arguments);
        return new Query(this);
    };

    return Uri;
});
