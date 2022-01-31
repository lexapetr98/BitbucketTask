define('bitbucket/internal/feature/file-content/text-view/text-view-api', ['module', 'exports', 'jquery', 'lodash', 'bitbucket/internal/util/array', 'bitbucket/internal/util/deprecation', 'bitbucket/internal/util/function', 'bitbucket/internal/util/mixin', 'bitbucket/internal/util/object'], function (module, exports, _jquery, _lodash, _array, _deprecation, _function, _mixin, _object) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _jquery2 = babelHelpers.interopRequireDefault(_jquery);

    var _lodash2 = babelHelpers.interopRequireDefault(_lodash);

    var _array2 = babelHelpers.interopRequireDefault(_array);

    var _function2 = babelHelpers.interopRequireDefault(_function);

    var _mixin2 = babelHelpers.interopRequireDefault(_mixin);

    var _object2 = babelHelpers.interopRequireDefault(_object);

    /**
     * Prepare the gutter marker element before it is added to the editors.
     *
     * @param {HTMLElement} el
     * @returns {HTMLElement}
     * @private
     */
    function prepareGutterMarkerElement(el) {
        el.classList.add('bitbucket-gutter-marker');
        return el;
    }

    var internalGutters = ['add-comment-trigger', 'bitbucket-coverage', 'blame', 'CodeMirror-linewidget', 'gutter-border', 'line-number', 'line-number-from', 'line-number-to'];

    var registerGutterDeprecationLogger = (0, _deprecation.getMessageLogger)('registerGutter', 'Code Insights to show extra information on a diff', '5.16.0', '6.0.0');

    var api = {
        /**
         * Add a CSS class to a specified line
         *
         * @param {StashLineHandle} lineHandle - line handle as returned from {@link getLineHandle}
         * @param {string} whichEl - 'wrap', 'background', or 'text' to specify which element to place the class on
         * @param {string} className - the class to add.
         * @returns {StashLineHandle}
         */
        addLineClass: function addLineClass(lineHandle, whichEl, className) {
            this._editorForHandle(lineHandle).addLineClass(lineHandle._handle, whichEl, className);
            return lineHandle;
        },

        /**
         * Add a widget to the specified line
         *
         * @param {StashLineHandle} lineHandle - as returned from {@link getLineHandle}
         * @param {HTMLElement} el - the root element of the line widget
         * @param {Object} options - any options accepted by CodeMirror's equivalent method.
         * @param {number} [options.weight=100] - a weight for the widget to position it relative to other widgets
         * @returns {LineWidget} the return value of CodeMirror's equivalent method.
         */
        addLineWidget: function addLineWidget(lineHandle, el, options) {
            var _this = this;

            var editor = this._editorForHandle(lineHandle);
            var lineInfo = editor.getDoc().lineInfo(lineHandle._handle);
            var widgets = lineInfo.widgets || [];
            var widget = void 0;
            if (options.weight == null && options.insertAt != null && widgets[options.insertAt]) {
                // legacy for things using insertAt
                // give it the same weight as the widget that would come after it
                options.weight = widgets[options.insertAt].weight;
            } else {
                if (options.weight == null) {
                    // default to 100 so it goes before the separator - nothing goes after except by explicitly using weight
                    options.weight = 100;
                }
                // things added later still go after things added sooner, if weight is the same. Preserves old behavior
                var index = widgets.findIndex(function (w) {
                    return w.weight > options.weight;
                });
                options.insertAt = index === -1 ? null : index;
            }
            widget = editor.addLineWidget(lineHandle._handle, el, options);

            this.trigger('widgetAdded');
            return {
                clear: function clear() {
                    widget.off('redraw');
                    widget.clear();
                    _this.trigger('widgetCleared');
                },
                changed: function changed() {
                    widget.changed();
                    _this.trigger('widgetChanged');
                },
                onRedraw: function onRedraw(redrawnCallback) {
                    widget.on('redraw', redrawnCallback);
                },
                getHeight: function getHeight() {
                    return widget.height;
                }
            };
        },

        /**
         * Return the text on the line with the given line handle.
         *
         * @param {StashLineHandle} lineHandle as returned from {@link getLineHandle}
         * @returns {string}
         */
        getLine: function getLine(lineHandle) {
            return lineHandle._handle.text;
        },

        /**
         * @typedef {Object} LineLocator
         *
         * @property {?string} fileType
         * @property {?string} lineType
         * @property {number} lineNumber
         */

        /**
         * Retrieve a handle for a given line identified by a DOM element element or {@link LineLocator}.
         *
         * If you pass in a DOM element or jQuery object, the handle returned will be for
         * the line that element is contained within.
         *
         * @param {HTMLElement|jQuery|LineLocator} locator - a DOM element inside one of the lines in this view, or an object with locator properties
         * @returns {StashLineHandle} an object that can be used to modify or query the view about the line.
         */
        getLineHandle: function getLineHandle(locator) {
            if (locator && locator.lineNumber == null) {
                var $locator = (0, _jquery2.default)(locator);
                if (!$locator.is('.line-locator')) {
                    $locator = $locator.closest('.line').find('.line-locator');
                }
                locator = {
                    fileType: $locator.attr('data-file-type'),
                    lineType: $locator.attr('data-line-type'),
                    lineNumber: $locator.attr('data-line-number')
                };
            }

            // This check might seem excessive, but in the event where a comment was made and the whitespace ignore option
            // changed, then the lineType may no longer be correct for this comment.
            // @TODO: Find a nicer way to solve comments + ignoreWhitespace
            var handles = locator && this._internalLines[locator.lineType || 'CONTEXT'][locator.lineNumber] && this._internalLines[locator.lineType || 'CONTEXT'][locator.lineNumber].handles;

            return handles && (handles[locator.fileType] || handles.all[0]);
        },

        /**
         * Get the offset width of the gutters.
         * @returns {Array<number>} an array of gutter widths for each editor
         */
        getGutterWidth: function getGutterWidth() {
            return this._editors.map(function (editor) {
                return editor.getGutterElement().offsetWidth;
            });
        },

        operation: function operation(func) {
            if (!this._editors) {
                // already destroyed
                return;
            }

            var op = this._editors.reduce(function (fn, editor) {
                return editor.operation.bind(editor, fn);
            }, _function2.default.arity(func.bind(null), 0));

            try {
                if (!this._inOp) {
                    this._opCallbacks = [];
                    this._inOp = 0;
                }
                this._inOp++;
                return op();
            } finally {
                this._inOp--;
                if (!this._inOp) {
                    try {
                        _function2.default.applyAll(this._opCallbacks);
                    } catch (e) {
                        setTimeout(function () {
                            throw e;
                        }, 0);
                    }
                    this._opCallbacks = null;
                }
            }
        },

        /**
         * Register a gutter to be added to the diff view
         *
         * @param {string} name - The name of the gutter to register
         * @param {object} options
         * @param {number} [options.weight=0] - The weight of the gutter. This will determine where in the stack of gutters it will appear.
         * @param {DiffFileType} [options.fileType] - Used in SideBySideDiffView to determine which editor displays this gutter
         */
        registerGutter: function registerGutter(name, options) {
            options = options || {};

            if (!this._editors) {
                return; // already destroyed
            }

            if (!internalGutters.includes(name)) {
                registerGutterDeprecationLogger();
            }

            // HACK: bit of abstraction leakage with fileType so the API documentation and behavior is consistent across diff types

            var gutter = {
                name: name,
                weight: options.weight || 0,
                fileType: options.fileType
            };
            // Add the new gutter
            this._gutters.push(gutter);
            this._gutters = _object2.default.uniqueFromArray(this._gutters, ['name', 'fileType']).sort(function (a, b) {
                return a.weight - b.weight || a.name.localeCompare(b.name);
            });
            var self = this;
            this._editors.forEach(function (editor) {
                var newGutters = self._getGutters(editor._gutterFilter);
                if (!_lodash2.default.isEqual(editor.getOption('gutters'), newGutters)) {
                    editor.setOption('gutters', newGutters);
                }
            });
        },

        clearGutter: function clearGutter(name) {
            this._editors.forEach(function (editor) {
                editor.clearGutter(name);
            });
        },


        /**
         * Remove a CSS class from a specified line
         *
         * @param {StashLineHandle} lineHandle - as returned from {@link getLineHandle}
         * @param {string} whichEl - 'wrap', 'background', or 'text' to specify which element to remove the class from
         * @param {string} className - the class to remove.
         * @returns {StashLineHandle}
         */
        removeLineClass: function removeLineClass(lineHandle, whichEl, className) {
            this._editorForHandle(lineHandle).removeLineClass(lineHandle._handle, whichEl, className);
            return lineHandle;
        },

        /**
         * Set gutter element for the specified gutter at the specified line.
         *
         * @param {StashLineHandle} lineHandle - line handle as returned from {@link getLineHandle}
         * @param {string} gutterId - ID of the gutter for which to set a marker
         * @param {HTMLElement} el - element to set the gutter to.
         * @returns {StashLineHandle}
         */
        setGutterMarker: function setGutterMarker(lineHandle, gutterId, el) {
            this._editorForHandle(lineHandle).setGutterMarker(lineHandle._handle, gutterId, prepareGutterMarkerElement(el));
            return lineHandle;
        },

        /**
         * Add a CSS class to the container element. Useful for manipulating a whole gutter column at once.
         * @param {string} className
         */
        addContainerClass: function addContainerClass(className) {
            this._$container.addClass(className);
            this.refresh();
        },
        /**
         * Remove a CSS class to the container element. Useful for manipulating a whole gutter column at once.
         * @param {string} className
         */
        removeContainerClass: function removeContainerClass(className) {
            this._$container.removeClass(className);
            this.refresh();
        },

        /**
         * Refresh the editor. Useful when changes to
         */
        refresh: function refresh() {
            return undefined.refresh();
        }
    };

    // The markText API includes a lineOffset and a line. This is not a nice API. It should take in two lines for the start and end, and ignore all the offset stuff.
    // So for now it's not part of the API.
    // refresh is removed because it shouldn't be needed by plugins
    var apiMethods = Object.keys(api);
    var apiEventWhitelist = {
        // eventName: arity
        destroy: 0,
        load: 1,
        change: 1
    };

    /**
     * Setup the API that is exposed to plugin developers
     * @param {TextView} textView
     */
    function setupAPI(textView) {
        var boundEvents = {};
        textView._api = {};
        var eventAPI = {
            on: function on(eventName, f) {
                if (_lodash2.default.has(apiEventWhitelist, eventName)) {
                    if (!boundEvents[eventName]) {
                        boundEvents[eventName] = [];
                    }

                    var wrappedF = _function2.default.arity(f.bind(textView._api), apiEventWhitelist[eventName]);
                    boundEvents[eventName].push({ f: f, wrappedF: wrappedF });
                    textView.on(eventName, wrappedF);
                }
            },
            off: function off(eventName, f) {
                if (boundEvents[eventName]) {
                    // lookup wrapped function
                    var index = _array2.default.findIndex(_function2.default.dotEq('f', f))(boundEvents[eventName] || []);

                    if (index !== -1) {
                        textView.off(eventName, boundEvents[eventName][index].wrappedF);
                        boundEvents[eventName].splice(index, 1);
                    }
                }
            }
        };
        var apiArgs = [textView].concat(apiMethods);
        _lodash2.default.bindAll.apply(_lodash2.default, apiArgs);
        _lodash2.default.assign(textView._api, eventAPI, _lodash2.default.pick.apply(_lodash2.default, apiArgs));
    }

    exports.default = {
        mixInto: (0, _mixin2.default)(api).into,
        setupAPI: setupAPI
    };
    module.exports = exports['default'];
});