define('bitbucket/internal/util/codemirror', ['module', 'exports', 'codemirror'], function (module, exports, _codemirror) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _codemirror2 = babelHelpers.interopRequireDefault(_codemirror);

    var operationCodeMirror = null;

    /**
     * Runs an operation inside a CodeMirror operation
     *
     * Useful for batching multiple operations together so endOperation() is only called once.
     *
     * @param {Function} op - The function to run in the CodeMirror operation.
     * @returns {*} the result of `op()`
     */
    function doInOperation(op) {
        if (operationCodeMirror === null) {
            var el = document.createElement('div');
            operationCodeMirror = (0, _codemirror2.default)(el);
        }
        return operationCodeMirror.operation(op);
    }

    exports.default = {
        doInOperation: doInOperation
    };
    module.exports = exports['default'];
});