'use strict';

/* global WebFragments:true, AJS:false */
/**
 * This API is currently for internal use only. It is subject to change and shouldn't be used in plugins.
 *
 * @api private
 */
window.WebFragments = function () {
    var has = Object.prototype.hasOwnProperty;

    var descriptors = {
        item: {},
        section: {},
        panel: {}
    };

    var getKeys = function getKeys(o) {
        var keys = [];
        for (var key in o) {
            if (has.call(o, key)) {
                keys.push(key);
            }
        }
        return keys;
    };

    // extend an object with properties from another
    function extend(a) {
        var extenders = Array.prototype.slice.call(arguments, 1);
        var i = void 0;
        var ii = extenders.length;
        for (i = 0; i < ii; i++) {
            var b = extenders[i];
            if (b) {
                var keys = getKeys(b);
                var j = void 0;
                var jj = keys.length;
                for (j = 0; j < jj; j++) {
                    var key = keys[j];
                    a[key] = b[key];
                }
            }
        }
        return a;
    }

    var addDynamicServerData = void 0;
    if (!window._PageDataPlugin || !_PageDataPlugin.ready) {
        addDynamicServerData = function addDynamicServerData(descriptor) {
            return descriptor;
        };
    } else {
        addDynamicServerData = function addDynamicServerData(descriptor) {
            _PageDataPlugin.ready(descriptor.completeModuleKey, descriptor.location, function (data) {
                if (has.call(data, 'serverCondition')) {
                    descriptor.serverCondition = data.serverCondition;
                }
                if (has.call(data, 'serverContext')) {
                    descriptor.serverContext = data.serverContext;
                }
            });
        };
    }

    // functions for creating example web fragments. These are enabled when the url contains a
    // web.items, web.panels, or web.sections query string parameter
    var examples = {
        item: function item(location, context) {
            return {
                url: '#example-web-item-url',
                pluginKey: 'org.example.plugins',
                moduleKey: 'example-web-item',
                completeModuleKey: 'org.example.plugins:example-web-item',
                linkText: 'Client Web Item: ' + location,
                hasTooltip: true,
                tooltip: 'Client Context Items: ' + getKeys(context).join(', '),
                hasIcon: false,
                iconUrl: null,
                iconWidth: 0,
                iconHeight: 0,
                styleClass: 'plugin-point',
                linkId: null,
                description: null,
                params: {},
                type: 'ITEM',
                weight: 1000
            };
        },
        section: function section(location, context) {
            return {
                name: 'example-web-section',
                key: 'example-web-section',
                location: location,
                labelText: 'Client Web Section: ' + location,
                type: 'SECTION',
                params: {},
                weight: 1000
            };
        },
        panel: function panel(location, context) {
            return {
                view: '<div class="plugin-point web-panel">' + '<strong>Client Web Panel</strong>: ' + location + '<br />' + '<strong>Client Context Items</strong>: ' + getKeys(context).join(', ') + '</div>',
                weight: 1000
            };
        }
    };

    // whether an example fragment of the given type should be included
    function shouldIncludeExample(type, location) {
        return (
            // eslint-disable-next-line lodash/prefer-includes
            location.indexOf('bitbucket.internal.') === -1 && new RegExp('[\\?&]web\\.' + type + 's(=|&|$)').test(window.location.search)
        );
    }

    // This function is used for reading values from a web fragment descriptor.
    // If the value of the property is a function, it is executed with the given context, and the return value is used as the value of the property.
    // if the value is not a function, it is returned as-is.
    function getValue(expr, context) {
        return typeof expr === 'function' ? expr(extend({}, context)) : expr;
    }

    // This function takes in a descriptor, and returns a concrete fragment object that has been evaluated with the given context,
    // ready to be displayed on the page.
    // While any property may be a funciton that is evaluated with the given context, there are two special properties that are checked first:
    // If provided, context-provider's return value is used as the context for the other properties.
    // If provided, the fragment won't be rendered if the condition property evaluates to falsy.
    function toFragment(descriptor, context, type) {
        var keys = void 0;
        var key = void 0;
        var i = void 0;
        var ii = void 0;
        var fragment = {
            type: type.toUpperCase()
        };

        if (has.call(descriptor, 'serverCondition') && !descriptor.serverCondition) {
            return null;
        }

        context = extend({}, context, descriptor.serverContext, descriptor.params);

        if (has.call(descriptor, 'condition') && !getValue(descriptor.condition, context)) {
            return null;
        }

        if (descriptor['context-provider'] && typeof descriptor['context-provider'] === 'function') {
            context = getValue(descriptor['context-provider'], context);
        }

        for (keys = getKeys(descriptor), i = 0, ii = keys.length; i < ii; i++) {
            key = keys[i];
            if (!/con(dition|text-provider)|params/.test(key)) {
                fragment[key] = getValue(descriptor[key], context);
            }
        }

        if (descriptor.params) {
            var params = fragment.params = {};
            for (keys = getKeys(descriptor.params), i = 0, ii = keys.length; i < ii; i++) {
                key = keys[i];
                params[key] = getValue(descriptor.params[key], context);
            }
        }

        return fragment;
    }

    // returns a function that retrieves all the fragment sof a given type, for a given location.
    function fragmentGetter(type) {
        var descriptorsByLocation = descriptors[type];
        return function (location, context) {
            var descriptors = descriptorsByLocation[location];
            var fragments = [];

            if (descriptors && descriptors.length) {
                var i = void 0;
                var ii = descriptors.length;
                for (i = 0; i < ii; i++) {
                    var fragment = toFragment(descriptors[i], context, type);
                    if (fragment) {
                        fragments.push(fragment);
                    }
                }
            }

            if (shouldIncludeExample(type, location)) {
                fragments.push(examples[type](location, context));
            }

            return fragments;
        };
    }

    var getWebPanels = fragmentGetter('panel');
    // In Stash, web panels  are returned as a pure HTML string.
    // So we pull out the evaluated view property (which should be HTML) and return it instead of the whole fragment.
    function getWebPanelHtml(location, context) {
        var panels = getWebPanels(location, context);
        var i = void 0;
        var ii = panels.length;
        for (i = 0; i < ii; i++) {
            panels[i] = panels[i].view;
        }
        return panels;
    }

    var getWebItemFragments = fragmentGetter('item');
    // There are a few properties on web items that are not provided by descriptors, but are required to be on the resulting fragment.
    // We calculate values for those properties before returning the fragment.
    function getWebItems(location, context) {
        var items = getWebItemFragments(location, context);
        var i = void 0;
        var ii = items.length;
        for (i = 0; i < ii; i++) {
            items[i].hasIcon = !!items[i].iconUrl;
            items[i].hasTooltip = !!items[i].tooltip;
        }
        return items;
    }

    // Registers a descriptor of the given type.
    function descriptorAdder(type) {
        var descriptorsByLocation = descriptors[type];
        return function (descriptor) {
            if (!descriptor) {
                throw new Error('No descriptor provided');
            }
            if (typeof descriptor.location !== 'string') {
                throw new Error('No location provided, or location was not a string.');
            }
            if (typeof descriptor.completeModuleKey !== 'string') {
                throw new Error('No completeModuleKey provided, or completeModuleKey was not a string.');
            }

            addDynamicServerData(descriptor);

            if (!descriptorsByLocation[descriptor.location]) {
                descriptorsByLocation[descriptor.location] = [];
            }

            descriptorsByLocation[descriptor.location].push(descriptor);
            descriptorsByLocation[descriptor.location].sort(weightComparator);
        };
    }

    // Compare function used to sort web fragments by their weight property.
    // Weight is guaranteed to be a number if defined.
    function weightComparator(a, b) {
        return (a.weight >= 0 ? a.weight : 1000) - (b.weight >= 0 ? b.weight : 1000);
    }

    return {
        getWebItems: fragmentGetter('item'),
        getWebSections: fragmentGetter('section'),
        getWebPanels: getWebPanelHtml,
        getWebFragmentDescriptors: function getWebFragmentDescriptors(location, type) {
            var descriptorsByType = descriptors[type];
            var descriptorsForLocation = descriptorsByType && descriptorsByType[location];
            return descriptorsForLocation && descriptorsForLocation.slice() || [];
        },
        addWebItemDescriptor: descriptorAdder('item'),
        addWebSectionDescriptor: descriptorAdder('section'),
        addWebPanelDescriptor: descriptorAdder('panel'),
        getWebFragments: function getWebFragments(itemLocation, sectionLocation, context) {
            if (typeof sectionLocation !== 'string') {
                context = sectionLocation;
                sectionLocation = itemLocation;
            }

            // this is an odd case - made to match the WebFragmentFunction in Soy
            var items = this.getWebItems(itemLocation, context);
            var sections = this.getWebSections(sectionLocation, context);
            var all = items.concat(sections);
            all.sort(weightComparator);
            return all;
        },
        // These are exported only so they can be used by the generated descriptors.
        // You shouldn't use them
        _getValue: getValue,
        _formatI18n: function _formatI18n(transformed, key, fallback) {
            var messagePattern = (transformed === key ? fallback : transformed) || key || fallback || '';

            return function (context) {
                var contextAsArgs = [];
                var keys = getKeys(context);
                keys.sort();
                var i = void 0;
                var ii = keys.length;
                for (i = 0; i < ii; i++) {
                    contextAsArgs.push(context[keys[i]]);
                }
                return AJS.format(messagePattern, contextAsArgs);
            };
        },
        // used in shared component web fragments. Returns a fuller object than getWebPanels, which just returns HTML.
        _getWebPanels: getWebPanels,
        // used by GetDeprecatedFragmentsFunction - implementation should match
        _getDeprecatedWebFragments: function _getDeprecatedWebFragments(location, types, context) {
            var typeAndDescriptors = types.map(function (t) {
                return t.toLowerCase();
            }).map(function (type) {
                return [type, WebFragments.getWebFragmentDescriptors(location, type)];
            });

            var anyThirdParty = typeAndDescriptors.some(function (_ref) {
                var _ref2 = babelHelpers.slicedToArray(_ref, 2),
                    type = _ref2[0],
                    descriptors = _ref2[1];

                return descriptors.some(function (descriptor) {
                    return descriptor.pluginKey !== 'com.atlassian.bitbucket.server.bitbucket-client-web-fragments';
                });
            });
            if (anyThirdParty) {
                console.warn("The client-side web-fragment location '" + location + "' is deprecated and will be removed in a future release.");
            }
            return typeAndDescriptors.reduce(function (frags, _ref3) {
                var _ref4 = babelHelpers.slicedToArray(_ref3, 2),
                    type = _ref4[0],
                    descriptors = _ref4[1];

                var newFrags = descriptors.map(function (descriptor) {
                    return toFragment(descriptor, context, type);
                }).filter(function (a) {
                    return a;
                });
                if (type === 'panel') {
                    // make client panels expose the same property as server ones for server/client templates to use.
                    newFrags.forEach(function (panel) {
                        return panel.html = panel.view || '';
                    });
                }
                return frags.concat(newFrags);
            }, []).sort(weightComparator);
        }
    };
}();

define('bitbucket/internal/util/web-fragment-manager', function () {
    return window.WebFragments;
});