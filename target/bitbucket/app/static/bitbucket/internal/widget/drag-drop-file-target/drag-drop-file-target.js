define('bitbucket/internal/widget/drag-drop-file-target/drag-drop-file-target', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/events'], function (module, exports, _jquery, _lodash, _events) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _events2 = babelHelpers.interopRequireDefault(_events);

    function DragDropFileTarget(el, opts) {
        return this.init.apply(this, arguments);
    }

    DragDropFileTarget.prototype.getDefaults = function () {
        return {
            activeDropTargetClass: 'active-drop-target',
            uploadPrompt: 'Drag a file here to upload',
            clientFileHandler: null
        };
    };

    DragDropFileTarget.prototype.init = function (el, opts) {
        _lodash2.default.bindAll(this, 'onDragOver', 'onDragEnd', 'onDrop');

        this.$target = (0, _jquery2.default)(el);
        this.options = _jquery2.default.extend({}, this.getDefaults(), opts);

        this.$target.attr('data-upload-prompt', this.options.uploadPrompt);

        this._destroyables = [];
        //bind drag & drop events
        this._destroyables.push(_events2.default.chainWith(this.$target).on('dragover', this.onDragOver).on('dragleave', this.onDragEnd).on('dragend', this.onDragEnd).on('drop', this.onDrop));
    };

    DragDropFileTarget.prototype.onDragOver = function (e) {
        e.preventDefault();
        this.$target.addClass(this.options.activeDropTargetClass);
    };

    DragDropFileTarget.prototype.onDragEnd = function (e) {
        e.preventDefault();
        this.$target.removeClass(this.options.activeDropTargetClass);
    };

    DragDropFileTarget.prototype.onDrop = function (e) {
        e.preventDefault();
        e.originalEvent.preventDefault();

        this.$target.removeClass(this.options.activeDropTargetClass);

        if (this.options.clientFileHandler) {
            this.options.clientFileHandler.handleFiles(e.originalEvent.dataTransfer.files, e.originalEvent.target);
        }
    };

    DragDropFileTarget.prototype.destroy = function () {
        this.$target.removeAttr('data-upload-prompt');
        this.$target.removeClass(this.options.activeDropTargetClass);

        _lodash2.default.invokeMap(this._destroyables, 'destroy');
    };

    exports.default = DragDropFileTarget;
    module.exports = exports['default'];
});