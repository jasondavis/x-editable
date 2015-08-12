/*!
 * Select2 4.0.0
 * https://select2.github.io
 *
 * Released under the MIT license
 * https://github.com/select2/select2/blob/master/LICENSE.md
 */ (function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function(jQuery) {
    // This is needed so we can catch the AMD loader configuration and use it
    // The inner file should be wrapped (by `banner.start.js`) in a function that
    // returns the AMD loader references.
    var S2 = (function() {
        // Restore the Select2 AMD loader so it can be used
        // Needed mostly in the language files, where the loader is not inserted
        if (jQuery && jQuery.fn && jQuery.fn.select2 && jQuery.fn.select2.amd) {
            var S2 = jQuery.fn.select2.amd;
        }
        var S2;
        (function() {
            if (!S2 || !S2.requirejs) {
                if (!S2) {
                    S2 = {};
                } else {
                    require = S2;
                }
                /**
                 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
                 * Available via the MIT or new BSD license.
                 * see: http://github.com/jrburke/almond for details
                 */
                //Going sloppy to avoid 'use strict' string cost, but strict practices should
                //be followed.
                /*jslint sloppy: true */
                /*global setTimeout: false */

                var requirejs, require, define;
                (function(undef) {
                    var main, req, makeMap, handlers,
                    defined = {},
                    waiting = {},
                    config = {},
                    defining = {},
                    hasOwn = Object.prototype.hasOwnProperty,
                        aps = [].slice,
                        jsSuffixRegExp = /\.js$/;

                    function hasProp(obj, prop) {
                        return hasOwn.call(obj, prop);
                    }

                    /**
                     * Given a relative module name, like ./something, normalize it to
                     * a real name that can be mapped to a path.
                     * @param {String} name the relative name
                     * @param {String} baseName a real name that the name arg is relative
                     * to.
                     * @returns {String} normalized name
                     */
                    function normalize(name, baseName) {
                        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
                        foundI, foundStarMap, starI, i, j, part,
                        baseParts = baseName && baseName.split("/"),
                            map = config.map,
                            starMap = (map && map['*']) || {};

                        //Adjust any relative paths.
                        if (name && name.charAt(0) === ".") {
                            //If have a base name, try to normalize against it,
                            //otherwise, assume it is a top-level require that will
                            //be relative to baseUrl in the end.
                            if (baseName) {
                                //Convert baseName to array, and lop off the last part,
                                //so that . matches that "directory" and not name of the baseName's
                                //module. For instance, baseName of "one/two/three", maps to
                                //"one/two/three.js", but we want the directory, "one/two" for
                                //this normalization.
                                baseParts = baseParts.slice(0, baseParts.length - 1);
                                name = name.split('/');
                                lastIndex = name.length - 1;

                                // Node .js allowance:
                                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                                }

                                name = baseParts.concat(name);

                                //start trimDots
                                for (i = 0; i < name.length; i += 1) {
                                    part = name[i];
                                    if (part === ".") {
                                        name.splice(i, 1);
                                        i -= 1;
                                    } else if (part === "..") {
                                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                                            //End of the line. Keep at least one non-dot
                                            //path segment at the front so it can be mapped
                                            //correctly to disk. Otherwise, there is likely
                                            //no path mapping for a path starting with '..'.
                                            //This can still fail, but catches the most reasonable
                                            //uses of ..
                                            break;
                                        } else if (i > 0) {
                                            name.splice(i - 1, 2);
                                            i -= 2;
                                        }
                                    }
                                }
                                //end trimDots

                                name = name.join("/");
                            } else if (name.indexOf('./') === 0) {
                                // No baseName, so this is ID is resolved relative
                                // to baseUrl, pull off the leading dot.
                                name = name.substring(2);
                            }
                        }

                        //Apply map config if available.
                        if ((baseParts || starMap) && map) {
                            nameParts = name.split('/');

                            for (i = nameParts.length; i > 0; i -= 1) {
                                nameSegment = nameParts.slice(0, i).join("/");

                                if (baseParts) {
                                    //Find the longest baseName segment match in the config.
                                    //So, do joins on the biggest to smallest lengths of baseParts.
                                    for (j = baseParts.length; j > 0; j -= 1) {
                                        mapValue = map[baseParts.slice(0, j).join('/')];

                                        //baseName segment has  config, find if it has one for
                                        //this name.
                                        if (mapValue) {
                                            mapValue = mapValue[nameSegment];
                                            if (mapValue) {
                                                //Match, update name to the new value.
                                                foundMap = mapValue;
                                                foundI = i;
                                                break;
                                            }
                                        }
                                    }
                                }

                                if (foundMap) {
                                    break;
                                }

                                //Check for a star map match, but just hold on to it,
                                //if there is a shorter segment match later in a matching
                                //config, then favor over this star map.
                                if (!foundStarMap && starMap && starMap[nameSegment]) {
                                    foundStarMap = starMap[nameSegment];
                                    starI = i;
                                }
                            }

                            if (!foundMap && foundStarMap) {
                                foundMap = foundStarMap;
                                foundI = starI;
                            }

                            if (foundMap) {
                                nameParts.splice(0, foundI, foundMap);
                                name = nameParts.join('/');
                            }
                        }

                        return name;
                    }

                    function makeRequire(relName, forceSync) {
                        return function() {
                            //A version of a require function that passes a moduleName
                            //value for items that may need to
                            //look up paths relative to the moduleName
                            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
                        };
                    }

                    function makeNormalize(relName) {
                        return function(name) {
                            return normalize(name, relName);
                        };
                    }

                    function makeLoad(depName) {
                        return function(value) {
                            defined[depName] = value;
                        };
                    }

                    function callDep(name) {
                        if (hasProp(waiting, name)) {
                            var args = waiting[name];
                            delete waiting[name];
                            defining[name] = true;
                            main.apply(undef, args);
                        }

                        if (!hasProp(defined, name) && !hasProp(defining, name)) {
                            throw new Error('No ' + name);
                        }
                        return defined[name];
                    }

                    //Turns a plugin!resource to [plugin, resource]
                    //with the plugin being undefined if the name
                    //did not have a plugin prefix.
                    function splitPrefix(name) {
                        var prefix,
                        index = name ? name.indexOf('!') : -1;
                        if (index > -1) {
                            prefix = name.substring(0, index);
                            name = name.substring(index + 1, name.length);
                        }
                        return [prefix, name];
                    }

                    /**
                     * Makes a name map, normalizing the name, and using a plugin
                     * for normalization if necessary. Grabs a ref to plugin
                     * too, as an optimization.
                     */
                    makeMap = function(name, relName) {
                        var plugin,
                        parts = splitPrefix(name),
                            prefix = parts[0];

                        name = parts[1];

                        if (prefix) {
                            prefix = normalize(prefix, relName);
                            plugin = callDep(prefix);
                        }

                        //Normalize according
                        if (prefix) {
                            if (plugin && plugin.normalize) {
                                name = plugin.normalize(name, makeNormalize(relName));
                            } else {
                                name = normalize(name, relName);
                            }
                        } else {
                            name = normalize(name, relName);
                            parts = splitPrefix(name);
                            prefix = parts[0];
                            name = parts[1];
                            if (prefix) {
                                plugin = callDep(prefix);
                            }
                        }

                        //Using ridiculous property names for space reasons
                        return {
                            f: prefix ? prefix + '!' + name : name, //fullName
                            n: name,
                            pr: prefix,
                            p: plugin
                        };
                    };

                    function makeConfig(name) {
                        return function() {
                            return (config && config.config && config.config[name]) || {};
                        };
                    }

                    handlers = {
                        require: function(name) {
                            return makeRequire(name);
                        },
                        exports: function(name) {
                            var e = defined[name];
                            if (typeof e !== 'undefined') {
                                return e;
                            } else {
                                return (defined[name] = {});
                            }
                        },
                        module: function(name) {
                            return {
                                id: name,
                                uri: '',
                                exports: defined[name],
                                config: makeConfig(name)
                            };
                        }
                    };

                    main = function(name, deps, callback, relName) {
                        var cjsModule, depName, ret, map, i,
                        args = [],
                            callbackType = typeof callback,
                            usingExports;

                        //Use name if no relName
                        relName = relName || name;

                        //Call the callback to define the module, if necessary.
                        if (callbackType === 'undefined' || callbackType === 'function') {
                            //Pull out the defined dependencies and pass the ordered
                            //values to the callback.
                            //Default to [require, exports, module] if no deps
                            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
                            for (i = 0; i < deps.length; i += 1) {
                                map = makeMap(deps[i], relName);
                                depName = map.f;

                                //Fast path CommonJS standard dependencies.
                                if (depName === "require") {
                                    args[i] = handlers.require(name);
                                } else if (depName === "exports") {
                                    //CommonJS module spec 1.1
                                    args[i] = handlers.exports(name);
                                    usingExports = true;
                                } else if (depName === "module") {
                                    //CommonJS module spec 1.1
                                    cjsModule = args[i] = handlers.module(name);
                                } else if (hasProp(defined, depName) || hasProp(waiting, depName) || hasProp(defining, depName)) {
                                    args[i] = callDep(depName);
                                } else if (map.p) {
                                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                                    args[i] = defined[depName];
                                } else {
                                    throw new Error(name + ' missing ' + depName);
                                }
                            }

                            ret = callback ? callback.apply(defined[name], args) : undefined;

                            if (name) {
                                //If setting exports via "module" is in play,
                                //favor that over return value and exports. After that,
                                //favor a non-undefined return value over exports use.
                                if (cjsModule && cjsModule.exports !== undef && cjsModule.exports !== defined[name]) {
                                    defined[name] = cjsModule.exports;
                                } else if (ret !== undef || !usingExports) {
                                    //Use the return value from the function.
                                    defined[name] = ret;
                                }
                            }
                        } else if (name) {
                            //May just be an object definition for the module. Only
                            //worry about defining if have a module name.
                            defined[name] = callback;
                        }
                    };

                    requirejs = require = req = function(deps, callback, relName, forceSync, alt) {
                        if (typeof deps === "string") {
                            if (handlers[deps]) {
                                //callback in this case is really relName
                                return handlers[deps](callback);
                            }
                            //Just return the module wanted. In this scenario, the
                            //deps arg is the module name, and second arg (if passed)
                            //is just the relName.
                            //Normalize module name, if it contains . or ..
                            return callDep(makeMap(deps, callback).f);
                        } else if (!deps.splice) {
                            //deps is a config object, not an array.
                            config = deps;
                            if (config.deps) {
                                req(config.deps, config.callback);
                            }
                            if (!callback) {
                                return;
                            }

                            if (callback.splice) {
                                //callback is an array, which means it is a dependency list.
                                //Adjust args if there are dependencies
                                deps = callback;
                                callback = relName;
                                relName = null;
                            } else {
                                deps = undef;
                            }
                        }

                        //Support require(['a'])
                        callback = callback || function() {};

                        //If relName is a function, it is an errback handler,
                        //so remove it.
                        if (typeof relName === 'function') {
                            relName = forceSync;
                            forceSync = alt;
                        }

                        //Simulate async callback;
                        if (forceSync) {
                            main(undef, deps, callback, relName);
                        } else {
                            //Using a non-zero value because of concern for what old browsers
                            //do, and latest browsers "upgrade" to 4 if lower value is used:
                            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
                            //If want a value immediately, use require('id') instead -- something
                            //that works in almond on the global level, but not guaranteed and
                            //unlikely to work in other AMD implementations.
                            setTimeout(function() {
                                main(undef, deps, callback, relName);
                            }, 4);
                        }

                        return req;
                    };

                    /**
                     * Just drops the config on the floor, but returns req in case
                     * the config return value is used.
                     */
                    req.config = function(cfg) {
                        return req(cfg);
                    };

                    /**
                     * Expose module registry for debugging and tooling
                     */
                    requirejs._defined = defined;

                    define = function(name, deps, callback) {

                        //This module may not have dependencies
                        if (!deps.splice) {
                            //deps is not an array, so probably means
                            //an object literal or factory function for
                            //the value. Adjust args.
                            callback = deps;
                            deps = [];
                        }

                        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
                            waiting[name] = [name, deps, callback];
                        }
                    };

                    define.amd = {
                        jQuery: true
                    };
                }());

                S2.requirejs = requirejs;
                S2.require = require;
                S2.define = define;
            }
        }());
        S2.define("almond", function() {});

        /* global jQuery:false, $:false */
        S2.define('jquery', [], function() {
            var _$ = jQuery || $;

            if (_$ == null && console && console.error) {
                console.error('Select2: An instance of jQuery or a jQuery-compatible library was not ' + 'found. Make sure that you are including jQuery before Select2 on your ' + 'web page.');
            }

            return _$;
        });

        S2.define('select2/utils', ['jquery'], function($) {
            var Utils = {};

            Utils.Extend = function(ChildClass, SuperClass) {
                var __hasProp = {}.hasOwnProperty;

                function BaseConstructor() {
                    this.constructor = ChildClass;
                }

                for (var key in SuperClass) {
                    if (__hasProp.call(SuperClass, key)) {
                        ChildClass[key] = SuperClass[key];
                    }
                }

                BaseConstructor.prototype = SuperClass.prototype;
                ChildClass.prototype = new BaseConstructor();
                ChildClass.__super__ = SuperClass.prototype;

                return ChildClass;
            };

            function getMethods(theClass) {
                var proto = theClass.prototype;

                var methods = [];

                for (var methodName in proto) {
                    var m = proto[methodName];

                    if (typeof m !== 'function') {
                        continue;
                    }

                    if (methodName === 'constructor') {
                        continue;
                    }

                    methods.push(methodName);
                }

                return methods;
            }

            Utils.Decorate = function(SuperClass, DecoratorClass) {
                var decoratedMethods = getMethods(DecoratorClass);
                var superMethods = getMethods(SuperClass);

                function DecoratedClass() {
                    var unshift = Array.prototype.unshift;

                    var argCount = DecoratorClass.prototype.constructor.length;

                    var calledConstructor = SuperClass.prototype.constructor;

                    if (argCount > 0) {
                        unshift.call(arguments, SuperClass.prototype.constructor);

                        calledConstructor = DecoratorClass.prototype.constructor;
                    }

                    calledConstructor.apply(this, arguments);
                }

                DecoratorClass.displayName = SuperClass.displayName;

                function ctr() {
                    this.constructor = DecoratedClass;
                }

                DecoratedClass.prototype = new ctr();

                for (var m = 0; m < superMethods.length; m++) {
                    var superMethod = superMethods[m];

                    DecoratedClass.prototype[superMethod] = SuperClass.prototype[superMethod];
                }

                var calledMethod = function(methodName) {
                    // Stub out the original method if it's not decorating an actual method
                    var originalMethod = function() {};

                    if (methodName in DecoratedClass.prototype) {
                        originalMethod = DecoratedClass.prototype[methodName];
                    }

                    var decoratedMethod = DecoratorClass.prototype[methodName];

                    return function() {
                        var unshift = Array.prototype.unshift;

                        unshift.call(arguments, originalMethod);

                        return decoratedMethod.apply(this, arguments);
                    };
                };

                for (var d = 0; d < decoratedMethods.length; d++) {
                    var decoratedMethod = decoratedMethods[d];

                    DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod);
                }

                return DecoratedClass;
            };

            var Observable = function() {
                this.listeners = {};
            };

            Observable.prototype.on = function(event, callback) {
                this.listeners = this.listeners || {};

                if (event in this.listeners) {
                    this.listeners[event].push(callback);
                } else {
                    this.listeners[event] = [callback];
                }
            };

            Observable.prototype.trigger = function(event) {
                var slice = Array.prototype.slice;

                this.listeners = this.listeners || {};

                if (event in this.listeners) {
                    this.invoke(this.listeners[event], slice.call(arguments, 1));
                }

                if ('*' in this.listeners) {
                    this.invoke(this.listeners['*'], arguments);
                }
            };

            Observable.prototype.invoke = function(listeners, params) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].apply(this, params);
                }
            };

            Utils.Observable = Observable;

            Utils.generateChars = function(length) {
                var chars = '';

                for (var i = 0; i < length; i++) {
                    var randomChar = Math.floor(Math.random() * 36);
                    chars += randomChar.toString(36);
                }

                return chars;
            };

            Utils.bind = function(func, context) {
                return function() {
                    func.apply(context, arguments);
                };
            };

            Utils._convertData = function(data) {
                for (var originalKey in data) {
                    var keys = originalKey.split('-');

                    var dataLevel = data;

                    if (keys.length === 1) {
                        continue;
                    }

                    for (var k = 0; k < keys.length; k++) {
                        var key = keys[k];

                        // Lowercase the first letter
                        // By default, dash-separated becomes camelCase
                        key = key.substring(0, 1).toLowerCase() + key.substring(1);

                        if (!(key in dataLevel)) {
                            dataLevel[key] = {};
                        }

                        if (k == keys.length - 1) {
                            dataLevel[key] = data[originalKey];
                        }

                        dataLevel = dataLevel[key];
                    }

                    delete data[originalKey];
                }

                return data;
            };

            Utils.hasScroll = function(index, el) {
                // Adapted from the function created by @ShadowScripter
                // and adapted by @BillBarry on the Stack Exchange Code Review website.
                // The original code can be found at
                // http://codereview.stackexchange.com/q/13338
                // and was designed to be used with the Sizzle selector engine.

                var $el = $(el);
                var overflowX = el.style.overflowX;
                var overflowY = el.style.overflowY;

                //Check both x and y declarations
                if (overflowX === overflowY && (overflowY === 'hidden' || overflowY === 'visible')) {
                    return false;
                }

                if (overflowX === 'scroll' || overflowY === 'scroll') {
                    return true;
                }

                return ($el.innerHeight() < el.scrollHeight || $el.innerWidth() < el.scrollWidth);
            };

            Utils.escapeMarkup = function(markup) {
                var replaceMap = {
                    '\\': '\/',
                    '&': '&',
                    '<': '<',
                    '>': '>',
                    '"': '"',
                    '\'': ''',
                    '/': '/'
                };

                // Do not try to escape the markup if it's not a string
                if (typeof markup !== 'string') {
                    return markup;
                }

                return String(markup).replace(/[&<>"'\/\\]/g, function(match) {
                    return replaceMap[match];
                });
            };

            // Append an array of jQuery nodes to a given element.
            Utils.appendMany = function($element, $nodes) {
                // jQuery 1.7.x does not support $.fn.append() with an array
                // Fall back to a jQuery object collection using $.fn.add()
                if ($.fn.jquery.substr(0, 3) === '1.7') {
                    var $jqNodes = $();

                    $.map($nodes, function(node) {
                        $jqNodes = $jqNodes.add(node);
                    });

                    $nodes = $jqNodes;
                }

                $element.append($nodes);
            };

            return Utils;
        });

        S2.define('select2/results', ['jquery', './utils'], function($, Utils) {
            function Results($element, options, dataAdapter) {
                this.$element = $element;
                this.data = dataAdapter;
                this.options = options;

                Results.__super__.constructor.call(this);
            }

            Utils.Extend(Results, Utils.Observable);

            Results.prototype.render = function() {
                var $results = $('<ul class="select2-results__options" role="tree"></ul>');

                if (this.options.get('multiple')) {
                    $results.attr('aria-multiselectable', 'true');
                }

                this.$results = $results;

                return $results;
            };

            Results.prototype.clear = function() {
                this.$results.empty();
            };

            Results.prototype.displayMessage = function(params) {
                var escapeMarkup = this.options.get('escapeMarkup');

                this.clear();
                this.hideLoading();

                var $message = $('<li role="treeitem" class="select2-results__option"></li>');

                var message = this.options.get('translations').get(params.message);

                $message.append(
                escapeMarkup(
                message(params.args)));

                this.$results.append($message);
            };

            Results.prototype.append = function(data) {
                this.hideLoading();

                var $options = [];

                if (data.results == null || data.results.length === 0) {
                    if (this.$results.children().length === 0) {
                        this.trigger('results:message', {
                            message: 'noResults'
                        });
                    }

                    return;
                }

                data.results = this.sort(data.results);

                for (var d = 0; d < data.results.length; d++) {
                    var item = data.results[d];

                    var $option = this.option(item);

                    $options.push($option);
                }

                this.$results.append($options);
            };

            Results.prototype.position = function($results, $dropdown) {
                var $resultsContainer = $dropdown.find('.select2-results');
                $resultsContainer.append($results);
            };

            Results.prototype.sort = function(data) {
                var sorter = this.options.get('sorter');

                return sorter(data);
            };

            Results.prototype.setClasses = function() {
                var self = this;

                this.data.current(function(selected) {
                    var selectedIds = $.map(selected, function(s) {
                        return s.id.toString();
                    });

                    var $options = self.$results.find('.select2-results__option[aria-selected]');

                    $options.each(function() {
                        var $option = $(this);

                        var item = $.data(this, 'data');

                        // id needs to be converted to a string when comparing
                        var id = '' + item.id;

                        if ((item.element != null && item.element.selected) || (item.element == null && $.inArray(id, selectedIds) > -1)) {
                            $option.attr('aria-selected', 'true');
                        } else {
                            $option.attr('aria-selected', 'false');
                        }
                    });

                    var $selected = $options.filter('[aria-selected=true]');

                    // Check if there are any selected options
                    if ($selected.length > 0) {
                        // If there are selected options, highlight the first
                        $selected.first().trigger('mouseenter');
                    } else {
                        // If there are no selected options, highlight the first option
                        // in the dropdown
                        $options.first().trigger('mouseenter');
                    }
                });
            };

            Results.prototype.showLoading = function(params) {
                this.hideLoading();

                var loadingMore = this.options.get('translations').get('searching');

                var loading = {
                    disabled: true,
                    loading: true,
                    text: loadingMore(params)
                };
                var $loading = this.option(loading);
                $loading.className += ' loading-results';

                this.$results.prepend($loading);
            };

            Results.prototype.hideLoading = function() {
                this.$results.find('.loading-results').remove();
            };

            Results.prototype.option = function(data) {
                var option = document.createElement('li');
                option.className = 'select2-results__option';

                var attrs = {
                    'role': 'treeitem',
                    'aria-selected': 'false'
                };

                if (data.disabled) {
                    delete attrs['aria-selected'];
                    attrs['aria-disabled'] = 'true';
                }

                if (data.id == null) {
                    delete attrs['aria-selected'];
                }

                if (data._resultId != null) {
                    option.id = data._resultId;
                }

                if (data.title) {
                    option.title = data.title;
                }

                if (data.children) {
                    attrs.role = 'group';
                    attrs['aria-label'] = data.text;
                    delete attrs['aria-selected'];
                }

                for (var attr in attrs) {
                    var val = attrs[attr];

                    option.setAttribute(attr, val);
                }

                if (data.children) {
                    var $option = $(option);

                    var label = document.createElement('strong');
                    label.className = 'select2-results__group';

                    var $label = $(label);
                    this.template(data, label);

                    var $children = [];

                    for (var c = 0; c < data.children.length; c++) {
                        var child = data.children[c];

                        var $child = this.option(child);

                        $children.push($child);
                    }

                    var $childrenContainer = $('<ul></ul>', {
                        'class': 'select2-results__options select2-results__options--nested'
                    });

                    $childrenContainer.append($children);

                    $option.append(label);
                    $option.append($childrenContainer);
                } else {
                    this.template(data, option);
                }

                $.data(option, 'data', data);

                return option;
            };

            Results.prototype.bind = function(container, $container) {
                var self = this;

                var id = container.id + '-results';

                this.$results.attr('id', id);

                container.on('results:all', function(params) {
                    self.clear();
                    self.append(params.data);

                    if (container.isOpen()) {
                        self.setClasses();
                    }
                });

                container.on('results:append', function(params) {
                    self.append(params.data);

                    if (container.isOpen()) {
                        self.setClasses();
                    }
                });

                container.on('query', function(params) {
                    self.showLoading(params);
                });

                container.on('select', function() {
                    if (!container.isOpen()) {
                        return;
                    }

                    self.setClasses();
                });

                container.on('unselect', function() {
                    if (!container.isOpen()) {
                        return;
                    }

                    self.setClasses();
                });

                container.on('open', function() {
                    // When the dropdown is open, aria-expended="true"
                    self.$results.attr('aria-expanded', 'true');
                    self.$results.attr('aria-hidden', 'false');

                    self.setClasses();
                    self.ensureHighlightVisible();
                });

                container.on('close', function() {
                    // When the dropdown is closed, aria-expended="false"
                    self.$results.attr('aria-expanded', 'false');
                    self.$results.attr('aria-hidden', 'true');
                    self.$results.removeAttr('aria-activedescendant');
                });

                container.on('results:toggle', function() {
                    var $highlighted = self.getHighlightedResults();

                    if ($highlighted.length === 0) {
                        return;
                    }

                    $highlighted.trigger('mouseup');
                });

                container.on('results:select', function() {
                    var $highlighted = self.getHighlightedResults();

                    if ($highlighted.length === 0) {
                        return;
                    }

                    var data = $highlighted.data('data');

                    if ($highlighted.attr('aria-selected') == 'true') {
                        self.trigger('close');
                    } else {
                        self.trigger('select', {
                            data: data
                        });
                    }
                });

                container.on('results:previous', function() {
                    var $highlighted = self.getHighlightedResults();

                    var $options = self.$results.find('[aria-selected]');

                    var currentIndex = $options.index($highlighted);

                    // If we are already at te top, don't move further
                    if (currentIndex === 0) {
                        return;
                    }

                    var nextIndex = currentIndex - 1;

                    // If none are highlighted, highlight the first
                    if ($highlighted.length === 0) {
                        nextIndex = 0;
                    }

                    var $next = $options.eq(nextIndex);

                    $next.trigger('mouseenter');

                    var currentOffset = self.$results.offset().top;
                    var nextTop = $next.offset().top;
                    var nextOffset = self.$results.scrollTop() + (nextTop - currentOffset);

                    if (nextIndex === 0) {
                        self.$results.scrollTop(0);
                    } else if (nextTop - currentOffset < 0) {
                        self.$results.scrollTop(nextOffset);
                    }
                });

                container.on('results:next', function() {
                    var $highlighted = self.getHighlightedResults();

                    var $options = self.$results.find('[aria-selected]');

                    var currentIndex = $options.index($highlighted);

                    var nextIndex = currentIndex + 1;

                    // If we are at the last option, stay there
                    if (nextIndex >= $options.length) {
                        return;
                    }

                    var $next = $options.eq(nextIndex);

                    $next.trigger('mouseenter');

                    var currentOffset = self.$results.offset().top + self.$results.outerHeight(false);
                    var nextBottom = $next.offset().top + $next.outerHeight(false);
                    var nextOffset = self.$results.scrollTop() + nextBottom - currentOffset;

                    if (nextIndex === 0) {
                        self.$results.scrollTop(0);
                    } else if (nextBottom > currentOffset) {
                        self.$results.scrollTop(nextOffset);
                    }
                });

                container.on('results:focus', function(params) {
                    params.element.addClass('select2-results__option--highlighted');
                });

                container.on('results:message', function(params) {
                    self.displayMessage(params);
                });

                if ($.fn.mousewheel) {
                    this.$results.on('mousewheel', function(e) {
                        var top = self.$results.scrollTop();

                        var bottom = (
                        self.$results.get(0).scrollHeight - self.$results.scrollTop() + e.deltaY);

                        var isAtTop = e.deltaY > 0 && top - e.deltaY <= 0;
                        var isAtBottom = e.deltaY < 0 && bottom <= self.$results.height();

                        if (isAtTop) {
                            self.$results.scrollTop(0);

                            e.preventDefault();
                            e.stopPropagation();
                        } else if (isAtBottom) {
                            self.$results.scrollTop(
                            self.$results.get(0).scrollHeight - self.$results.height());

                            e.preventDefault();
                            e.stopPropagation();
                        }
                    });
                }

                this.$results.on('mouseup', '.select2-results__option[aria-selected]',

                function(evt) {
                    var $this = $(this);

                    var data = $this.data('data');

                    if ($this.attr('aria-selected') === 'true') {
                        if (self.options.get('multiple')) {
                            self.trigger('unselect', {
                                originalEvent: evt,
                                data: data
                            });
                        } else {
                            self.trigger('close');
                        }

                        return;
                    }

                    self.trigger('select', {
                        originalEvent: evt,
                        data: data
                    });
                });

                this.$results.on('mouseenter', '.select2-results__option[aria-selected]',

                function(evt) {
                    var data = $(this).data('data');

                    self.getHighlightedResults()
                        .removeClass('select2-results__option--highlighted');

                    self.trigger('results:focus', {
                        data: data,
                        element: $(this)
                    });
                });
            };

            Results.prototype.getHighlightedResults = function() {
                var $highlighted = this.$results.find('.select2-results__option--highlighted');

                return $highlighted;
            };

            Results.prototype.destroy = function() {
                this.$results.remove();
            };

            Results.prototype.ensureHighlightVisible = function() {
                var $highlighted = this.getHighlightedResults();

                if ($highlighted.length === 0) {
                    return;
                }

                var $options = this.$results.find('[aria-selected]');

                var currentIndex = $options.index($highlighted);

                var currentOffset = this.$results.offset().top;
                var nextTop = $highlighted.offset().top;
                var nextOffset = this.$results.scrollTop() + (nextTop - currentOffset);

                var offsetDelta = nextTop - currentOffset;
                nextOffset -= $highlighted.outerHeight(false) * 2;

                if (currentIndex <= 2) {
                    this.$results.scrollTop(0);
                } else if (offsetDelta > this.$results.outerHeight() || offsetDelta < 0) {
                    this.$results.scrollTop(nextOffset);
                }
            };

            Results.prototype.template = function(result, container) {
                var template = this.options.get('templateResult');
                var escapeMarkup = this.options.get('escapeMarkup');

                var content = template(result);

                if (content == null) {
                    container.style.display = 'none';
                } else if (typeof content === 'string') {
                    container.innerHTML = escapeMarkup(content);
                } else {
                    $(container).append(content);
                }
            };

            return Results;
        });

        S2.define('select2/keys', [

        ], function() {
            var KEYS = {
                BACKSPACE: 8,
                TAB: 9,
                ENTER: 13,
                SHIFT: 16,
                CTRL: 17,
                ALT: 18,
                ESC: 27,
                SPACE: 32,
                PAGE_UP: 33,
                PAGE_DOWN: 34,
                END: 35,
                HOME: 36,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                DELETE: 46
            };

            return KEYS;
        });

        S2.define('select2/selection/base', ['jquery', '../utils', '../keys'], function($, Utils, KEYS) {
            function BaseSelection($element, options) {
                this.$element = $element;
                this.options = options;

                BaseSelection.__super__.constructor.call(this);
            }

            Utils.Extend(BaseSelection, Utils.Observable);

            BaseSelection.prototype.render = function() {
                var $selection = $('<span class="select2-selection" role="combobox" ' + 'aria-autocomplete="list" aria-haspopup="true" aria-expanded="false">' + '</span>');

                this._tabindex = 0;

                if (this.$element.data('old-tabindex') != null) {
                    this._tabindex = this.$element.data('old-tabindex');
                } else if (this.$element.attr('tabindex') != null) {
                    this._tabindex = this.$element.attr('tabindex');
                }

                $selection.attr('title', this.$element.attr('title'));
                $selection.attr('tabindex', this._tabindex);

                this.$selection = $selection;

                return $selection;
            };

            BaseSelection.prototype.bind = function(container, $container) {
                var self = this;

                var id = container.id + '-container';
                var resultsId = container.id + '-results';

                this.container = container;

                this.$selection.on('focus', function(evt) {
                    self.trigger('focus', evt);
                });

                this.$selection.on('blur', function(evt) {
                    self.trigger('blur', evt);
                });

                this.$selection.on('keydown', function(evt) {
                    self.trigger('keypress', evt);

                    if (evt.which === KEYS.SPACE) {
                        evt.preventDefault();
                    }
                });

                container.on('results:focus', function(params) {
                    self.$selection.attr('aria-activedescendant', params.data._resultId);
                });

                container.on('selection:update', function(params) {
                    self.update(params.data);
                });

                container.on('open', function() {
                    // When the dropdown is open, aria-expanded="true"
                    self.$selection.attr('aria-expanded', 'true');
                    self.$selection.attr('aria-owns', resultsId);

                    self._attachCloseHandler(container);
                });

                container.on('close', function() {
                    // When the dropdown is closed, aria-expanded="false"
                    self.$selection.attr('aria-expanded', 'false');
                    self.$selection.removeAttr('aria-activedescendant');
                    self.$selection.removeAttr('aria-owns');

                    self.$selection.focus();

                    self._detachCloseHandler(container);
                });

                container.on('enable', function() {
                    self.$selection.attr('tabindex', self._tabindex);
                });

                container.on('disable', function() {
                    self.$selection.attr('tabindex', '-1');
                });
            };

            BaseSelection.prototype._attachCloseHandler = function(container) {
                var self = this;

                $(document.body).on('mousedown.select2.' + container.id, function(e) {
                    var $target = $(e.target);

                    var $select = $target.closest('.select2');

                    var $all = $('.select2.select2-container--open');

                    $all.each(function() {
                        var $this = $(this);

                        if (this == $select[0]) {
                            return;
                        }

                        var $element = $this.data('element');

                        $element.select2('close');
                    });
                });
            };

            BaseSelection.prototype._detachCloseHandler = function(container) {
                $(document.body).off('mousedown.select2.' + container.id);
            };

            BaseSelection.prototype.position = function($selection, $container) {
                var $selectionContainer = $container.find('.selection');
                $selectionContainer.append($selection);
            };

            BaseSelection.prototype.destroy = function() {
                this._detachCloseHandler(this.container);
            };

            BaseSelection.prototype.update = function(data) {
                throw new Error('The `update` method must be defined in child classes.');
            };

            return BaseSelection;
        });

        S2.define('select2/selection/single', ['jquery', './base', '../utils', '../keys'], function($, BaseSelection, Utils, KEYS) {
            function SingleSelection() {
                SingleSelection.__super__.constructor.apply(this, arguments);
            }

            Utils.Extend(SingleSelection, BaseSelection);

            SingleSelection.prototype.render = function() {
                var $selection = SingleSelection.__super__.render.call(this);

                $selection.addClass('select2-selection--single');

                $selection.html('<span class="select2-selection__rendered"></span>' + '<span class="select2-selection__arrow" role="presentation">' + '<b role="presentation"></b>' + '</span>');

                return $selection;
            };

            SingleSelection.prototype.bind = function(container, $container) {
                var self = this;

                SingleSelection.__super__.bind.apply(this, arguments);

                var id = container.id + '-container';

                this.$selection.find('.select2-selection__rendered').attr('id', id);
                this.$selection.attr('aria-labelledby', id);

                this.$selection.on('mousedown', function(evt) {
                    // Only respond to left clicks
                    if (evt.which !== 1) {
                        return;
                    }

                    self.trigger('toggle', {
                        originalEvent: evt
                    });
                });

                this.$selection.on('focus', function(evt) {
                    // User focuses on the container
                });

                this.$selection.on('blur', function(evt) {
                    // User exits the container
                });

                container.on('selection:update', function(params) {
                    self.update(params.data);
                });
            };

            SingleSelection.prototype.clear = function() {
                this.$selection.find('.select2-selection__rendered').empty();
            };

            SingleSelection.prototype.display = function(data) {
                var template = this.options.get('templateSelection');
                var escapeMarkup = this.options.get('escapeMarkup');

                return escapeMarkup(template(data));
            };

            SingleSelection.prototype.selectionContainer = function() {
                return $('<span></span>');
            };

            SingleSelection.prototype.update = function(data) {
                if (data.length === 0) {
                    this.clear();
                    return;
                }

                var selection = data[0];

                var formatted = this.display(selection);

                var $rendered = this.$selection.find('.select2-selection__rendered');
                $rendered.empty().append(formatted);
                $rendered.prop('title', selection.title || selection.text);
            };

            return SingleSelection;
        });

        S2.define('select2/selection/multiple', ['jquery', './base', '../utils'], function($, BaseSelection, Utils) {
            function MultipleSelection($element, options) {
                MultipleSelection.__super__.constructor.apply(this, arguments);
            }

            Utils.Extend(MultipleSelection, BaseSelection);

            MultipleSelection.prototype.render = function() {
                var $selection = MultipleSelection.__super__.render.call(this);

                $selection.addClass('select2-selection--multiple');

                $selection.html('<ul class="select2-selection__rendered"></ul>');

                return $selection;
            };

            MultipleSelection.prototype.bind = function(container, $container) {
                var self = this;

                MultipleSelection.__super__.bind.apply(this, arguments);

                this.$selection.on('click', function(evt) {
                    self.trigger('toggle', {
                        originalEvent: evt
                    });
                });

                this.$selection.on('click', '.select2-selection__choice__remove',

                function(evt) {
                    var $remove = $(this);
                    var $selection = $remove.parent();

                    var data = $selection.data('data');

                    self.trigger('unselect', {
                        originalEvent: evt,
                        data: data
                    });
                });
            };

            MultipleSelection.prototype.clear = function() {
                this.$selection.find('.select2-selection__rendered').empty();
            };

            MultipleSelection.prototype.display = function(data) {
                var template = this.options.get('templateSelection');
                var escapeMarkup = this.options.get('escapeMarkup');

                return escapeMarkup(template(data));
            };

            MultipleSelection.prototype.selectionContainer = function() {
                var $container = $('<li class="select2-selection__choice">' + '<span class="select2-selection__choice__remove" role="presentation">' + '×' + '</span>' + '</li>');

                return $container;
            };

            MultipleSelection.prototype.update = function(data) {
                this.clear();

                if (data.length === 0) {
                    return;
                }

                var $selections = [];

                for (var d = 0; d < data.length; d++) {
                    var selection = data[d];

                    var formatted = this.display(selection);
                    var $selection = this.selectionContainer();

                    $selection.append(formatted);
                    $selection.prop('title', selection.title || selection.text);

                    $selection.data('data', selection);

                    $selections.push($selection);
                }

                var $rendered = this.$selection.find('.select2-selection__rendered');

                Utils.appendMany($rendered, $selections);
            };

            return MultipleSelection;
        });

        S2.define('select2/selection/placeholder', ['../utils'], function(Utils) {
            function Placeholder(decorated, $element, options) {
                this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

                decorated.call(this, $element, options);
            }

            Placeholder.prototype.normalizePlaceholder = function(_, placeholder) {
                if (typeof placeholder === 'string') {
                    placeholder = {
                        id: '',
                        text: placeholder
                    };
                }

                return placeholder;
            };

            Placeholder.prototype.createPlaceholder = function(decorated, placeholder) {
                var $placeholder = this.selectionContainer();

                $placeholder.html(this.display(placeholder));
                $placeholder.addClass('select2-selection__placeholder')
                    .removeClass('select2-selection__choice');

                return $placeholder;
            };

            Placeholder.prototype.update = function(decorated, data) {
                var singlePlaceholder = (
                data.length == 1 && data[0].id != this.placeholder.id);
                var multipleSelections = data.length > 1;

                if (multipleSelections || singlePlaceholder) {
                    return decorated.call(this, data);
                }

                this.clear();

                var $placeholder = this.createPlaceholder(this.placeholder);

                this.$selection.find('.select2-selection__rendered').append($placeholder);
            };

            return Placeholder;
        });

        S2.define('select2/selection/allowClear', ['jquery', '../keys'], function($, KEYS) {
            function AllowClear() {}

            AllowClear.prototype.bind = function(decorated, container, $container) {
                var self = this;

                decorated.call(this, container, $container);

                if (this.placeholder == null) {
                    if (this.options.get('debug') && window.console && console.error) {
                        console.error('Select2: The `allowClear` option should be used in combination ' + 'with the `placeholder` option.');
                    }
                }

                this.$selection.on('mousedown', '.select2-selection__clear',

                function(evt) {
                    self._handleClear(evt);
                });

                container.on('keypress', function(evt) {
                    self._handleKeyboardClear(evt, container);
                });
            };

            AllowClear.prototype._handleClear = function(_, evt) {
                // Ignore the event if it is disabled
                if (this.options.get('disabled')) {
                    return;
                }

                var $clear = this.$selection.find('.select2-selection__clear');

                // Ignore the event if nothing has been selected
                if ($clear.length === 0) {
                    return;
                }

                evt.stopPropagation();

                var data = $clear.data('data');

                for (var d = 0; d < data.length; d++) {
                    var unselectData = {
                        data: data[d]
                    };

                    // Trigger the `unselect` event, so people can prevent it from being
                    // cleared.
                    this.trigger('unselect', unselectData);

                    // If the event was prevented, don't clear it out.
                    if (unselectData.prevented) {
                        return;
                    }
                }

                this.$element.val(this.placeholder.id).trigger('change');

                this.trigger('toggle');
            };

            AllowClear.prototype._handleKeyboardClear = function(_, evt, container) {
                if (container.isOpen()) {
                    return;
                }

                if (evt.which == KEYS.DELETE || evt.which == KEYS.BACKSPACE) {
                    this._handleClear(evt);
                }
            };

            AllowClear.prototype.update = function(decorated, data) {
                decorated.call(this, data);

                if (this.$selection.find('.select2-selection__placeholder').length > 0 || data.length === 0) {
                    return;
                }

                var $remove = $('<span class="select2-selection__clear">' + '×' + '</span>');
                $remove.data('data', data);

                this.$selection.find('.select2-selection__rendered').prepend($remove);
            };

            return AllowClear;
        });

        S2.define('select2/selection/search', ['jquery', '../utils', '../keys'], function($, Utils, KEYS) {
            function Search(decorated, $element, options) {
                decorated.call(this, $element, options);
            }

            Search.prototype.render = function(decorated) {
                var $search = $('<li class="select2-search select2-search--inline">' + '<input class="select2-search__field" type="search" tabindex="-1"' + ' autocomplete="off" autocorrect="off" autocapitalize="off"' + ' spellcheck="false" role="textbox" />' + '</li>');

                this.$searchContainer = $search;
                this.$search = $search.find('input');

                var $rendered = decorated.call(this);

                return $rendered;
            };

            Search.prototype.bind = function(decorated, container, $container) {
                var self = this;

                decorated.call(this, container, $container);

                container.on('open', function() {
                    self.$search.attr('tabindex', 0);

                    self.$search.focus();
                });

                container.on('close', function() {
                    self.$search.attr('tabindex', - 1);

                    self.$search.val('');
                    self.$search.focus();
                });

                container.on('enable', function() {
                    self.$search.prop('disabled', false);
                });

                container.on('disable', function() {
                    self.$search.prop('disabled', true);
                });

                this.$selection.on('focusin', '.select2-search--inline', function(evt) {
                    self.trigger('focus', evt);
                });

                this.$selection.on('focusout', '.select2-search--inline', function(evt) {
                    self.trigger('blur', evt);
                });

                this.$selection.on('keydown', '.select2-search--inline', function(evt) {
                    evt.stopPropagation();

                    self.trigger('keypress', evt);

                    self._keyUpPrevented = evt.isDefaultPrevented();

                    var key = evt.which;

                    if (key === KEYS.BACKSPACE && self.$search.val() === '') {
                        var $previousChoice = self.$searchContainer.prev('.select2-selection__choice');

                        if ($previousChoice.length > 0) {
                            var item = $previousChoice.data('data');

                            self.searchRemoveChoice(item);

                            evt.preventDefault();
                        }
                    }
                });

                // Workaround for browsers which do not support the `input` event
                // This will prevent double-triggering of events for browsers which support
                // both the `keyup` and `input` events.
                this.$selection.on('input', '.select2-search--inline', function(evt) {
                    // Unbind the duplicated `keyup` event
                    self.$selection.off('keyup.search');
                });

                this.$selection.on('keyup.search input', '.select2-search--inline',

                function(evt) {
                    self.handleSearch(evt);
                });
            };

            Search.prototype.createPlaceholder = function(decorated, placeholder) {
                this.$search.attr('placeholder', placeholder.text);
            };

            Search.prototype.update = function(decorated, data) {
                this.$search.attr('placeholder', '');

                decorated.call(this, data);

                this.$selection.find('.select2-selection__rendered')
                    .append(this.$searchContainer);

                this.resizeSearch();
            };

            Search.prototype.handleSearch = function() {
                this.resizeSearch();

                if (!this._keyUpPrevented) {
                    var input = this.$search.val();

                    this.trigger('query', {
                        term: input
                    });
                }

                this._keyUpPrevented = false;
            };

            Search.prototype.searchRemoveChoice = function(decorated, item) {
                this.trigger('unselect', {
                    data: item
                });

                this.trigger('open');

                this.$search.val(item.text + ' ');
            };

            Search.prototype.resizeSearch = function() {
                this.$search.css('width', '25px');

                var width = '';

                if (this.$search.attr('placeholder') !== '') {
                    width = this.$selection.find('.select2-selection__rendered').innerWidth();
                } else {
                    var minimumWidth = this.$search.val().length + 1;

                    width = (minimumWidth * 0.75) + 'em';
                }

                this.$search.css('width', width);
            };

            return Search;
        });

        S2.define('select2/selection/eventRelay', ['jquery'], function($) {
            function EventRelay() {}

            EventRelay.prototype.bind = function(decorated, container, $container) {
                var self = this;
                var relayEvents = ['open', 'opening', 'close', 'closing', 'select', 'selecting', 'unselect', 'unselecting'];

                var preventableEvents = ['opening', 'closing', 'selecting', 'unselecting'];

                decorated.call(this, container, $container);

                container.on('*', function(name, params) {
                    // Ignore events that should not be relayed
                    if ($.inArray(name, relayEvents) === -1) {
                        return;
                    }

                    // The parameters should always be an object
                    params = params || {};

                    // Generate the jQuery event for the Select2 event
                    var evt = $.Event('select2:' + name, {
                        params: params
                    });

                    self.$element.trigger(evt);

                    // Only handle preventable events if it was one
                    if ($.inArray(name, preventableEvents) === -1) {
                        return;
                    }

                    params.prevented = evt.isDefaultPrevented();
                });
            };

            return EventRelay;
        });

        S2.define('select2/translation', ['jquery', 'require'], function($, require) {
            function Translation(dict) {
                this.dict = dict || {};
            }

            Translation.prototype.all = function() {
                return this.dict;
            };

            Translation.prototype.get = function(key) {
                return this.dict[key];
            };

            Translation.prototype.extend = function(translation) {
                this.dict = $.extend({}, translation.all(), this.dict);
            };

            // Static functions

            Translation._cache = {};

            Translation.loadPath = function(path) {
                if (!(path in Translation._cache)) {
                    var translations = require(path);

                    Translation._cache[path] = translations;
                }

                return new Translation(Translation._cache[path]);
            };

            return Translation;
        });

        S2.define('select2/diacritics', [

        ], function() {
            var diacritics = {
                '\u24B6': 'A',
                '\uFF21': 'A',
                '\u00C0': 'A',
                '\u00C1': 'A',
                '\u00C2': 'A',
                '\u1EA6': 'A',
                '\u1EA4': 'A',
                '\u1EAA': 'A',
                '\u1EA8': 'A',
                '\u00C3': 'A',
                '\u0100': 'A',
                '\u0102': 'A',
                '\u1EB0': 'A',
                '\u1EAE': 'A',
                '\u1EB4': 'A',
                '\u1EB2': 'A',
                '\u0226': 'A',
                '\u01E0': 'A',
                '\u00C4': 'A',
                '\u01DE': 'A',
                '\u1EA2': 'A',
                '\u00C5': 'A',
                '\u01FA': 'A',
                '\u01CD': 'A',
                '\u0200': 'A',
                '\u0202': 'A',
                '\u1EA0': 'A',
                '\u1EAC': 'A',
                '\u1EB6': 'A',
                '\u1E00': 'A',
                '\u0104': 'A',
                '\u023A': 'A',
                '\u2C6F': 'A',
                '\uA732': 'AA',
                '\u00C6': 'AE',
                '\u01FC': 'AE',
                '\u01E2': 'AE',
                '\uA734': 'AO',
                '\uA736': 'AU',
                '\uA738': 'AV',
                '\uA73A': 'AV',
                '\uA73C': 'AY',
                '\u24B7': 'B',
                '\uFF22': 'B',
                '\u1E02': 'B',
                '\u1E04': 'B',
                '\u1E06': 'B',
                '\u0243': 'B',
                '\u0182': 'B',
                '\u0181': 'B',
                '\u24B8': 'C',
                '\uFF23': 'C',
                '\u0106': 'C',
                '\u0108': 'C',
                '\u010A': 'C',
                '\u010C': 'C',
                '\u00C7': 'C',
                '\u1E08': 'C',
                '\u0187': 'C',
                '\u023B': 'C',
                '\uA73E': 'C',
                '\u24B9': 'D',
                '\uFF24': 'D',
                '\u1E0A': 'D',
                '\u010E': 'D',
                '\u1E0C': 'D',
                '\u1E10': 'D',
                '\u1E12': 'D',
                '\u1E0E': 'D',
                '\u0110': 'D',
                '\u018B': 'D',
                '\u018A': 'D',
                '\u0189': 'D',
                '\uA779': 'D',
                '\u01F1': 'DZ',
                '\u01C4': 'DZ',
                '\u01F2': 'Dz',
                '\u01C5': 'Dz',
                '\u24BA': 'E',
                '\uFF25': 'E',
                '\u00C8': 'E',
                '\u00C9': 'E',
                '\u00CA': 'E',
                '\u1EC0': 'E',
                '\u1EBE': 'E',
                '\u1EC4': 'E',
                '\u1EC2': 'E',
                '\u1EBC': 'E',
                '\u0112': 'E',
                '\u1E14': 'E',
                '\u1E16': 'E',
                '\u0114': 'E',
                '\u0116': 'E',
                '\u00CB': 'E',
                '\u1EBA': 'E',
                '\u011A': 'E',
                '\u0204': 'E',
                '\u0206': 'E',
                '\u1EB8': 'E',
                '\u1EC6': 'E',
                '\u0228': 'E',
                '\u1E1C': 'E',
                '\u0118': 'E',
                '\u1E18': 'E',
                '\u1E1A': 'E',
                '\u0190': 'E',
                '\u018E': 'E',
                '\u24BB': 'F',
                '\uFF26': 'F',
                '\u1E1E': 'F',
                '\u0191': 'F',
                '\uA77B': 'F',
                '\u24BC': 'G',
                '\uFF27': 'G',
                '\u01F4': 'G',
                '\u011C': 'G',
                '\u1E20': 'G',
                '\u011E': 'G',
                '\u0120': 'G',
                '\u01E6': 'G',
                '\u0122': 'G',
                '\u01E4': 'G',
                '\u0193': 'G',
                '\uA7A0': 'G',
                '\uA77D': 'G',
                '\uA77E': 'G',
                '\u24BD': 'H',
                '\uFF28': 'H',
                '\u0124': 'H',
                '\u1E22': 'H',
                '\u1E26': 'H',
                '\u021E': 'H',
                '\u1E24': 'H',
                '\u1E28': 'H',
                '\u1E2A': 'H',
                '\u0126': 'H',
                '\u2C67': 'H',
                '\u2C75': 'H',
                '\uA78D': 'H',
                '\u24BE': 'I',
                '\uFF29': 'I',
                '\u00CC': 'I',
                '\u00CD': 'I',
                '\u00CE': 'I',
                '\u0128': 'I',
                '\u012A': 'I',
                '\u012C': 'I',
                '\u0130': 'I',
                '\u00CF': 'I',
                '\u1E2E': 'I',
                '\u1EC8': 'I',
                '\u01CF': 'I',
                '\u0208': 'I',
                '\u020A': 'I',
                '\u1ECA': 'I',
                '\u012E': 'I',
                '\u1E2C': 'I',
                '\u0197': 'I',
                '\u24BF': 'J',
                '\uFF2A': 'J',
                '\u0134': 'J',
                '\u0248': 'J',
                '\u24C0': 'K',
                '\uFF2B': 'K',
                '\u1E30': 'K',
                '\u01E8': 'K',
                '\u1E32': 'K',
                '\u0136': 'K',
                '\u1E34': 'K',
                '\u0198': 'K',
                '\u2C69': 'K',
                '\uA740': 'K',
                '\uA742': 'K',
                '\uA744': 'K',
                '\uA7A2': 'K',
                '\u24C1': 'L',
                '\uFF2C': 'L',
                '\u013F': 'L',
                '\u0139': 'L',
                '\u013D': 'L',
                '\u1E36': 'L',
                '\u1E38': 'L',
                '\u013B': 'L',
                '\u1E3C': 'L',
                '\u1E3A': 'L',
                '\u0141': 'L',
                '\u023D': 'L',
                '\u2C62': 'L',
                '\u2C60': 'L',
                '\uA748': 'L',
                '\uA746': 'L',
                '\uA780': 'L',
                '\u01C7': 'LJ',
                '\u01C8': 'Lj',
                '\u24C2': 'M',
                '\uFF2D': 'M',
                '\u1E3E': 'M',
                '\u1E40': 'M',
                '\u1E42': 'M',
                '\u2C6E': 'M',
                '\u019C': 'M',
                '\u24C3': 'N',
                '\uFF2E': 'N',
                '\u01F8': 'N',
                '\u0143': 'N',
                '\u00D1': 'N',
                '\u1E44': 'N',
                '\u0147': 'N',
                '\u1E46': 'N',
                '\u0145': 'N',
                '\u1E4A': 'N',
                '\u1E48': 'N',
                '\u0220': 'N',
                '\u019D': 'N',
                '\uA790': 'N',
                '\uA7A4': 'N',
                '\u01CA': 'NJ',
                '\u01CB': 'Nj',
                '\u24C4': 'O',
                '\uFF2F': 'O',
                '\u00D2': 'O',
                '\u00D3': 'O',
                '\u00D4': 'O',
                '\u1ED2': 'O',
                '\u1ED0': 'O',
                '\u1ED6': 'O',
                '\u1ED4': 'O',
                '\u00D5': 'O',
                '\u1E4C': 'O',
                '\u022C': 'O',
                '\u1E4E': 'O',
                '\u014C': 'O',
                '\u1E50': 'O',
                '\u1E52': 'O',
                '\u014E': 'O',
                '\u022E': 'O',
                '\u0230': 'O',
                '\u00D6': 'O',
                '\u022A': 'O',
                '\u1ECE': 'O',
                '\u0150': 'O',
                '\u01D1': 'O',
                '\u020C': 'O',
                '\u020E': 'O',
                '\u01A0': 'O',
                '\u1EDC': 'O',
                '\u1EDA': 'O',
                '\u1EE0': 'O',
                '\u1EDE': 'O',
                '\u1EE2': 'O',
                '\u1ECC': 'O',
                '\u1ED8': 'O',
                '\u01EA': 'O',
                '\u01EC': 'O',
                '\u00D8': 'O',
                '\u01FE': 'O',
                '\u0186': 'O',
                '\u019F': 'O',
                '\uA74A': 'O',
                '\uA74C': 'O',
                '\u01A2': 'OI',
                '\uA74E': 'OO',
                '\u0222': 'OU',
                '\u24C5': 'P',
                '\uFF30': 'P',
                '\u1E54': 'P',
                '\u1E56': 'P',
                '\u01A4': 'P',
                '\u2C63': 'P',
                '\uA750': 'P',
                '\uA752': 'P',
                '\uA754': 'P',
                '\u24C6': 'Q',
                '\uFF31': 'Q',
                '\uA756': 'Q',
                '\uA758': 'Q',
                '\u024A': 'Q',
                '\u24C7': 'R',
                '\uFF32': 'R',
                '\u0154': 'R',
                '\u1E58': 'R',
                '\u0158': 'R',
                '\u0210': 'R',
                '\u0212': 'R',
                '\u1E5A': 'R',
                '\u1E5C': 'R',
                '\u0156': 'R',
                '\u1E5E': 'R',
                '\u024C': 'R',
                '\u2C64': 'R',
                '\uA75A': 'R',
                '\uA7A6': 'R',
                '\uA782': 'R',
                '\u24C8': 'S',
                '\uFF33': 'S',
                '\u1E9E': 'S',
                '\u015A': 'S',
                '\u1E64': 'S',
                '\u015C': 'S',
                '\u1E60': 'S',
                '\u0160': 'S',
                '\u1E66': 'S',
                '\u1E62': 'S',
                '\u1E68': 'S',
                '\u0218': 'S',
                '\u015E': 'S',
                '\u2C7E': 'S',
                '\uA7A8': 'S',
                '\uA784': 'S',
                '\u24C9': 'T',
                '\uFF34': 'T',
                '\u1E6A': 'T',
                '\u0164': 'T',
                '\u1E6C': 'T',
                '\u021A': 'T',
                '\u0162': 'T',
                '\u1E70': 'T',
                '\u1E6E': 'T',
                '\u0166': 'T',
                '\u01AC': 'T',
                '\u01AE': 'T',
                '\u023E': 'T',
                '\uA786': 'T',
                '\uA728': 'TZ',
                '\u24CA': 'U',
                '\uFF35': 'U',
                '\u00D9': 'U',
                '\u00DA': 'U',
                '\u00DB': 'U',
                '\u0168': 'U',
                '\u1E78': 'U',
                '\u016A': 'U',
                '\u1E7A': 'U',
                '\u016C': 'U',
                '\u00DC': 'U',
                '\u01DB': 'U',
                '\u01D7': 'U',
                '\u01D5': 'U',
                '\u01D9': 'U',
                '\u1EE6': 'U',
                '\u016E': 'U',
                '\u0170': 'U',
                '\u01D3': 'U',
                '\u0214': 'U',
                '\u0216': 'U',
                '\u01AF': 'U',
                '\u1EEA': 'U',
                '\u1EE8': 'U',
                '\u1EEE': 'U',
                '\u1EEC': 'U',
                '\u1EF0': 'U',
                '\u1EE4': 'U',
                '\u1E72': 'U',
                '\u0172': 'U',
                '\u1E76': 'U',
                '\u1E74': 'U',
                '\u0244': 'U',
                '\u24CB': 'V',
                '\uFF36': 'V',
                '\u1E7C': 'V',
                '\u1E7E': 'V',
                '\u01B2': 'V',
                '\uA75E': 'V',
                '\u0245': 'V',
                '\uA760': 'VY',
                '\u24CC': 'W',
                '\uFF37': 'W',
                '\u1E80': 'W',
                '\u1E82': 'W',
                '\u0174': 'W',
                '\u1E86': 'W',
                '\u1E84': 'W',
                '\u1E88': 'W',
                '\u2C72': 'W',
                '\u24CD': 'X',
                '\uFF38': 'X',
                '\u1E8A': 'X',
                '\u1E8C': 'X',
                '\u24CE': 'Y',
                '\uFF39': 'Y',
                '\u1EF2': 'Y',
                '\u00DD': 'Y',
                '\u0176': 'Y',
                '\u1EF8': 'Y',
                '\u0232': 'Y',
                '\u1E8E': 'Y',
                '\u0178': 'Y',
                '\u1EF6': 'Y',
                '\u1EF4': 'Y',
                '\u01B3': 'Y',
                '\u024E': 'Y',
                '\u1EFE': 'Y',
                '\u24CF': 'Z',
                '\uFF3A': 'Z',
                '\u0179': 'Z',
                '\u1E90': 'Z',
                '\u017B': 'Z',
                '\u017D': 'Z',
                '\u1E92': 'Z',
                '\u1E94': 'Z',
                '\u01B5': 'Z',
                '\u0224': 'Z',
                '\u2C7F': 'Z',
                '\u2C6B': 'Z',
                '\uA762': 'Z',
                '\u24D0': 'a',
                '\uFF41': 'a',
                '\u1E9A': 'a',
                '\u00E0': 'a',
                '\u00E1': 'a',
                '\u00E2': 'a',
                '\u1EA7': 'a',
                '\u1EA5': 'a',
                '\u1EAB': 'a',
                '\u1EA9': 'a',
                '\u00E3': 'a',
                '\u0101': 'a',
                '\u0103': 'a',
                '\u1EB1': 'a',
                '\u1EAF': 'a',
                '\u1EB5': 'a',
                '\u1EB3': 'a',
                '\u0227': 'a',
                '\u01E1': 'a',
                '\u00E4': 'a',
                '\u01DF': 'a',
                '\u1EA3': 'a',
                '\u00E5': 'a',
                '\u01FB': 'a',
                '\u01CE': 'a',
                '\u0201': 'a',
                '\u0203': 'a',
                '\u1EA1': 'a',
                '\u1EAD': 'a',
                '\u1EB7': 'a',
                '\u1E01': 'a',
                '\u0105': 'a',
                '\u2C65': 'a',
                '\u0250': 'a',
                '\uA733': 'aa',
                '\u00E6': 'ae',
                '\u01FD': 'ae',
                '\u01E3': 'ae',
                '\uA735': 'ao',
                '\uA737': 'au',
                '\uA739': 'av',
                '\uA73B': 'av',
                '\uA73D': 'ay',
                '\u24D1': 'b',
                '\uFF42': 'b',
                '\u1E03': 'b',
                '\u1E05': 'b',
                '\u1E07': 'b',
                '\u0180': 'b',
                '\u0183': 'b',
                '\u0253': 'b',
                '\u24D2': 'c',
                '\uFF43': 'c',
                '\u0107': 'c',
                '\u0109': 'c',
                '\u010B': 'c',
                '\u010D': 'c',
                '\u00E7': 'c',
                '\u1E09': 'c',
                '\u0188': 'c',
                '\u023C': 'c',
                '\uA73F': 'c',
                '\u2184': 'c',
                '\u24D3': 'd',
                '\uFF44': 'd',
                '\u1E0B': 'd',
                '\u010F': 'd',
                '\u1E0D': 'd',
                '\u1E11': 'd',
                '\u1E13': 'd',
                '\u1E0F': 'd',
                '\u0111': 'd',
                '\u018C': 'd',
                '\u0256': 'd',
                '\u0257': 'd',
                '\uA77A': 'd',
                '\u01F3': 'dz',
                '\u01C6': 'dz',
                '\u24D4': 'e',
                '\uFF45': 'e',
                '\u00E8': 'e',
                '\u00E9': 'e',
                '\u00EA': 'e',
                '\u1EC1': 'e',
                '\u1EBF': 'e',
                '\u1EC5': 'e',
                '\u1EC3': 'e',
                '\u1EBD': 'e',
                '\u0113': 'e',
                '\u1E15': 'e',
                '\u1E17': 'e',
                '\u0115': 'e',
                '\u0117': 'e',
                '\u00EB': 'e',
                '\u1EBB': 'e',
                '\u011B': 'e',
                '\u0205': 'e',
                '\u0207': 'e',
                '\u1EB9': 'e',
                '\u1EC7': 'e',
                '\u0229': 'e',
                '\u1E1D': 'e',
                '\u0119': 'e',
                '\u1E19': 'e',
                '\u1E1B': 'e',
                '\u0247': 'e',
                '\u025B': 'e',
                '\u01DD': 'e',
                '\u24D5': 'f',
                '\uFF46': 'f',
                '\u1E1F': 'f',
                '\u0192': 'f',
                '\uA77C': 'f',
                '\u24D6': 'g',
                '\uFF47': 'g',
                '\u01F5': 'g',
                '\u011D': 'g',
                '\u1E21': 'g',
                '\u011F': 'g',
                '\u0121': 'g',
                '\u01E7': 'g',
                '\u0123': 'g',
                '\u01E5': 'g',
                '\u0260': 'g',
                '\uA7A1': 'g',
                '\u1D79': 'g',
                '\uA77F': 'g',
                '\u24D7': 'h',
                '\uFF48': 'h',
                '\u0125': 'h',
                '\u1E23': 'h',
                '\u1E27': 'h',
                '\u021F': 'h',
                '\u1E25': 'h',
                '\u1E29': 'h',
                '\u1E2B': 'h',
                '\u1E96': 'h',
                '\u0127': 'h',
                '\u2C68': 'h',
                '\u2C76': 'h',
                '\u0265': 'h',
                '\u0195': 'hv',
                '\u24D8': 'i',
                '\uFF49': 'i',
                '\u00EC': 'i',
                '\u00ED': 'i',
                '\u00EE': 'i',
                '\u0129': 'i',
                '\u012B': 'i',
                '\u012D': 'i',
                '\u00EF': 'i',
                '\u1E2F': 'i',
                '\u1EC9': 'i',
                '\u01D0': 'i',
                '\u0209': 'i',
                '\u020B': 'i',
                '\u1ECB': 'i',
                '\u012F': 'i',
                '\u1E2D': 'i',
                '\u0268': 'i',
                '\u0131': 'i',
                '\u24D9': 'j',
                '\uFF4A': 'j',
                '\u0135': 'j',
                '\u01F0': 'j',
                '\u0249': 'j',
                '\u24DA': 'k',
                '\uFF4B': 'k',
                '\u1E31': 'k',
                '\u01E9': 'k',
                '\u1E33': 'k',
                '\u0137': 'k',
                '\u1E35': 'k',
                '\u0199': 'k',
                '\u2C6A': 'k',
                '\uA741': 'k',
                '\uA743': 'k',
                '\uA745': 'k',
                '\uA7A3': 'k',
                '\u24DB': 'l',
                '\uFF4C': 'l',
                '\u0140': 'l',
                '\u013A': 'l',
                '\u013E': 'l',
                '\u1E37': 'l',
                '\u1E39': 'l',
                '\u013C': 'l',
                '\u1E3D': 'l',
                '\u1E3B': 'l',
                '\u017F': 'l',
                '\u0142': 'l',
                '\u019A': 'l',
                '\u026B': 'l',
                '\u2C61': 'l',
                '\uA749': 'l',
                '\uA781': 'l',
                '\uA747': 'l',
                '\u01C9': 'lj',
                '\u24DC': 'm',
                '\uFF4D': 'm',
                '\u1E3F': 'm',
                '\u1E41': 'm',
                '\u1E43': 'm',
                '\u0271': 'm',
                '\u026F': 'm',
                '\u24DD': 'n',
                '\uFF4E': 'n',
                '\u01F9': 'n',
                '\u0144': 'n',
                '\u00F1': 'n',
                '\u1E45': 'n',
                '\u0148': 'n',
                '\u1E47': 'n',
                '\u0146': 'n',
                '\u1E4B': 'n',
                '\u1E49': 'n',
                '\u019E': 'n',
                '\u0272': 'n',
                '\u0149': 'n',
                '\uA791': 'n',
                '\uA7A5': 'n',
                '\u01CC': 'nj',
                '\u24DE': 'o',
                '\uFF4F': 'o',
                '\u00F2': 'o',
                '\u00F3': 'o',
                '\u00F4': 'o',
                '\u1ED3': 'o',
                '\u1ED1': 'o',
                '\u1ED7': 'o',
                '\u1ED5': 'o',
                '\u00F5': 'o',
                '\u1E4D': 'o',
                '\u022D': 'o',
                '\u1E4F': 'o',
                '\u014D': 'o',
                '\u1E51': 'o',
                '\u1E53': 'o',
                '\u014F': 'o',
                '\u022F': 'o',
                '\u0231': 'o',
                '\u00F6': 'o',
                '\u022B': 'o',
                '\u1ECF': 'o',
                '\u0151': 'o',
                '\u01D2': 'o',
                '\u020D': 'o',
                '\u020F': 'o',
                '\u01A1': 'o',
                '\u1EDD': 'o',
                '\u1EDB': 'o',
                '\u1EE1': 'o',
                '\u1EDF': 'o',
                '\u1EE3': 'o',
                '\u1ECD': 'o',
                '\u1ED9': 'o',
                '\u01EB': 'o',
                '\u01ED': 'o',
                '\u00F8': 'o',
                '\u01FF': 'o',
                '\u0254': 'o',
                '\uA74B': 'o',
                '\uA74D': 'o',
                '\u0275': 'o',
                '\u01A3': 'oi',
                '\u0223': 'ou',
                '\uA74F': 'oo',
                '\u24DF': 'p',
                '\uFF50': 'p',
                '\u1E55': 'p',
                '\u1E57': 'p',
                '\u01A5': 'p',
                '\u1D7D': 'p',
                '\uA751': 'p',
                '\uA753': 'p',
                '\uA755': 'p',
                '\u24E0': 'q',
                '\uFF51': 'q',
                '\u024B': 'q',
                '\uA757': 'q',
                '\uA759': 'q',
                '\u24E1': 'r',
                '\uFF52': 'r',
                '\u0155': 'r',
                '\u1E59': 'r',
                '\u0159': 'r',
                '\u0211': 'r',
                '\u0213': 'r',
                '\u1E5B': 'r',
                '\u1E5D': 'r',
                '\u0157': 'r',
                '\u1E5F': 'r',
                '\u024D': 'r',
                '\u027D': 'r',
                '\uA75B': 'r',
                '\uA7A7': 'r',
                '\uA783': 'r',
                '\u24E2': 's',
                '\uFF53': 's',
                '\u00DF': 's',
                '\u015B': 's',
                '\u1E65': 's',
                '\u015D': 's',
                '\u1E61': 's',
                '\u0161': 's',
                '\u1E67': 's',
                '\u1E63': 's',
                '\u1E69': 's',
                '\u0219': 's',
                '\u015F': 's',
                '\u023F': 's',
                '\uA7A9': 's',
                '\uA785': 's',
                '\u1E9B': 's',
                '\u24E3': 't',
                '\uFF54': 't',
                '\u1E6B': 't',
                '\u1E97': 't',
                '\u0165': 't',
                '\u1E6D': 't',
                '\u021B': 't',
                '\u0163': 't',
                '\u1E71': 't',
                '\u1E6F': 't',
                '\u0167': 't',
                '\u01AD': 't',
                '\u0288': 't',
                '\u2C66': 't',
                '\uA787': 't',
                '\uA729': 'tz',
                '\u24E4': 'u',
                '\uFF55': 'u',
                '\u00F9': 'u',
                '\u00FA': 'u',
                '\u00FB': 'u',
                '\u0169': 'u',
                '\u1E79': 'u',
                '\u016B': 'u',
                '\u1E7B': 'u',
                '\u016D': 'u',
                '\u00FC': 'u',
                '\u01DC': 'u',
                '\u01D8': 'u',
                '\u01D6': 'u',
                '\u01DA': 'u',
                '\u1EE7': 'u',
                '\u016F': 'u',
                '\u0171': 'u',
                '\u01D4': 'u',
                '\u0215': 'u',
                '\u0217': 'u',
                '\u01B0': 'u',
                '\u1EEB': 'u',
                '\u1EE9': 'u',
                '\u1EEF': 'u',
                '\u1EED': 'u',
                '\u1EF1': 'u',
                '\u1EE5': 'u',
                '\u1E73': 'u',
                '\u0173': 'u',
                '\u1E77': 'u',
                '\u1E75': 'u',
                '\u0289': 'u',
                '\u24E5': 'v',
                '\uFF56': 'v',
                '\u1E7D': 'v',
                '\u1E7F': 'v',
                '\u028B': 'v',
                '\uA75F': 'v',
                '\u028C': 'v',
                '\uA761': 'vy',
                '\u24E6': 'w',
                '\uFF57': 'w',
                '\u1E81': 'w',
                '\u1E83': 'w',
                '\u0175': 'w',
                '\u1E87': 'w',
                '\u1E85': 'w',
                '\u1E98': 'w',
                '\u1E89': 'w',
                '\u2C73': 'w',
                '\u24E7': 'x',
                '\uFF58': 'x',
                '\u1E8B': 'x',
                '\u1E8D': 'x',
                '\u24E8': 'y',
                '\uFF59': 'y',
                '\u1EF3': 'y',
                '\u00FD': 'y',
                '\u0177': 'y',
                '\u1EF9': 'y',
                '\u0233': 'y',
                '\u1E8F': 'y',
                '\u00FF': 'y',
                '\u1EF7': 'y',
                '\u1E99': 'y',
                '\u1EF5': 'y',
                '\u01B4': 'y',
                '\u024F': 'y',
                '\u1EFF': 'y',
                '\u24E9': 'z',
                '\uFF5A': 'z',
                '\u017A': 'z',
                '\u1E91': 'z',
                '\u017C': 'z',
                '\u017E': 'z',
                '\u1E93': 'z',
                '\u1E95': 'z',
                '\u01B6': 'z',
                '\u0225': 'z',
                '\u0240': 'z',
                '\u2C6C': 'z',
                '\uA763': 'z',
                '\u0386': '\u0391',
                '\u0388': '\u0395',
                '\u0389': '\u0397',
                '\u038A': '\u0399',
                '\u03AA': '\u0399',
                '\u038C': '\u039F',
                '\u038E': '\u03A5',
                '\u03AB': '\u03A5',
                '\u038F': '\u03A9',
                '\u03AC': '\u03B1',
                '\u03AD': '\u03B5',
                '\u03AE': '\u03B7',
                '\u03AF': '\u03B9',
                '\u03CA': '\u03B9',
                '\u0390': '\u03B9',
                '\u03CC': '\u03BF',
                '\u03CD': '\u03C5',
                '\u03CB': '\u03C5',
                '\u03B0': '\u03C5',
                '\u03C9': '\u03C9',
                '\u03C2': '\u03C3'
            };

            return diacritics;
        });

        S2.define('select2/data/base', ['../utils'], function(Utils) {
            function BaseAdapter($element, options) {
                BaseAdapter.__super__.constructor.call(this);
            }

            Utils.Extend(BaseAdapter, Utils.Observable);

            BaseAdapter.prototype.current = function(callback) {
                throw new Error('The `current` method must be defined in child classes.');
            };

            BaseAdapter.prototype.query = function(params, callback) {
                throw new Error('The `query` method must be defined in child classes.');
            };

            BaseAdapter.prototype.bind = function(container, $container) {
                // Can be implemented in subclasses
            };

            BaseAdapter.prototype.destroy = function() {
                // Can be implemented in subclasses
            };

            BaseAdapter.prototype.generateResultId = function(container, data) {
                var id = container.id + '-result-';

                id += Utils.generateChars(4);

                if (data.id != null) {
                    id += '-' + data.id.toString();
                } else {
                    id += '-' + Utils.generateChars(4);
                }
                return id;
            };

            return BaseAdapter;
        });

        S2.define('select2/data/select', ['./base', '../utils', 'jquery'], function(BaseAdapter, Utils, $) {
            function SelectAdapter($element, options) {
                this.$element = $element;
                this.options = options;

                SelectAdapter.__super__.constructor.call(this);
            }

            Utils.Extend(SelectAdapter, BaseAdapter);

            SelectAdapter.prototype.current = function(callback) {
                var data = [];
                var self = this;

                this.$element.find(':selected').each(function() {
                    var $option = $(this);

                    var option = self.item($option);

                    data.push(option);
                });

                callback(data);
            };

            SelectAdapter.prototype.select = function(data) {
                var self = this;

                data.selected = true;

                // If data.element is a DOM node, use it instead
                if ($(data.element).is('option')) {
                    data.element.selected = true;

                    this.$element.trigger('change');

                    return;
                }

                if (this.$element.prop('multiple')) {
                    this.current(function(currentData) {
                        var val = [];

                        data = [data];
                        data.push.apply(data, currentData);

                        for (var d = 0; d < data.length; d++) {
                            var id = data[d].id;

                            if ($.inArray(id, val) === -1) {
                                val.push(id);
                            }
                        }

                        self.$element.val(val);
                        self.$element.trigger('change');
                    });
                } else {
                    var val = data.id;

                    this.$element.val(val);
                    this.$element.trigger('change');
                }
            };

            SelectAdapter.prototype.unselect = function(data) {
                var self = this;

                if (!this.$element.prop('multiple')) {
                    return;
                }

                data.selected = false;

                if ($(data.element).is('option')) {
                    data.element.selected = false;

                    this.$element.trigger('change');

                    return;
                }

                this.current(function(currentData) {
                    var val = [];

                    for (var d = 0; d < currentData.length; d++) {
                        var id = currentData[d].id;

                        if (id !== data.id && $.inArray(id, val) === -1) {
                            val.push(id);
                        }
                    }

                    self.$element.val(val);

                    self.$element.trigger('change');
                });
            };

            SelectAdapter.prototype.bind = function(container, $container) {
                var self = this;

                this.container = container;

                container.on('select', function(params) {
                    self.select(params.data);
                });

                container.on('unselect', function(params) {
                    self.unselect(params.data);
                });
            };

            SelectAdapter.prototype.destroy = function() {
                // Remove anything added to child elements
                this.$element.find('*').each(function() {
                    // Remove any custom data set by Select2
                    $.removeData(this, 'data');
                });
            };

            SelectAdapter.prototype.query = function(params, callback) {
                var data = [];
                var self = this;

                var $options = this.$element.children();

                $options.each(function() {
                    var $option = $(this);

                    if (!$option.is('option') && !$option.is('optgroup')) {
                        return;
                    }

                    var option = self.item($option);

                    var matches = self.matches(params, option);

                    if (matches !== null) {
                        data.push(matches);
                    }
                });

                callback({
                    results: data
                });
            };

            SelectAdapter.prototype.addOptions = function($options) {
                Utils.appendMany(this.$element, $options);
            };

            SelectAdapter.prototype.option = function(data) {
                var option;

                if (data.children) {
                    option = document.createElement('optgroup');
                    option.label = data.text;
                } else {
                    option = document.createElement('option');

                    if (option.textContent !== undefined) {
                        option.textContent = data.text;
                    } else {
                        option.innerText = data.text;
                    }
                }

                if (data.id) {
                    option.value = data.id;
                }

                if (data.disabled) {
                    option.disabled = true;
                }

                if (data.selected) {
                    option.selected = true;
                }

                if (data.title) {
                    option.title = data.title;
                }

                var $option = $(option);

                var normalizedData = this._normalizeItem(data);
                normalizedData.element = option;

                // Override the option's data with the combined data
                $.data(option, 'data', normalizedData);

                return $option;
            };

            SelectAdapter.prototype.item = function($option) {
                var data = {};

                data = $.data($option[0], 'data');

                if (data != null) {
                    return data;
                }

                if ($option.is('option')) {
                    data = {
                        id: $option.val(),
                        text: $option.text(),
                        disabled: $option.prop('disabled'),
                        selected: $option.prop('selected'),
                        title: $option.prop('title')
                    };
                } else if ($option.is('optgroup')) {
                    data = {
                        text: $option.prop('label'),
                        children: [],
                        title: $option.prop('title')
                    };

                    var $children = $option.children('option');
                    var children = [];

                    for (var c = 0; c < $children.length; c++) {
                        var $child = $($children[c]);

                        var child = this.item($child);

                        children.push(child);
                    }

                    data.children = children;
                }

                data = this._normalizeItem(data);
                data.element = $option[0];

                $.data($option[0], 'data', data);

                return data;
            };

            SelectAdapter.prototype._normalizeItem = function(item) {
                if (!$.isPlainObject(item)) {
                    item = {
                        id: item,
                        text: item
                    };
                }

                item = $.extend({}, {
                    text: ''
                }, item);

                var defaults = {
                    selected: false,
                    disabled: false
                };

                if (item.id != null) {
                    item.id = item.id.toString();
                }

                if (item.text != null) {
                    item.text = item.text.toString();
                }

                if (item._resultId == null && item.id && this.container != null) {
                    item._resultId = this.generateResultId(this.container, item);
                }

                return $.extend({}, defaults, item);
            };

            SelectAdapter.prototype.matches = function(params, data) {
                var matcher = this.options.get('matcher');

                return matcher(params, data);
            };

            return SelectAdapter;
        });

        S2.define('select2/data/array', ['./select', '../utils', 'jquery'], function(SelectAdapter, Utils, $) {
            function ArrayAdapter($element, options) {
                var data = options.get('data') || [];

                ArrayAdapter.__super__.constructor.call(this, $element, options);

                this.addOptions(this.convertToOptions(data));
            }

            Utils.Extend(ArrayAdapter, SelectAdapter);

            ArrayAdapter.prototype.select = function(data) {
                var $option = this.$element.find('option').filter(function(i, elm) {
                    return elm.value == data.id.toString();
                });

                if ($option.length === 0) {
                    $option = this.option(data);

                    this.addOptions($option);
                }

                ArrayAdapter.__super__.select.call(this, data);
            };

            ArrayAdapter.prototype.convertToOptions = function(data) {
                var self = this;

                var $existing = this.$element.find('option');
                var existingIds = $existing.map(function() {
                    return self.item($(this)).id;
                }).get();

                var $options = [];

                // Filter out all items except for the one passed in the argument
                function onlyItem(item) {
                    return function() {
                        return $(this).val() == item.id;
                    };
                }

                for (var d = 0; d < data.length; d++) {
                    var item = this._normalizeItem(data[d]);

                    // Skip items which were pre-loaded, only merge the data
                    if ($.inArray(item.id, existingIds) >= 0) {
                        var $existingOption = $existing.filter(onlyItem(item));

                        var existingData = this.item($existingOption);
                        var newData = $.extend(true, {}, existingData, item);

                        var $newOption = this.option(existingData);

                        $existingOption.replaceWith($newOption);

                        continue;
                    }

                    var $option = this.option(item);

                    if (item.children) {
                        var $children = this.convertToOptions(item.children);

                        Utils.appendMany($option, $children);
                    }

                    $options.push($option);
                }

                return $options;
            };

            return ArrayAdapter;
        });

        S2.define('select2/data/ajax', ['./array', '../utils', 'jquery'], function(ArrayAdapter, Utils, $) {
            function AjaxAdapter($element, options) {
                this.ajaxOptions = this._applyDefaults(options.get('ajax'));

                if (this.ajaxOptions.processResults != null) {
                    this.processResults = this.ajaxOptions.processResults;
                }

                ArrayAdapter.__super__.constructor.call(this, $element, options);
            }

            Utils.Extend(AjaxAdapter, ArrayAdapter);

            AjaxAdapter.prototype._applyDefaults = function(options) {
                var defaults = {
                    data: function(params) {
                        return {
                            q: params.term
                        };
                    },
                    transport: function(params, success, failure) {
                        var $request = $.ajax(params);

                        $request.then(success);
                        $request.fail(failure);

                        return $request;
                    }
                };

                return $.extend({}, defaults, options, true);
            };

            AjaxAdapter.prototype.processResults = function(results) {
                return results;
            };

            AjaxAdapter.prototype.query = function(params, callback) {
                var matches = [];
                var self = this;

                if (this._request != null) {
                    // JSONP requests cannot always be aborted
                    if ($.isFunction(this._request.abort)) {
                        this._request.abort();
                    }

                    this._request = null;
                }

                var options = $.extend({
                    type: 'GET'
                }, this.ajaxOptions);

                if (typeof options.url === 'function') {
                    options.url = options.url(params);
                }

                if (typeof options.data === 'function') {
                    options.data = options.data(params);
                }

                function request() {
                    var $request = options.transport(options, function(data) {
                        var results = self.processResults(data, params);

                        if (self.options.get('debug') && window.console && console.error) {
                            // Check to make sure that the response included a `results` key.
                            if (!results || !results.results || !$.isArray(results.results)) {
                                console.error('Select2: The AJAX results did not return an array in the ' + '`results` key of the response.');
                            }
                        }

                        callback(results);
                    }, function() {
                        // TODO: Handle AJAX errors
                    });

                    self._request = $request;
                }

                if (this.ajaxOptions.delay && params.term !== '') {
                    if (this._queryTimeout) {
                        window.clearTimeout(this._queryTimeout);
                    }

                    this._queryTimeout = window.setTimeout(request, this.ajaxOptions.delay);
                } else {
                    request();
                }
            };

            return AjaxAdapter;
        });

        S2.define('select2/data/tags', ['jquery'], function($) {
            function Tags(decorated, $element, options) {
                var tags = options.get('tags');

                var createTag = options.get('createTag');

                if (createTag !== undefined) {
                    this.createTag = createTag;
                }

                decorated.call(this, $element, options);

                if ($.isArray(tags)) {
                    for (var t = 0; t < tags.length; t++) {
                        var tag = tags[t];
                        var item = this._normalizeItem(tag);

                        var $option = this.option(item);

                        this.$element.append($option);
                    }
                }
            }

            Tags.prototype.query = function(decorated, params, callback) {
                var self = this;

                this._removeOldTags();

                if (params.term == null || params.page != null) {
                    decorated.call(this, params, callback);
                    return;
                }

                function wrapper(obj, child) {
                    var data = obj.results;

                    for (var i = 0; i < data.length; i++) {
                        var option = data[i];

                        var checkChildren = (
                        option.children != null && !wrapper({
                            results: option.children
                        }, true));

                        var checkText = option.text === params.term;

                        if (checkText || checkChildren) {
                            if (child) {
                                return false;
                            }

                            obj.data = data;
                            callback(obj);

                            return;
                        }
                    }

                    if (child) {
                        return true;
                    }

                    var tag = self.createTag(params);

                    if (tag != null) {
                        var $option = self.option(tag);
                        $option.attr('data-select2-tag', true);

                        self.addOptions([$option]);

                        self.insertTag(data, tag);
                    }

                    obj.results = data;

                    callback(obj);
                }

                decorated.call(this, params, wrapper);
            };

            Tags.prototype.createTag = function(decorated, params) {
                var term = $.trim(params.term);

                if (term === '') {
                    return null;
                }

                return {
                    id: term,
                    text: term
                };
            };

            Tags.prototype.insertTag = function(_, data, tag) {
                data.unshift(tag);
            };

            Tags.prototype._removeOldTags = function(_) {
                var tag = this._lastTag;

                var $options = this.$element.find('option[data-select2-tag]');

                $options.each(function() {
                    if (this.selected) {
                        return;
                    }

                    $(this).remove();
                });
            };

            return Tags;
        });

        S2.define('select2/data/tokenizer', ['jquery'], function($) {
            function Tokenizer(decorated, $element, options) {
                var tokenizer = options.get('tokenizer');

                if (tokenizer !== undefined) {
                    this.tokenizer = tokenizer;
                }

                decorated.call(this, $element, options);
            }

            Tokenizer.prototype.bind = function(decorated, container, $container) {
                decorated.call(this, container, $container);

                this.$search = container.dropdown.$search || container.selection.$search || $container.find('.select2-search__field');
            };

            Tokenizer.prototype.query = function(decorated, params, callback) {
                var self = this;

                function select(data) {
                    self.select(data);
                }

                params.term = params.term || '';

                var tokenData = this.tokenizer(params, this.options, select);

                if (tokenData.term !== params.term) {
                    // Replace the search term if we have the search box
                    if (this.$search.length) {
                        this.$search.val(tokenData.term);
                        this.$search.focus();
                    }

                    params.term = tokenData.term;
                }

                decorated.call(this, params, callback);
            };

            Tokenizer.prototype.tokenizer = function(_, params, options, callback) {
                var separators = options.get('tokenSeparators') || [];
                var term = params.term;
                var i = 0;

                var createTag = this.createTag || function(params) {
                        return {
                            id: params.term,
                            text: params.term
                        };
                    };

                while (i < term.length) {
                    var termChar = term[i];

                    if ($.inArray(termChar, separators) === -1) {
                        i++;

                        continue;
                    }

                    var part = term.substr(0, i);
                    var partParams = $.extend({}, params, {
                        term: part
                    });

                    var data = createTag(partParams);

                    callback(data);

                    // Reset the term to not include the tokenized portion
                    term = term.substr(i + 1) || '';
                    i = 0;
                }

                return {
                    term: term
                };
            };

            return Tokenizer;
        });

        S2.define('select2/data/minimumInputLength', [

        ], function() {
            function MinimumInputLength(decorated, $e, options) {
                this.minimumInputLength = options.get('minimumInputLength');

                decorated.call(this, $e, options);
            }

            MinimumInputLength.prototype.query = function(decorated, params, callback) {
                params.term = params.term || '';

                if (params.term.length < this.minimumInputLength) {
                    this.trigger('results:message', {
                        message: 'inputTooShort',
                        args: {
                            minimum: this.minimumInputLength,
                            input: params.term,
                            params: params
                        }
                    });

                    return;
                }

                decorated.call(this, params, callback);
            };

            return MinimumInputLength;
        });

        S2.define('select2/data/maximumInputLength', [

        ], function() {
            function MaximumInputLength(decorated, $e, options) {
                this.maximumInputLength = options.get('maximumInputLength');

                decorated.call(this, $e, options);
            }

            MaximumInputLength.prototype.query = function(decorated, params, callback) {
                params.term = params.term || '';

                if (this.maximumInputLength > 0 && params.term.length > this.maximumInputLength) {
                    this.trigger('results:message', {
                        message: 'inputTooLong',
                        args: {
                            maximum: this.maximumInputLength,
                            input: params.term,
                            params: params
                        }
                    });

                    return;
                }

                decorated.call(this, params, callback);
            };

            return MaximumInputLength;
        });

        S2.define('select2/data/maximumSelectionLength', [

        ], function() {
            function MaximumSelectionLength(decorated, $e, options) {
                this.maximumSelectionLength = options.get('maximumSelectionLength');

                decorated.call(this, $e, options);
            }

            MaximumSelectionLength.prototype.query = function(decorated, params, callback) {
                var self = this;

                this.current(function(currentData) {
                    var count = currentData != null ? currentData.length : 0;
                    if (self.maximumSelectionLength > 0 && count >= self.maximumSelectionLength) {
                        self.trigger('results:message', {
                            message: 'maximumSelected',
                            args: {
                                maximum: self.maximumSelectionLength
                            }
                        });
                        return;
                    }
                    decorated.call(self, params, callback);
                });
            };

            return MaximumSelectionLength;
        });

        S2.define('select2/dropdown', ['jquery', './utils'], function($, Utils) {
            function Dropdown($element, options) {
                this.$element = $element;
                this.options = options;

                Dropdown.__super__.constructor.call(this);
            }

            Utils.Extend(Dropdown, Utils.Observable);

            Dropdown.prototype.render = function() {
                var $dropdown = $('<span class="select2-dropdown">' + '<span class="select2-results"></span>' + '</span>');

                $dropdown.attr('dir', this.options.get('dir'));

                this.$dropdown = $dropdown;

                return $dropdown;
            };

            Dropdown.prototype.position = function($dropdown, $container) {
                // Should be implmented in subclasses
            };

            Dropdown.prototype.destroy = function() {
                // Remove the dropdown from the DOM
                this.$dropdown.remove();
            };

            return Dropdown;
        });

        S2.define('select2/dropdown/search', ['jquery', '../utils'], function($, Utils) {
            function Search() {}

            Search.prototype.render = function(decorated) {
                var $rendered = decorated.call(this);

                var $search = $('<span class="select2-search select2-search--dropdown">' + '<input class="select2-search__field" type="search" tabindex="-1"' + ' autocomplete="off" autocorrect="off" autocapitalize="off"' + ' spellcheck="false" role="textbox" />' + '</span>');

                this.$searchContainer = $search;
                this.$search = $search.find('input');

                $rendered.prepend($search);

                return $rendered;
            };

            Search.prototype.bind = function(decorated, container, $container) {
                var self = this;

                decorated.call(this, container, $container);

                this.$search.on('keydown', function(evt) {
                    self.trigger('keypress', evt);

                    self._keyUpPrevented = evt.isDefaultPrevented();
                });

                // Workaround for browsers which do not support the `input` event
                // This will prevent double-triggering of events for browsers which support
                // both the `keyup` and `input` events.
                this.$search.on('input', function(evt) {
                    // Unbind the duplicated `keyup` event
                    $(this).off('keyup');
                });

                this.$search.on('keyup input', function(evt) {
                    self.handleSearch(evt);
                });

                container.on('open', function() {
                    self.$search.attr('tabindex', 0);

                    self.$search.focus();

                    window.setTimeout(function() {
                        self.$search.focus();
                    }, 0);
                });

                container.on('close', function() {
                    self.$search.attr('tabindex', - 1);

                    self.$search.val('');
                });

                container.on('results:all', function(params) {
                    if (params.query.term == null || params.query.term === '') {
                        var showSearch = self.showSearch(params);

                        if (showSearch) {
                            self.$searchContainer.removeClass('select2-search--hide');
                        } else {
                            self.$searchContainer.addClass('select2-search--hide');
                        }
                    }
                });
            };

            Search.prototype.handleSearch = function(evt) {
                if (!this._keyUpPrevented) {
                    var input = this.$search.val();

                    this.trigger('query', {
                        term: input
                    });
                }

                this._keyUpPrevented = false;
            };

            Search.prototype.showSearch = function(_, params) {
                return true;
            };

            return Search;
        });

        S2.define('select2/dropdown/hidePlaceholder', [

        ], function() {
            function HidePlaceholder(decorated, $element, options, dataAdapter) {
                this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

                decorated.call(this, $element, options, dataAdapter);
            }

            HidePlaceholder.prototype.append = function(decorated, data) {
                data.results = this.removePlaceholder(data.results);

                decorated.call(this, data);
            };

            HidePlaceholder.prototype.normalizePlaceholder = function(_, placeholder) {
                if (typeof placeholder === 'string') {
                    placeholder = {
                        id: '',
                        text: placeholder
                    };
                }

                return placeholder;
            };

            HidePlaceholder.prototype.removePlaceholder = function(_, data) {
                var modifiedData = data.slice(0);

                for (var d = data.length - 1; d >= 0; d--) {
                    var item = data[d];

                    if (this.placeholder.id === item.id) {
                        modifiedData.splice(d, 1);
                    }
                }

                return modifiedData;
            };

            return HidePlaceholder;
        });

        S2.define('select2/dropdown/infiniteScroll', ['jquery'], function($) {
            function InfiniteScroll(decorated, $element, options, dataAdapter) {
                this.lastParams = {};

                decorated.call(this, $element, options, dataAdapter);

                this.$loadingMore = this.createLoadingMore();
                this.loading = false;
            }

            InfiniteScroll.prototype.append = function(decorated, data) {
                this.$loadingMore.remove();
                this.loading = false;

                decorated.call(this, data);

                if (this.showLoadingMore(data)) {
                    this.$results.append(this.$loadingMore);
                }
            };

            InfiniteScroll.prototype.bind = function(decorated, container, $container) {
                var self = this;

                decorated.call(this, container, $container);

                container.on('query', function(params) {
                    self.lastParams = params;
                    self.loading = true;
                });

                container.on('query:append', function(params) {
                    self.lastParams = params;
                    self.loading = true;
                });

                this.$results.on('scroll', function() {
                    var isLoadMoreVisible = $.contains(
                    document.documentElement,
                    self.$loadingMore[0]);

                    if (self.loading || !isLoadMoreVisible) {
                        return;
                    }

                    var currentOffset = self.$results.offset().top + self.$results.outerHeight(false);
                    var loadingMoreOffset = self.$loadingMore.offset().top + self.$loadingMore.outerHeight(false);

                    if (currentOffset + 50 >= loadingMoreOffset) {
                        self.loadMore();
                    }
                });
            };

            InfiniteScroll.prototype.loadMore = function() {
                this.loading = true;

                var params = $.extend({}, {
                    page: 1
                }, this.lastParams);

                params.page++;

                this.trigger('query:append', params);
            };

            InfiniteScroll.prototype.showLoadingMore = function(_, data) {
                return data.pagination && data.pagination.more;
            };

            InfiniteScroll.prototype.createLoadingMore = function() {
                var $option = $('<li class="option load-more" role="treeitem"></li>');

                var message = this.options.get('translations').get('loadingMore');

                $option.html(message(this.lastParams));

                return $option;
            };

            return InfiniteScroll;
        });

        S2.define('select2/dropdown/attachBody', ['jquery', '../utils'], function($, Utils) {
            function AttachBody(decorated, $element, options) {
                this.$dropdownParent = options.get('dropdownParent') || document.body;

                decorated.call(this, $element, options);
            }

            AttachBody.prototype.bind = function(decorated, container, $container) {
                var self = this;

                var setupResultsEvents = false;

                decorated.call(this, container, $container);

                container.on('open', function() {
                    self._showDropdown();
                    self._attachPositioningHandler(container);

                    if (!setupResultsEvents) {
                        setupResultsEvents = true;

                        container.on('results:all', function() {
                            self._positionDropdown();
                            self._resizeDropdown();
                        });

                        container.on('results:append', function() {
                            self._positionDropdown();
                            self._resizeDropdown();
                        });
                    }
                });

                container.on('close', function() {
                    self._hideDropdown();
                    self._detachPositioningHandler(container);
                });

                this.$dropdownContainer.on('mousedown', function(evt) {
                    evt.stopPropagation();
                });
            };

            AttachBody.prototype.position = function(decorated, $dropdown, $container) {
                // Clone all of the container classes
                $dropdown.attr('class', $container.attr('class'));

                $dropdown.removeClass('select2');
                $dropdown.addClass('select2-container--open');

                $dropdown.css({
                    position: 'absolute',
                    top: -999999
                });

                this.$container = $container;
            };

            AttachBody.prototype.render = function(decorated) {
                var $container = $('<span></span>');

                var $dropdown = decorated.call(this);
                $container.append($dropdown);

                this.$dropdownContainer = $container;

                return $container;
            };

            AttachBody.prototype._hideDropdown = function(decorated) {
                this.$dropdownContainer.detach();
            };

            AttachBody.prototype._attachPositioningHandler = function(container) {
                var self = this;

                var scrollEvent = 'scroll.select2.' + container.id;
                var resizeEvent = 'resize.select2.' + container.id;
                var orientationEvent = 'orientationchange.select2.' + container.id;

                var $watchers = this.$container.parents().filter(Utils.hasScroll);
                $watchers.each(function() {
                    $(this).data('select2-scroll-position', {
                        x: $(this).scrollLeft(),
                        y: $(this).scrollTop()
                    });
                });

                $watchers.on(scrollEvent, function(ev) {
                    var position = $(this).data('select2-scroll-position');
                    $(this).scrollTop(position.y);
                });

                $(window).on(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent,

                function(e) {
                    self._positionDropdown();
                    self._resizeDropdown();
                });
            };

            AttachBody.prototype._detachPositioningHandler = function(container) {
                var scrollEvent = 'scroll.select2.' + container.id;
                var resizeEvent = 'resize.select2.' + container.id;
                var orientationEvent = 'orientationchange.select2.' + container.id;

                var $watchers = this.$container.parents().filter(Utils.hasScroll);
                $watchers.off(scrollEvent);

                $(window).off(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent);
            };

            AttachBody.prototype._positionDropdown = function() {
                var $window = $(window);

                var isCurrentlyAbove = this.$dropdown.hasClass('select2-dropdown--above');
                var isCurrentlyBelow = this.$dropdown.hasClass('select2-dropdown--below');

                var newDirection = null;

                var position = this.$container.position();
                var offset = this.$container.offset();

                offset.bottom = offset.top + this.$container.outerHeight(false);

                var container = {
                    height: this.$container.outerHeight(false)
                };

                container.top = offset.top;
                container.bottom = offset.top + container.height;

                var dropdown = {
                    height: this.$dropdown.outerHeight(false)
                };

                var viewport = {
                    top: $window.scrollTop(),
                    bottom: $window.scrollTop() + $window.height()
                };

                var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
                var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

                var css = {
                    left: offset.left,
                    top: container.bottom
                };

                if (!isCurrentlyAbove && !isCurrentlyBelow) {
                    newDirection = 'below';
                }

                if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove) {
                    newDirection = 'above';
                } else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove) {
                    newDirection = 'below';
                }

                if (newDirection == 'above' || (isCurrentlyAbove && newDirection !== 'below')) {
                    css.top = container.top - dropdown.height;
                }

                if (newDirection != null) {
                    this.$dropdown.removeClass('select2-dropdown--below select2-dropdown--above')
                        .addClass('select2-dropdown--' + newDirection);
                    this.$container.removeClass('select2-container--below select2-container--above')
                        .addClass('select2-container--' + newDirection);
                }

                this.$dropdownContainer.css(css);
            };

            AttachBody.prototype._resizeDropdown = function() {
                this.$dropdownContainer.width();

                var css = {
                    width: this.$container.outerWidth(false) + 'px'
                };

                if (this.options.get('dropdownAutoWidth')) {
                    css.minWidth = css.width;
                    css.width = 'auto';
                }

                this.$dropdown.css(css);
            };

            AttachBody.prototype._showDropdown = function(decorated) {
                this.$dropdownContainer.appendTo(this.$dropdownParent);

                this._positionDropdown();
                this._resizeDropdown();
            };

            return AttachBody;
        });

        S2.define('select2/dropdown/minimumResultsForSearch', [

        ], function() {
            function countResults(data) {
                var count = 0;

                for (var d = 0; d < data.length; d++) {
                    var item = data[d];

                    if (item.children) {
                        count += countResults(item.children);
                    } else {
                        count++;
                    }
                }

                return count;
            }

            function MinimumResultsForSearch(decorated, $element, options, dataAdapter) {
                this.minimumResultsForSearch = options.get('minimumResultsForSearch');

                if (this.minimumResultsForSearch < 0) {
                    this.minimumResultsForSearch = Infinity;
                }

                decorated.call(this, $element, options, dataAdapter);
            }

            MinimumResultsForSearch.prototype.showSearch = function(decorated, params) {
                if (countResults(params.data.results) < this.minimumResultsForSearch) {
                    return false;
                }

                return decorated.call(this, params);
            };

            return MinimumResultsForSearch;
        });

        S2.define('select2/dropdown/selectOnClose', [

        ], function() {
            function SelectOnClose() {}

            SelectOnClose.prototype.bind = function(decorated, container, $container) {
                var self = this;

                decorated.call(this, container, $container);

                container.on('close', function() {
                    self._handleSelectOnClose();
                });
            };

            SelectOnClose.prototype._handleSelectOnClose = function() {
                var $highlightedResults = this.getHighlightedResults();

                if ($highlightedResults.length < 1) {
                    return;
                }

                this.trigger('select', {
                    data: $highlightedResults.data('data')
                });
            };

            return SelectOnClose;
        });

        S2.define('select2/dropdown/closeOnSelect', [

        ], function() {
            function CloseOnSelect() {}

            CloseOnSelect.prototype.bind = function(decorated, container, $container) {
                var self = this;

                decorated.call(this, container, $container);

                container.on('select', function(evt) {
                    self._selectTriggered(evt);
                });

                container.on('unselect', function(evt) {
                    self._selectTriggered(evt);
                });
            };

            CloseOnSelect.prototype._selectTriggered = function(_, evt) {
                var originalEvent = evt.originalEvent;

                // Don't close if the control key is being held
                if (originalEvent && originalEvent.ctrlKey) {
                    return;
                }

                this.trigger('close');
            };

            return CloseOnSelect;
        });

        S2.define('select2/i18n/en', [], function() {
            // English
            return {
                errorLoading: function() {
                    return 'The results could not be loaded.';
                },
                inputTooLong: function(args) {
                    var overChars = args.input.length - args.maximum;

                    var message = 'Please delete ' + overChars + ' character';

                    if (overChars != 1) {
                        message += 's';
                    }

                    return message;
                },
                inputTooShort: function(args) {
                    var remainingChars = args.minimum - args.input.length;

                    var message = 'Please enter ' + remainingChars + ' or more characters';

                    return message;
                },
                loadingMore: function() {
                    return 'Loading more results…';
                },
                maximumSelected: function(args) {
                    var message = 'You can only select ' + args.maximum + ' item';

                    if (args.maximum != 1) {
                        message += 's';
                    }

                    return message;
                },
                noResults: function() {
                    return 'No results found';
                },
                searching: function() {
                    return 'Searching…';
                }
            };
        });

        S2.define('select2/defaults', ['jquery', 'require',

        './results',

        './selection/single', './selection/multiple', './selection/placeholder', './selection/allowClear', './selection/search', './selection/eventRelay',

        './utils', './translation', './diacritics',

        './data/select', './data/array', './data/ajax', './data/tags', './data/tokenizer', './data/minimumInputLength', './data/maximumInputLength', './data/maximumSelectionLength',

        './dropdown', './dropdown/search', './dropdown/hidePlaceholder', './dropdown/infiniteScroll', './dropdown/attachBody', './dropdown/minimumResultsForSearch', './dropdown/selectOnClose', './dropdown/closeOnSelect',

        './i18n/en'], function($, require,

        ResultsList,

        SingleSelection, MultipleSelection, Placeholder, AllowClear,
        SelectionSearch, EventRelay,

        Utils, Translation, DIACRITICS,

        SelectData, ArrayData, AjaxData, Tags, Tokenizer,
        MinimumInputLength, MaximumInputLength, MaximumSelectionLength,

        Dropdown, DropdownSearch, HidePlaceholder, InfiniteScroll,
        AttachBody, MinimumResultsForSearch, SelectOnClose, CloseOnSelect,

        EnglishTranslation) {
            function Defaults() {
                this.reset();
            }

            Defaults.prototype.apply = function(options) {
                options = $.extend({}, this.defaults, options);

                if (options.dataAdapter == null) {
                    if (options.ajax != null) {
                        options.dataAdapter = AjaxData;
                    } else if (options.data != null) {
                        options.dataAdapter = ArrayData;
                    } else {
                        options.dataAdapter = SelectData;
                    }

                    if (options.minimumInputLength > 0) {
                        options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MinimumInputLength);
                    }

                    if (options.maximumInputLength > 0) {
                        options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MaximumInputLength);
                    }

                    if (options.maximumSelectionLength > 0) {
                        options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        MaximumSelectionLength);
                    }

                    if (options.tags) {
                        options.dataAdapter = Utils.Decorate(options.dataAdapter, Tags);
                    }

                    if (options.tokenSeparators != null || options.tokenizer != null) {
                        options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        Tokenizer);
                    }

                    if (options.query != null) {
                        var Query = require(options.amdBase + 'compat/query');

                        options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        Query);
                    }

                    if (options.initSelection != null) {
                        var InitSelection = require(options.amdBase + 'compat/initSelection');

                        options.dataAdapter = Utils.Decorate(
                        options.dataAdapter,
                        InitSelection);
                    }
                }

                if (options.resultsAdapter == null) {
                    options.resultsAdapter = ResultsList;

                    if (options.ajax != null) {
                        options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        InfiniteScroll);
                    }

                    if (options.placeholder != null) {
                        options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        HidePlaceholder);
                    }

                    if (options.selectOnClose) {
                        options.resultsAdapter = Utils.Decorate(
                        options.resultsAdapter,
                        SelectOnClose);
                    }
                }

                if (options.dropdownAdapter == null) {
                    if (options.multiple) {
                        options.dropdownAdapter = Dropdown;
                    } else {
                        var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);

                        options.dropdownAdapter = SearchableDropdown;
                    }

                    if (options.minimumResultsForSearch !== 0) {
                        options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        MinimumResultsForSearch);
                    }

                    if (options.closeOnSelect) {
                        options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        CloseOnSelect);
                    }

                    if (
                    options.dropdownCssClass != null || options.dropdownCss != null || options.adaptDropdownCssClass != null) {
                        var DropdownCSS = require(options.amdBase + 'compat/dropdownCss');

                        options.dropdownAdapter = Utils.Decorate(
                        options.dropdownAdapter,
                        DropdownCSS);
                    }

                    options.dropdownAdapter = Utils.Decorate(
                    options.dropdownAdapter,
                    AttachBody);
                }

                if (options.selectionAdapter == null) {
                    if (options.multiple) {
                        options.selectionAdapter = MultipleSelection;
                    } else {
                        options.selectionAdapter = SingleSelection;
                    }

                    // Add the placeholder mixin if a placeholder was specified
                    if (options.placeholder != null) {
                        options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        Placeholder);
                    }

                    if (options.allowClear) {
                        options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        AllowClear);
                    }

                    if (options.multiple) {
                        options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        SelectionSearch);
                    }

                    if (
                    options.containerCssClass != null || options.containerCss != null || options.adaptContainerCssClass != null) {
                        var ContainerCSS = require(options.amdBase + 'compat/containerCss');

                        options.selectionAdapter = Utils.Decorate(
                        options.selectionAdapter,
                        ContainerCSS);
                    }

                    options.selectionAdapter = Utils.Decorate(
                    options.selectionAdapter,
                    EventRelay);
                }

                if (typeof options.language === 'string') {
                    // Check if the language is specified with a region
                    if (options.language.indexOf('-') > 0) {
                        // Extract the region information if it is included
                        var languageParts = options.language.split('-');
                        var baseLanguage = languageParts[0];

                        options.language = [options.language, baseLanguage];
                    } else {
                        options.language = [options.language];
                    }
                }

                if ($.isArray(options.language)) {
                    var languages = new Translation();
                    options.language.push('en');

                    var languageNames = options.language;

                    for (var l = 0; l < languageNames.length; l++) {
                        var name = languageNames[l];
                        var language = {};

                        try {
                            // Try to load it with the original name
                            language = Translation.loadPath(name);
                        } catch (e) {
                            try {
                                // If we couldn't load it, check if it wasn't the full path
                                name = this.defaults.amdLanguageBase + name;
                                language = Translation.loadPath(name);
                            } catch (ex) {
                                // The translation could not be loaded at all. Sometimes this is
                                // because of a configuration problem, other times this can be
                                // because of how Select2 helps load all possible translation files.
                                if (options.debug && window.console && console.warn) {
                                    console.warn('Select2: The language file for "' + name + '" could not be ' + 'automatically loaded. A fallback will be used instead.');
                                }

                                continue;
                            }
                        }

                        languages.extend(language);
                    }

                    options.translations = languages;
                } else {
                    var baseTranslation = Translation.loadPath(
                    this.defaults.amdLanguageBase + 'en');
                    var customTranslation = new Translation(options.language);

                    customTranslation.extend(baseTranslation);

                    options.translations = customTranslation;
                }

                return options;
            };

            Defaults.prototype.reset = function() {
                function stripDiacritics(text) {
                    // Used 'uni range + named function' from http://jsperf.com/diacritics/18
                    function match(a) {
                        return DIACRITICS[a] || a;
                    }

                    return text.replace(/[^\u0000-\u007E]/g, match);
                }

                function matcher(params, data) {
                    // Always return the object if there is nothing to compare
                    if ($.trim(params.term) === '') {
                        return data;
                    }

                    // Do a recursive check for options with children
                    if (data.children && data.children.length > 0) {
                        // Clone the data object if there are children
                        // This is required as we modify the object to remove any non-matches
                        var match = $.extend(true, {}, data);

                        // Check each child of the option
                        for (var c = data.children.length - 1; c >= 0; c--) {
                            var child = data.children[c];

                            var matches = matcher(params, child);

                            // If there wasn't a match, remove the object in the array
                            if (matches == null) {
                                match.children.splice(c, 1);
                            }
                        }

                        // If any children matched, return the new object
                        if (match.children.length > 0) {
                            return match;
                        }

                        // If there were no matching children, check just the plain object
                        return matcher(params, match);
                    }

                    var original = stripDiacritics(data.text).toUpperCase();
                    var term = stripDiacritics(params.term).toUpperCase();

                    // Check if the text contains the term
                    if (original.indexOf(term) > -1) {
                        return data;
                    }

                    // If it doesn't contain the term, don't return anything
                    return null;
                }

                this.defaults = {
                    amdBase: './',
                    amdLanguageBase: './i18n/',
                    closeOnSelect: true,
                    debug: false,
                    dropdownAutoWidth: false,
                    escapeMarkup: Utils.escapeMarkup,
                    language: EnglishTranslation,
                    matcher: matcher,
                    minimumInputLength: 0,
                    maximumInputLength: 0,
                    maximumSelectionLength: 0,
                    minimumResultsForSearch: 0,
                    selectOnClose: false,
                    sorter: function(data) {
                        return data;
                    },
                    templateResult: function(result) {
                        return result.text;
                    },
                    templateSelection: function(selection) {
                        return selection.text;
                    },
                    theme: 'default',
                    width: 'resolve'
                };
            };

            Defaults.prototype.set = function(key, value) {
                var camelKey = $.camelCase(key);

                var data = {};
                data[camelKey] = value;

                var convertedData = Utils._convertData(data);

                $.extend(this.defaults, convertedData);
            };

            var defaults = new Defaults();

            return defaults;
        });

        S2.define('select2/options', ['require', 'jquery', './defaults', './utils'], function(require, $, Defaults, Utils) {
            function Options(options, $element) {
                this.options = options;

                if ($element != null) {
                    this.fromElement($element);
                }

                this.options = Defaults.apply(this.options);

                if ($element && $element.is('input')) {
                    var InputCompat = require(this.get('amdBase') + 'compat/inputData');

                    this.options.dataAdapter = Utils.Decorate(
                    this.options.dataAdapter,
                    InputCompat);
                }
            }

            Options.prototype.fromElement = function($e) {
                var excludedData = ['select2'];

                if (this.options.multiple == null) {
                    this.options.multiple = $e.prop('multiple');
                }

                if (this.options.disabled == null) {
                    this.options.disabled = $e.prop('disabled');
                }

                if (this.options.language == null) {
                    if ($e.prop('lang')) {
                        this.options.language = $e.prop('lang').toLowerCase();
                    } else if ($e.closest('[lang]').prop('lang')) {
                        this.options.language = $e.closest('[lang]').prop('lang');
                    }
                }

                if (this.options.dir == null) {
                    if ($e.prop('dir')) {
                        this.options.dir = $e.prop('dir');
                    } else if ($e.closest('[dir]').prop('dir')) {
                        this.options.dir = $e.closest('[dir]').prop('dir');
                    } else {
                        this.options.dir = 'ltr';
                    }
                }

                $e.prop('disabled', this.options.disabled);
                $e.prop('multiple', this.options.multiple);

                if ($e.data('select2Tags')) {
                    if (this.options.debug && window.console && console.warn) {
                        console.warn('Select2: The `data-select2-tags` attribute has been changed to ' + 'use the `data-data` and `data-tags="true"` attributes and will be ' + 'removed in future versions of Select2.');
                    }

                    $e.data('data', $e.data('select2Tags'));
                    $e.data('tags', true);
                }

                if ($e.data('ajaxUrl')) {
                    if (this.options.debug && window.console && console.warn) {
                        console.warn('Select2: The `data-ajax-url` attribute has been changed to ' + '`data-ajax--url` and support for the old attribute will be removed' + ' in future versions of Select2.');
                    }

                    $e.attr('ajax--url', $e.data('ajaxUrl'));
                    $e.data('ajax--url', $e.data('ajaxUrl'));
                }

                var dataset = {};

                // Prefer the element's `dataset` attribute if it exists
                // jQuery 1.x does not correctly handle data attributes with multiple dashes
                if ($.fn.jquery && $.fn.jquery.substr(0, 2) == '1.' && $e[0].dataset) {
                    dataset = $.extend(true, {}, $e[0].dataset, $e.data());
                } else {
                    dataset = $e.data();
                }

                var data = $.extend(true, {}, dataset);

                data = Utils._convertData(data);

                for (var key in data) {
                    if ($.inArray(key, excludedData) > -1) {
                        continue;
                    }

                    if ($.isPlainObject(this.options[key])) {
                        $.extend(this.options[key], data[key]);
                    } else {
                        this.options[key] = data[key];
                    }
                }

                return this;
            };

            Options.prototype.get = function(key) {
                return this.options[key];
            };

            Options.prototype.set = function(key, val) {
                this.options[key] = val;
            };

            return Options;
        });

        S2.define('select2/core', ['jquery', './options', './utils', './keys'], function($, Options, Utils, KEYS) {
            var Select2 = function($element, options) {
                if ($element.data('select2') != null) {
                    $element.data('select2').destroy();
                }

                this.$element = $element;

                this.id = this._generateId($element);

                options = options || {};

                this.options = new Options(options, $element);

                Select2.__super__.constructor.call(this);

                // Set up the tabindex

                var tabindex = $element.attr('tabindex') || 0;
                $element.data('old-tabindex', tabindex);
                $element.attr('tabindex', '-1');

                // Set up containers and adapters

                var DataAdapter = this.options.get('dataAdapter');
                this.dataAdapter = new DataAdapter($element, this.options);

                var $container = this.render();

                this._placeContainer($container);

                var SelectionAdapter = this.options.get('selectionAdapter');
                this.selection = new SelectionAdapter($element, this.options);
                this.$selection = this.selection.render();

                this.selection.position(this.$selection, $container);

                var DropdownAdapter = this.options.get('dropdownAdapter');
                this.dropdown = new DropdownAdapter($element, this.options);
                this.$dropdown = this.dropdown.render();

                this.dropdown.position(this.$dropdown, $container);

                var ResultsAdapter = this.options.get('resultsAdapter');
                this.results = new ResultsAdapter($element, this.options, this.dataAdapter);
                this.$results = this.results.render();

                this.results.position(this.$results, this.$dropdown);

                // Bind events

                var self = this;

                // Bind the container to all of the adapters
                this._bindAdapters();

                // Register any DOM event handlers
                this._registerDomEvents();

                // Register any internal event handlers
                this._registerDataEvents();
                this._registerSelectionEvents();
                this._registerDropdownEvents();
                this._registerResultsEvents();
                this._registerEvents();

                // Set the initial state
                this.dataAdapter.current(function(initialData) {
                    self.trigger('selection:update', {
                        data: initialData
                    });
                });

                // Hide the original select
                $element.addClass('select2-hidden-accessible');
                $element.attr('aria-hidden', 'true');

                // Synchronize any monitored attributes
                this._syncAttributes();

                $element.data('select2', this);
            };

            Utils.Extend(Select2, Utils.Observable);

            Select2.prototype._generateId = function($element) {
                var id = '';

                if ($element.attr('id') != null) {
                    id = $element.attr('id');
                } else if ($element.attr('name') != null) {
                    id = $element.attr('name') + '-' + Utils.generateChars(2);
                } else {
                    id = Utils.generateChars(4);
                }

                id = 'select2-' + id;

                return id;
            };

            Select2.prototype._placeContainer = function($container) {
                $container.insertAfter(this.$element);

                var width = this._resolveWidth(this.$element, this.options.get('width'));

                if (width != null) {
                    $container.css('width', width);
                }
            };

            Select2.prototype._resolveWidth = function($element, method) {
                var WIDTH = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;

                if (method == 'resolve') {
                    var styleWidth = this._resolveWidth($element, 'style');

                    if (styleWidth != null) {
                        return styleWidth;
                    }

                    return this._resolveWidth($element, 'element');
                }

                if (method == 'element') {
                    var elementWidth = $element.outerWidth(false);

                    if (elementWidth <= 0) {
                        return 'auto';
                    }

                    return elementWidth + 'px';
                }

                if (method == 'style') {
                    var style = $element.attr('style');

                    if (typeof(style) !== 'string') {
                        return null;
                    }

                    var attrs = style.split(';');

                    for (var i = 0, l = attrs.length; i < l; i = i + 1) {
                        var attr = attrs[i].replace(/\s/g, '');
                        var matches = attr.match(WIDTH);

                        if (matches !== null && matches.length >= 1) {
                            return matches[1];
                        }
                    }

                    return null;
                }

                return method;
            };

            Select2.prototype._bindAdapters = function() {
                this.dataAdapter.bind(this, this.$container);
                this.selection.bind(this, this.$container);

                this.dropdown.bind(this, this.$container);
                this.results.bind(this, this.$container);
            };

            Select2.prototype._registerDomEvents = function() {
                var self = this;

                this.$element.on('change.select2', function() {
                    self.dataAdapter.current(function(data) {
                        self.trigger('selection:update', {
                            data: data
                        });
                    });
                });

                this._sync = Utils.bind(this._syncAttributes, this);

                if (this.$element[0].attachEvent) {
                    this.$element[0].attachEvent('onpropertychange', this._sync);
                }

                var observer = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

                if (observer != null) {
                    this._observer = new observer(function(mutations) {
                        $.each(mutations, self._sync);
                    });
                    this._observer.observe(this.$element[0], {
                        attributes: true,
                        subtree: false
                    });
                } else if (this.$element[0].addEventListener) {
                    this.$element[0].addEventListener('DOMAttrModified', self._sync, false);
                }
            };

            Select2.prototype._registerDataEvents = function() {
                var self = this;

                this.dataAdapter.on('*', function(name, params) {
                    self.trigger(name, params);
                });
            };

            Select2.prototype._registerSelectionEvents = function() {
                var self = this;
                var nonRelayEvents = ['toggle'];

                this.selection.on('toggle', function() {
                    self.toggleDropdown();
                });

                this.selection.on('*', function(name, params) {
                    if ($.inArray(name, nonRelayEvents) !== -1) {
                        return;
                    }

                    self.trigger(name, params);
                });
            };

            Select2.prototype._registerDropdownEvents = function() {
                var self = this;

                this.dropdown.on('*', function(name, params) {
                    self.trigger(name, params);
                });
            };

            Select2.prototype._registerResultsEvents = function() {
                var self = this;

                this.results.on('*', function(name, params) {
                    self.trigger(name, params);
                });
            };

            Select2.prototype._registerEvents = function() {
                var self = this;

                this.on('open', function() {
                    self.$container.addClass('select2-container--open');
                });

                this.on('close', function() {
                    self.$container.removeClass('select2-container--open');
                });

                this.on('enable', function() {
                    self.$container.removeClass('select2-container--disabled');
                });

                this.on('disable', function() {
                    self.$container.addClass('select2-container--disabled');
                });

                this.on('focus', function() {
                    self.$container.addClass('select2-container--focus');
                });

                this.on('blur', function() {
                    self.$container.removeClass('select2-container--focus');
                });

                this.on('query', function(params) {
                    if (!self.isOpen()) {
                        self.trigger('open');
                    }

                    this.dataAdapter.query(params, function(data) {
                        self.trigger('results:all', {
                            data: data,
                            query: params
                        });
                    });
                });

                this.on('query:append', function(params) {
                    this.dataAdapter.query(params, function(data) {
                        self.trigger('results:append', {
                            data: data,
                            query: params
                        });
                    });
                });

                this.on('keypress', function(evt) {
                    var key = evt.which;

                    if (self.isOpen()) {
                        if (key === KEYS.ENTER) {
                            self.trigger('results:select');

                            evt.preventDefault();
                        } else if ((key === KEYS.SPACE && evt.ctrlKey)) {
                            self.trigger('results:toggle');

                            evt.preventDefault();
                        } else if (key === KEYS.UP) {
                            self.trigger('results:previous');

                            evt.preventDefault();
                        } else if (key === KEYS.DOWN) {
                            self.trigger('results:next');

                            evt.preventDefault();
                        } else if (key === KEYS.ESC || key === KEYS.TAB) {
                            self.close();

                            evt.preventDefault();
                        }
                    } else {
                        if (key === KEYS.ENTER || key === KEYS.SPACE || ((key === KEYS.DOWN || key === KEYS.UP) && evt.altKey)) {
                            self.open();

                            evt.preventDefault();
                        }
                    }
                });
            };

            Select2.prototype._syncAttributes = function() {
                this.options.set('disabled', this.$element.prop('disabled'));

                if (this.options.get('disabled')) {
                    if (this.isOpen()) {
                        this.close();
                    }

                    this.trigger('disable');
                } else {
                    this.trigger('enable');
                }
            };

            /**
             * Override the trigger method to automatically trigger pre-events when
             * there are events that can be prevented.
             */
            Select2.prototype.trigger = function(name, args) {
                var actualTrigger = Select2.__super__.trigger;
                var preTriggerMap = {
                    'open': 'opening',
                    'close': 'closing',
                    'select': 'selecting',
                    'unselect': 'unselecting'
                };

                if (name in preTriggerMap) {
                    var preTriggerName = preTriggerMap[name];
                    var preTriggerArgs = {
                        prevented: false,
                        name: name,
                        args: args
                    };

                    actualTrigger.call(this, preTriggerName, preTriggerArgs);

                    if (preTriggerArgs.prevented) {
                        args.prevented = true;

                        return;
                    }
                }

                actualTrigger.call(this, name, args);
            };

            Select2.prototype.toggleDropdown = function() {
                if (this.options.get('disabled')) {
                    return;
                }

                if (this.isOpen()) {
                    this.close();
                } else {
                    this.open();
                }
            };

            Select2.prototype.open = function() {
                if (this.isOpen()) {
                    return;
                }

                this.trigger('query', {});

                this.trigger('open');
            };

            Select2.prototype.close = function() {
                if (!this.isOpen()) {
                    return;
                }

                this.trigger('close');
            };

            Select2.prototype.isOpen = function() {
                return this.$container.hasClass('select2-container--open');
            };

            Select2.prototype.enable = function(args) {
                if (this.options.get('debug') && window.console && console.warn) {
                    console.warn('Select2: The `select2("enable")` method has been deprecated and will' + ' be removed in later Select2 versions. Use $element.prop("disabled")' + ' instead.');
                }

                if (args == null || args.length === 0) {
                    args = [true];
                }

                var disabled = !args[0];

                this.$element.prop('disabled', disabled);
            };

            Select2.prototype.data = function() {
                if (this.options.get('debug') && arguments.length > 0 && window.console && console.warn) {
                    console.warn('Select2: Data can no longer be set using `select2("data")`. You ' + 'should consider setting the value instead using `$element.val()`.');
                }

                var data = [];

                this.dataAdapter.current(function(currentData) {
                    data = currentData;
                });

                return data;
            };

            Select2.prototype.val = function(args) {
                if (this.options.get('debug') && window.console && console.warn) {
                    console.warn('Select2: The `select2("val")` method has been deprecated and will be' + ' removed in later Select2 versions. Use $element.val() instead.');
                }

                if (args == null || args.length === 0) {
                    return this.$element.val();
                }

                var newVal = args[0];

                if ($.isArray(newVal)) {
                    newVal = $.map(newVal, function(obj) {
                        return obj.toString();
                    });
                }

                this.$element.val(newVal).trigger('change');
            };

            Select2.prototype.destroy = function() {
                this.$container.remove();

                if (this.$element[0].detachEvent) {
                    this.$element[0].detachEvent('onpropertychange', this._sync);
                }

                if (this._observer != null) {
                    this._observer.disconnect();
                    this._observer = null;
                } else if (this.$element[0].removeEventListener) {
                    this.$element[0].removeEventListener('DOMAttrModified', this._sync, false);
                }

                this._sync = null;

                this.$element.off('.select2');
                this.$element.attr('tabindex', this.$element.data('old-tabindex'));

                this.$element.removeClass('select2-hidden-accessible');
                this.$element.attr('aria-hidden', 'false');
                this.$element.removeData('select2');

                this.dataAdapter.destroy();
                this.selection.destroy();
                this.dropdown.destroy();
                this.results.destroy();

                this.dataAdapter = null;
                this.selection = null;
                this.dropdown = null;
                this.results = null;
            };

            Select2.prototype.render = function() {
                var $container = $('<span class="select2 select2-container">' + '<span class="selection"></span>' + '<span class="dropdown-wrapper" aria-hidden="true"></span>' + '</span>');

                $container.attr('dir', this.options.get('dir'));

                this.$container = $container;

                this.$container.addClass('select2-container--' + this.options.get('theme'));

                $container.data('element', this.$element);

                return $container;
            };

            return Select2;
        });

        S2.define('jquery.select2', ['jquery', 'require',

        './select2/core', './select2/defaults'], function($, require, Select2, Defaults) {
            // Force jQuery.mousewheel to be loaded if it hasn't already
            require('jquery.mousewheel');

            if ($.fn.select2 == null) {
                // All methods that should return the element
                var thisMethods = ['open', 'close', 'destroy'];

                $.fn.select2 = function(options) {
                    options = options || {};

                    if (typeof options === 'object') {
                        this.each(function() {
                            var instanceOptions = $.extend({}, options, true);

                            var instance = new Select2($(this), instanceOptions);
                        });

                        return this;
                    } else if (typeof options === 'string') {
                        var instance = this.data('select2');

                        if (instance == null && window.console && console.error) {
                            console.error('The select2(\'' + options + '\') method was called on an ' + 'element that is not using Select2.');
                        }

                        var args = Array.prototype.slice.call(arguments, 1);

                        var ret = instance[options](args);

                        // Check if we should be returning `this`
                        if ($.inArray(options, thisMethods) > -1) {
                            return this;
                        }

                        return ret;
                    } else {
                        throw new Error('Invalid arguments for Select2: ' + options);
                    }
                };
            }

            if ($.fn.select2.defaults == null) {
                $.fn.select2.defaults = Defaults;
            }

            return Select2;
        });

        S2.define('jquery.mousewheel', ['jquery'], function($) {
            // Used to shim jQuery.mousewheel for non-full builds.
            return $;
        });

        // Return the AMD loader configuration so it can be used outside of this file
        return {
            define: S2.define,
            require: S2.require
        };
    }());

    // Autoload the jQuery bindings
    // We know that all of the modules exist above this, so we're safe
    var select2 = S2.require('jquery.select2');

    // Hold the AMD module references on the jQuery function that was just loaded
    // This allows Select2 to use the internal loader outside of this file, such
    // as in the language files.
    jQuery.fn.select2.amd = S2;

    // Return the Select2 instance for anyone who is importing it.
    return select2;
}));

























































































/**
src/editable-form/editable-form.js
Form with single input element, two buttons and two states: normal/loading.
Applied as jQuery method to DIV tag (not to form tag!). This is because form can be in loading state when spinner shown.
Editableform is linked with one of input types, e.g. 'text', 'select' etc.
@class editableform
@uses text
@uses textarea
**/
(function ($) {
    "use strict";

    var EditableForm = function (div, options) {
        this.options = $.extend({}, $.fn.editableform.defaults, options);
        this.$div = $(div); //div, containing form. Not form tag. Not editable-element.
        if(!this.options.scope) {
            this.options.scope = this;
        }
        //nothing shown after init
    };

    EditableForm.prototype = {
        constructor: EditableForm,
        initInput: function() {  //called once
            //take input from options (as it is created in editable-element)
            this.input = this.options.input;

            //set initial value
            //todo: may be add check: typeof str === 'string' ?
            this.value = this.input.str2value(this.options.value);

            //prerender: get input.$input
            this.input.prerender();
        },
        initTemplate: function() {
            this.$form = $($.fn.editableform.template);
        },
        initButtons: function() {
            var $btn = this.$form.find('.editable-buttons');
            $btn.append($.fn.editableform.buttons);
            if(this.options.showbuttons === 'bottom') {
                $btn.addClass('editable-buttons-bottom');
            }
        },
        /**
        Renders editableform
        @method render
        **/
        render: function() {
            //init loader
            this.$loading = $($.fn.editableform.loading);
            this.$div.empty().append(this.$loading);

            //init form template and buttons
            this.initTemplate();
            if(this.options.showbuttons) {
                this.initButtons();
            } else {
                this.$form.find('.editable-buttons').remove();
            }

            //show loading state
            this.showLoading();

            //flag showing is form now saving value to server.
            //It is needed to wait when closing form.
            this.isSaving = false;

            /**
            Fired when rendering starts
            @event rendering
            @param {Object} event event object
            **/
            this.$div.triggerHandler('rendering');

            //init input
            this.initInput();

            //append input to form
            this.$form.find('div.editable-input').append(this.input.$tpl);

            //append form to container
            this.$div.append(this.$form);

            //render input
            $.when(this.input.render())
            .then($.proxy(function () {
                //setup input to submit automatically when no buttons shown
                if(!this.options.showbuttons) {
                    this.input.autosubmit();
                }

                //attach 'cancel' handler
                this.$form.find('.editable-cancel').click($.proxy(this.cancel, this));

                if(this.input.error) {
                    this.error(this.input.error);
                    this.$form.find('.editable-submit').attr('disabled', true);
                    this.input.$input.attr('disabled', true);
                    //prevent form from submitting
                    this.$form.submit(function(e){ e.preventDefault(); });
                } else {
                    this.error(false);
                    this.input.$input.removeAttr('disabled');
                    this.$form.find('.editable-submit').removeAttr('disabled');
                    var value = (this.value === null || this.value === undefined || this.value === '') ? this.options.defaultValue : this.value;
                    this.input.value2input(value);
                    //attach submit handler
                    this.$form.submit($.proxy(this.submit, this));
                }

                /**
                Fired when form is rendered
                @event rendered
                @param {Object} event event object
                **/
                this.$div.triggerHandler('rendered');

                this.showForm();

                //call postrender method to perform actions required visibility of form
                if(this.input.postrender) {
                    this.input.postrender();
                }
            }, this));
        },
        cancel: function() {
            /**
            Fired when form was cancelled by user
            @event cancel
            @param {Object} event event object
            **/
            this.$div.triggerHandler('cancel');
        },
        showLoading: function() {
            var w, h;
            if(this.$form) {
                //set loading size equal to form
                w = this.$form.outerWidth();
                h = this.$form.outerHeight();
                if(w) {
                    this.$loading.width(w);
                }
                if(h) {
                    this.$loading.height(h);
                }
                this.$form.hide();
            } else {
                //stretch loading to fill container width
                w = this.$loading.parent().width();
                if(w) {
                    this.$loading.width(w);
                }
            }
            this.$loading.show();
        },

        showForm: function(activate) {
            this.$loading.hide();
            this.$form.show();
            if(activate !== false) {
                this.input.activate();
            }
            /**
            Fired when form is shown
            @event show
            @param {Object} event event object
            **/
            this.$div.triggerHandler('show');
        },

        error: function(msg) {
            var $group = this.$form.find('.control-group'),
                $block = this.$form.find('.editable-error-block'),
                lines;

            if(msg === false) {
                $group.removeClass($.fn.editableform.errorGroupClass);
                $block.removeClass($.fn.editableform.errorBlockClass).empty().hide();
            } else {
                //convert newline to <br> for more pretty error display
                if(msg) {
                    lines = (''+msg).split('\n');
                    for (var i = 0; i < lines.length; i++) {
                        lines[i] = $('<div>').text(lines[i]).html();
                    }
                    msg = lines.join('<br>');
                }
                $group.addClass($.fn.editableform.errorGroupClass);
                $block.addClass($.fn.editableform.errorBlockClass).html(msg).show();
            }
        },

        submit: function(e) {
            e.stopPropagation();
            e.preventDefault();

            //get new value from input
            var newValue = this.input.input2value();

            //validation: if validate returns string or truthy value - means error
            //if returns object like {newValue: '...'} => submitted value is reassigned to it
            var error = this.validate(newValue);
            if ($.type(error) === 'object' && error.newValue !== undefined) {
                newValue = error.newValue;
                this.input.value2input(newValue);
                if(typeof error.msg === 'string') {
                    this.error(error.msg);
                    this.showForm();
                    return;
                }
            } else if (error) {
                this.error(error);
                this.showForm();
                return;
            }

            //if value not changed --> trigger 'nochange' event and return
            /*jslint eqeq: true*/
            if (!this.options.savenochange && this.input.value2str(newValue) == this.input.value2str(this.value)) {
            /*jslint eqeq: false*/
                /**
                Fired when value not changed but form is submitted. Requires savenochange = false.
                @event nochange
                @param {Object} event event object
                **/
                this.$div.triggerHandler('nochange');
                return;
            }

            //convert value for submitting to server
            var submitValue = this.input.value2submit(newValue);

            this.isSaving = true;

            //sending data to server
            $.when(this.save(submitValue))
            .done($.proxy(function(response) {
                this.isSaving = false;

                //run success callback
                var res = typeof this.options.success === 'function' ? this.options.success.call(this.options.scope, response, newValue) : null;

                //if success callback returns false --> keep form open and do not activate input
                if(res === false) {
                    this.error(false);
                    this.showForm(false);
                    return;
                }

                //if success callback returns string -->  keep form open, show error and activate input
                if(typeof res === 'string') {
                    this.error(res);
                    this.showForm();
                    return;
                }

                //if success callback returns object like {newValue: <something>} --> use that value instead of submitted
                //it is usefull if you want to chnage value in url-function
                if(res && typeof res === 'object' && res.hasOwnProperty('newValue')) {
                    newValue = res.newValue;
                }

                //clear error message
                this.error(false);
                this.value = newValue;
                /**
                Fired when form is submitted
                @event save
                @param {Object} event event object
                @param {Object} params additional params
                @param {mixed} params.newValue raw new value
                @param {mixed} params.submitValue submitted value as string
                @param {Object} params.response ajax response
                @example
                $('#form-div').on('save'), function(e, params){
                    if(params.newValue === 'username') {...}
                });
                **/
                this.$div.triggerHandler('save', {newValue: newValue, submitValue: submitValue, response: response});
            }, this))
            .fail($.proxy(function(xhr) {
                this.isSaving = false;

                var msg;
                if(typeof this.options.error === 'function') {
                    msg = this.options.error.call(this.options.scope, xhr, newValue);
                } else {
                    msg = typeof xhr === 'string' ? xhr : xhr.responseText || xhr.statusText || 'Unknown error!';
                }

                this.error(msg);
                this.showForm();
            }, this));
        },

        save: function(submitValue) {
            //try parse composite pk defined as json string in data-pk
            this.options.pk = $.fn.editableutils.tryParseJson(this.options.pk, true);

            var pk = (typeof this.options.pk === 'function') ? this.options.pk.call(this.options.scope) : this.options.pk,
            /*
              send on server in following cases:
              1. url is function
              2. url is string AND (pk defined OR send option = always)
            */
            send = !!(typeof this.options.url === 'function' || (this.options.url && ((this.options.send === 'always') || (this.options.send === 'auto' && pk !== null && pk !== undefined)))),
            params;

            if (send) { //send to server
                this.showLoading();

                //standard params
                params = {
                    name: this.options.name || '',
                    value: submitValue,
                    pk: pk
                };

                //additional params
                if(typeof this.options.params === 'function') {
                    params = this.options.params.call(this.options.scope, params);
                } else {
                    //try parse json in single quotes (from data-params attribute)
                    this.options.params = $.fn.editableutils.tryParseJson(this.options.params, true);
                    $.extend(params, this.options.params);
                }

                if(typeof this.options.url === 'function') { //user's function
                    return this.options.url.call(this.options.scope, params);
                } else {
                    //send ajax to server and return deferred object
                    return $.ajax($.extend({
                        url     : this.options.url,
                        data    : params,
                        type    : 'POST'
                    }, this.options.ajaxOptions));
                }
            }
        },

        validate: function (value) {
            if (value === undefined) {
                value = this.value;
            }
            if (typeof this.options.validate === 'function') {
                return this.options.validate.call(this.options.scope, value);
            }
        },

        option: function(key, value) {
            if(key in this.options) {
                this.options[key] = value;
            }

            if(key === 'value') {
                this.setValue(value);
            }

            //do not pass option to input as it is passed in editable-element
        },

        setValue: function(value, convertStr) {
            if(convertStr) {
                this.value = this.input.str2value(value);
            } else {
                this.value = value;
            }

            //if form is visible, update input
            if(this.$form && this.$form.is(':visible')) {
                this.input.value2input(this.value);
            }
        }
    };

    /*
    Initialize editableform. Applied to jQuery object.
    @method $().editableform(options)
    @params {Object} options
    @example
    var $form = $('&lt;div&gt;').editableform({
        type: 'text',
        name: 'username',
        url: '/post',
        value: 'vitaliy'
    });
    //to display form you should call 'render' method
    $form.editableform('render');
    */
    $.fn.editableform = function (option) {
        var args = arguments;
        return this.each(function () {
            var $this = $(this),
            data = $this.data('editableform'),
            options = typeof option === 'object' && option;
            if (!data) {
                $this.data('editableform', (data = new EditableForm(this, options)));
            }

            if (typeof option === 'string') { //call method
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    };

    //keep link to constructor to allow inheritance
    $.fn.editableform.Constructor = EditableForm;

    //defaults
    $.fn.editableform.defaults = {
        /* see also defaults for input */

        /**
        Type of input. Can be <code>text|textarea|select|date|checklist</code>
        @property type
        @type string
        @default 'text'
        **/
        type: 'text',
        /**
        Url for submit, e.g. <code>'/post'</code>
        If function - it will be called instead of ajax. Function should return deferred object to run fail/done callbacks.
        @property url
        @type string|function
        @default null
        @example
        url: function(params) {
            var d = new $.Deferred;
            if(params.value === 'abc') {
                return d.reject('error message'); //returning error via deferred object
            } else {
                //async saving data in js model
                someModel.asyncSaveMethod({
                   ...,
                   success: function(){
                      d.resolve();
                   }
                });
                return d.promise();
            }
        }
        **/
        url:null,
        /**
        Additional params for submit. If defined as <code>object</code> - it is **appended** to original ajax data (pk, name and value).
        If defined as <code>function</code> - returned object **overwrites** original ajax data.
        @example
        params: function(params) {
            //originally params contain pk, name and value
            params.a = 1;
            return params;
        }
        @property params
        @type object|function
        @default null
        **/
        params:null,
        /**
        Name of field. Will be submitted on server. Can be taken from <code>id</code> attribute
        @property name
        @type string
        @default null
        **/
        name: null,
        /**
        Primary key of editable object (e.g. record id in database). For composite keys use object, e.g. <code>{id: 1, lang: 'en'}</code>.
        Can be calculated dynamically via function.
        @property pk
        @type string|object|function
        @default null
        **/
        pk: null,
        /**
        Initial value. If not defined - will be taken from element's content.
        For __select__ type should be defined (as it is ID of shown text).
        @property value
        @type string|object
        @default null
        **/
        value: null,
        /**
        Value that will be displayed in input if original field value is empty (`null|undefined|''`).
        @property defaultValue
        @type string|object
        @default null
        @since 1.4.6
        **/
        defaultValue: null,
        /**
        Strategy for sending data on server. Can be `auto|always|never`.
        When 'auto' data will be sent on server **only if pk and url defined**, otherwise new value will be stored locally.
        @property send
        @type string
        @default 'auto'
        **/
        send: 'auto',
        /**
        Function for client-side validation. If returns string - means validation not passed and string showed as error.
        Since 1.5.1 you can modify submitted value by returning object from `validate`:
        `{newValue: '...'}` or `{newValue: '...', msg: '...'}`
        @property validate
        @type function
        @default null
        @example
        validate: function(value) {
            if($.trim(value) == '') {
                return 'This field is required';
            }
        }
        **/
        validate: null,
        /**
        Success callback. Called when value successfully sent on server and **response status = 200**.
        Usefull to work with json response. For example, if your backend response can be <code>{success: true}</code>
        or <code>{success: false, msg: "server error"}</code> you can check it inside this callback.
        If it returns **string** - means error occured and string is shown as error message.
        If it returns **object like** <code>{newValue: &lt;something&gt;}</code> - it overwrites value, submitted by user.
        Otherwise newValue simply rendered into element.

        @property success
        @type function
        @default null
        @example
        success: function(response, newValue) {
            if(!response.success) return response.msg;
        }
        **/
        success: null,
        /**
        Error callback. Called when request failed (response status != 200).
        Usefull when you want to parse error response and display a custom message.
        Must return **string** - the message to be displayed in the error block.

        @property error
        @type function
        @default null
        @since 1.4.4
        @example
        error: function(response, newValue) {
            if(response.status === 500) {
                return 'Service unavailable. Please try later.';
            } else {
                return response.responseText;
            }
        }
        **/
        error: null,
        /**
        Additional options for submit ajax request.
        List of values: http://api.jquery.com/jQuery.ajax

        @property ajaxOptions
        @type object
        @default null
        @since 1.1.1
        @example
        ajaxOptions: {
            type: 'put',
            dataType: 'json'
        }
        **/
        ajaxOptions: null,
        /**
        Where to show buttons: left(true)|bottom|false
        Form without buttons is auto-submitted.
        @property showbuttons
        @type boolean|string
        @default true
        @since 1.1.1
        **/
        showbuttons: true,
        /**
        Scope for callback methods (success, validate).
        If <code>null</code> means editableform instance itself.
        @property scope
        @type DOMElement|object
        @default null
        @since 1.2.0
        @private
        **/
        scope: null,
        /**
        Whether to save or cancel value when it was not changed but form was submitted
        @property savenochange
        @type boolean
        @default false
        @since 1.2.0
        **/
        savenochange: false
    };

    /*
    Note: following params could redefined in engine: bootstrap or jqueryui:
    Classes 'control-group' and 'editable-error-block' must always present!
    */
    $.fn.editableform.template = '<form class="form-inline editableform">'+
    '<div class="control-group">' +
    '<div><div class="editable-input"></div><div class="editable-buttons"></div></div>'+
    '<div class="editable-error-block"></div>' +
    '</div>' +
    '</form>';

    //loading div
    $.fn.editableform.loading = '<div class="editableform-loading"></div>';

    //buttons
    $.fn.editableform.buttons = '<button type="submit" class="editable-submit">ok</button>'+
    '<button type="button" class="editable-cancel">cancel</button>';

    //error class attached to control-group
    $.fn.editableform.errorGroupClass = null;

    //error class attached to editable-error-block
    $.fn.editableform.errorBlockClass = 'editable-error';

    //engine
    $.fn.editableform.engine = 'jquery';
}(window.jQuery));



/**
 * EditableForm utilites
 */ (function($) {
    "use strict";

    //utils
    $.fn.editableutils = {
        /**
         * classic JS inheritance function
         */
        inherit: function(Child, Parent) {
            var F = function() {};
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            Child.superclass = Parent.prototype;
        },

        /**
         * set caret position in input
         * see http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
         */
        setCursorPosition: function(elem, pos) {
            if (elem.setSelectionRange) {
                elem.setSelectionRange(pos, pos);
            } else if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },

        /**
         * function to parse JSON in *single* quotes. (jquery automatically parse only double quotes)
         * That allows such code as: <a data-source="{'a': 'b', 'c': 'd'}">
         * safe = true --> means no exception will be thrown
         * for details see http://stackoverflow.com/questions/7410348/how-to-set-json-format-to-html5-data-attributes-in-the-jquery
         */
        tryParseJson: function(s, safe) {
            if (typeof s === 'string' && s.length && s.match(/^[\{\[].*[\}\]]$/)) {
                if (safe) {
                    try {
                        /*jslint evil: true*/
                        s = (new Function('return ' + s))();
                        /*jslint evil: false*/
                    } catch (e) {} finally {
                        return s;
                    }
                } else {
                    /*jslint evil: true*/
                    s = (new Function('return ' + s))();
                    /*jslint evil: false*/
                }
            }
            return s;
        },

        /**
         * slice object by specified keys
         */
        sliceObj: function(obj, keys, caseSensitive /* default: false */ ) {
            var key, keyLower, newObj = {};

            if (!$.isArray(keys) || !keys.length) {
                return newObj;
            }

            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                if (obj.hasOwnProperty(key)) {
                    newObj[key] = obj[key];
                }

                if (caseSensitive === true) {
                    continue;
                }

                //when getting data-* attributes via $.data() it's converted to lowercase.
                //details: http://stackoverflow.com/questions/7602565/using-data-attributes-with-jquery
                //workaround is code below.
                keyLower = key.toLowerCase();
                if (obj.hasOwnProperty(keyLower)) {
                    newObj[key] = obj[keyLower];
                }
            }

            return newObj;
        },

        /*
        exclude complex objects from $.data() before pass to config
        */
        getConfigData: function($element) {
            var data = {};
            $.each($element.data(), function(k, v) {
                if (typeof v !== 'object' || (v && typeof v === 'object' && (v.constructor === Object || v.constructor === Array))) {
                    data[k] = v;
                }
            });
            return data;
        },

        /*
         returns keys of object
        */
        objectKeys: function(o) {
            if (Object.keys) {
                return Object.keys(o);
            } else {
                if (o !== Object(o)) {
                    throw new TypeError('Object.keys called on a non-object');
                }
                var k = [],
                    p;
                for (p in o) {
                    if (Object.prototype.hasOwnProperty.call(o, p)) {
                        k.push(p);
                    }
                }
                return k;
            }

        },

        /**
        method to escape html.
       **/
        escape: function(str) {
            return $('<div>').text(str).html();
        },

        /*
        returns array items from sourceData having value property equal or inArray of 'value'
       */
        itemsByValue: function(value, sourceData, valueProp) {
            if (!sourceData || value === null) {
                return [];
            }

            if (typeof(valueProp) !== "function") {
                var idKey = valueProp || 'value';
                valueProp = function(e) {
                    return e[idKey];
                };
            }

            var isValArray = $.isArray(value),
                result = [],
                that = this;

            $.each(sourceData, function(i, o) {
                if (o.children) {
                    result = result.concat(that.itemsByValue(value, o.children, valueProp));
                } else {
                    /*jslint eqeq: true*/
                    if (isValArray) {
                        if ($.grep(value, function(v) {
                            return v == (o && typeof o === 'object' ? valueProp(o) : o);
                        }).length) {
                            result.push(o);
                        }
                    } else {
                        var itemValue = (o && (typeof o === 'object')) ? valueProp(o) : o;
                        if (value == itemValue) {
                            result.push(o);
                        }
                    }
                    /*jslint eqeq: false*/
                }
            });

            return result;
        },

        /*
       Returns input by options: type, mode.
       */
        createInput: function(options) {
            var TypeConstructor, typeOptions, input,
            type = options.type;

            //`date` is some kind of virtual type that is transformed to one of exact types
            //depending on mode and core lib
            if (type === 'date') {
                //inline
                if (options.mode === 'inline') {
                    if ($.fn.editabletypes.datefield) {
                        type = 'datefield';
                    } else if ($.fn.editabletypes.dateuifield) {
                        type = 'dateuifield';
                    }
                    //popup
                } else {
                    if ($.fn.editabletypes.date) {
                        type = 'date';
                    } else if ($.fn.editabletypes.dateui) {
                        type = 'dateui';
                    }
                }

                //if type still `date` and not exist in types, replace with `combodate` that is base input
                if (type === 'date' && !$.fn.editabletypes.date) {
                    type = 'combodate';
                }
            }

            //`datetime` should be datetimefield in 'inline' mode
            if (type === 'datetime' && options.mode === 'inline') {
                type = 'datetimefield';
            }

            //change wysihtml5 to textarea for jquery UI and plain versions
            if (type === 'wysihtml5' && !$.fn.editabletypes[type]) {
                type = 'textarea';
            }

            //create input of specified type. Input will be used for converting value, not in form
            if (typeof $.fn.editabletypes[type] === 'function') {
                TypeConstructor = $.fn.editabletypes[type];
                typeOptions = this.sliceObj(options, this.objectKeys(TypeConstructor.defaults));
                input = new TypeConstructor(typeOptions);
                return input;
            } else {
                $.error('Unknown type: ' + type);
                return false;
            }
        },

        //see http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
        supportsTransitions: function() {
            var b = document.body || document.documentElement,
                s = b.style,
                p = 'transition',
                v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];

            if (typeof s[p] === 'string') {
                return true;
            }

            // Tests for vendor specific prop
            p = p.charAt(0).toUpperCase() + p.substr(1);
            for (var i = 0; i < v.length; i++) {
                if (typeof s[v[i] + p] === 'string') {
                    return true;
                }
            }
            return false;
        }

    };
}(window.jQuery));


/**
Attaches stand-alone container with editable-form to HTML element. Element is used only for positioning, value is not stored anywhere.<br>
This method applied internally in <code>$().editable()</code>. You should subscribe on it's events (save / cancel) to get profit of it.<br>
Final realization can be different: bootstrap-popover, jqueryui-tooltip, poshytip, inline-div. It depends on which js file you include.<br>
Applied as jQuery method.

@class editableContainer
@uses editableform
**/
(function($) {
    "use strict";

    var Popup = function(element, options) {
        this.init(element, options);
    };

    var Inline = function(element, options) {
        this.init(element, options);
    };

    //methods
    Popup.prototype = {
        containerName: null, //method to call container on element
        containerDataName: null, //object name in element's .data()
        innerCss: null, //tbd in child class
        containerClass: 'editable-container editable-popup', //css class applied to container element
        defaults: {}, //container itself defaults

        init: function(element, options) {
            this.$element = $(element);
            //since 1.4.1 container do not use data-* directly as they already merged into options.
            this.options = $.extend({}, $.fn.editableContainer.defaults, options);
            this.splitOptions();

            //set scope of form callbacks to element
            this.formOptions.scope = this.$element[0];

            this.initContainer();

            //flag to hide container, when saving value will finish
            this.delayedHide = false;

            //bind 'destroyed' listener to destroy container when element is removed from dom
            this.$element.on('destroyed', $.proxy(function() {
                this.destroy();
            }, this));

            //attach document handler to close containers on click / escape
            if (!$(document).data('editable-handlers-attached')) {
                //close all on escape
                $(document).on('keyup.editable', function(e) {
                    if (e.which === 27) {
                        $('.editable-open').editableContainer('hide');
                        //todo: return focus on element
                    }
                });

                //close containers when click outside
                //(mousedown could be better than click, it closes everything also on drag drop)
                $(document).on('click.editable', function(e) {
                    var $target = $(e.target),
                        i,
                        exclude_classes = ['.editable-container', '.ui-datepicker-header', '.datepicker', //in inline mode datepicker is rendered into body
                        '.modal-backdrop', '.bootstrap-wysihtml5-insert-image-modal', '.bootstrap-wysihtml5-insert-link-modal'];

                    //check if element is detached. It occurs when clicking in bootstrap datepicker
                    if (!$.contains(document.documentElement, e.target)) {
                        return;
                    }

                    //for some reason FF 20 generates extra event (click) in select2 widget with e.target = document
                    //we need to filter it via construction below. See https://github.com/vitalets/x-editable/issues/199
                    //Possibly related to http://stackoverflow.com/questions/10119793/why-does-firefox-react-differently-from-webkit-and-ie-to-click-event-on-selec
                    if ($target.is(document)) {
                        return;
                    }

                    //if click inside one of exclude classes --> no nothing
                    for (i = 0; i < exclude_classes.length; i++) {
                        if ($target.is(exclude_classes[i]) || $target.parents(exclude_classes[i]).length) {
                            return;
                        }
                    }

                    //close all open containers (except one - target)
                    Popup.prototype.closeOthers(e.target);
                });

                $(document).data('editable-handlers-attached', true);
            }
        },

        //split options on containerOptions and formOptions
        splitOptions: function() {
            this.containerOptions = {};
            this.formOptions = {};

            if (!$.fn[this.containerName]) {
                throw new Error(this.containerName + ' not found. Have you included corresponding js file?');
            }

            //keys defined in container defaults go to container, others go to form
            for (var k in this.options) {
                if (k in this.defaults) {
                    this.containerOptions[k] = this.options[k];
                } else {
                    this.formOptions[k] = this.options[k];
                }
            }
        },

        /*
        Returns jquery object of container
        @method tip()
        */
        tip: function() {
            return this.container() ? this.container().$tip : null;
        },

        /* returns container object */
        container: function() {
            var container;
            //first, try get it by `containerDataName`
            if (this.containerDataName) {
                if (container = this.$element.data(this.containerDataName)) {
                    return container;
                }
            }
            //second, try `containerName`
            container = this.$element.data(this.containerName);
            return container;
        },

        /* call native method of underlying container, e.g. this.$element.popover('method') */
        call: function() {
            this.$element[this.containerName].apply(this.$element, arguments);
        },

        initContainer: function() {
            this.call(this.containerOptions);
        },

        renderForm: function() {
            this.$form.editableform(this.formOptions)
                .on({
                save: $.proxy(this.save, this), //click on submit button (value changed)
                nochange: $.proxy(function() {
                    this.hide('nochange');
                }, this), //click on submit button (value NOT changed)
                cancel: $.proxy(function() {
                    this.hide('cancel');
                }, this), //click on calcel button
                show: $.proxy(function() {
                    if (this.delayedHide) {
                        this.hide(this.delayedHide.reason);
                        this.delayedHide = false;
                    } else {
                        this.setPosition();
                    }
                }, this), //re-position container every time form is shown (occurs each time after loading state)
                rendering: $.proxy(this.setPosition, this), //this allows to place container correctly when loading shown
                resize: $.proxy(this.setPosition, this), //this allows to re-position container when form size is changed
                rendered: $.proxy(function() {
                    /**
                    Fired when container is shown and form is rendered (for select will wait for loading dropdown options).
                    **Note:** Bootstrap popover has own `shown` event that now cannot be separated from x-editable's one.
                    The workaround is to check `arguments.length` that is always `2` for x-editable.

                    @event shown
                    @param {Object} event event object
                    @example
                    $('#username').on('shown', function(e, editable) {
                        editable.input.$input.val('overwriting value of input..');
                    });
                    **/
                    /*
                     TODO: added second param mainly to distinguish from bootstrap's shown event. It's a hotfix that will be solved in future versions via namespaced events.
                    */
                    this.$element.triggerHandler('shown', $(this.options.scope).data('editable'));
                }, this)
            })
                .editableform('render');
        },

        /**
        Shows container with form
        @method show()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/
        /* Note: poshytip owerwrites this method totally! */
        show: function(closeAll) {
            this.$element.addClass('editable-open');
            if (closeAll !== false) {
                //close all open containers (except this)
                this.closeOthers(this.$element[0]);
            }

            //show container itself
            this.innerShow();
            this.tip().addClass(this.containerClass);

            /*
            Currently, form is re-rendered on every show.
            The main reason is that we dont know, what will container do with content when closed:
            remove(), detach() or just hide() - it depends on container.

            Detaching form itself before hide and re-insert before show is good solution,
            but visually it looks ugly --> container changes size before hide.
            */

            //if form already exist - delete previous data
            if (this.$form) {
                //todo: destroy prev data!
                //this.$form.destroy();
            }

            this.$form = $('<div>');

            //insert form into container body
            if (this.tip().is(this.innerCss)) {
                //for inline container
                this.tip().append(this.$form);
            } else {
                this.tip().find(this.innerCss).append(this.$form);
            }

            //render form
            this.renderForm();
        },

        /**
        Hides container with form
        @method hide()
        @param {string} reason Reason caused hiding. Can be <code>save|cancel|onblur|nochange|undefined (=manual)</code>
        **/
        hide: function(reason) {
            if (!this.tip() || !this.tip().is(':visible') || !this.$element.hasClass('editable-open')) {
                return;
            }

            //if form is saving value, schedule hide
            if (this.$form.data('editableform').isSaving) {
                this.delayedHide = {
                    reason: reason
                };
                return;
            } else {
                this.delayedHide = false;
            }

            this.$element.removeClass('editable-open');
            this.innerHide();

            /**
            Fired when container was hidden. It occurs on both save or cancel.
            **Note:** Bootstrap popover has own `hidden` event that now cannot be separated from x-editable's one.
            The workaround is to check `arguments.length` that is always `2` for x-editable.

            @event hidden
            @param {object} event event object
            @param {string} reason Reason caused hiding. Can be <code>save|cancel|onblur|nochange|manual</code>
            @example
            $('#username').on('hidden', function(e, reason) {
                if(reason === 'save' || reason === 'cancel') {
                    //auto-open next editable
                    $(this).closest('tr').next().find('.editable').editable('show');
                }
            });
            **/
            this.$element.triggerHandler('hidden', reason || 'manual');
        },

        /* internal show method. To be overwritten in child classes */
        innerShow: function() {

        },

        /* internal hide method. To be overwritten in child classes */
        innerHide: function() {

        },

        /**
        Toggles container visibility (show / hide)
        @method toggle()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/
        toggle: function(closeAll) {
            if (this.container() && this.tip() && this.tip().is(':visible')) {
                this.hide();
            } else {
                this.show(closeAll);
            }
        },

        /*
        Updates the position of container when content changed.
        @method setPosition()
        */
        setPosition: function() {
            //tbd in child class
        },

        save: function(e, params) {
            /**
            Fired when new value was submitted. You can use <code>$(this).data('editableContainer')</code> inside handler to access to editableContainer instance

            @event save
            @param {Object} event event object
            @param {Object} params additional params
            @param {mixed} params.newValue submitted value
            @param {Object} params.response ajax response
            @example
            $('#username').on('save', function(e, params) {
                //assuming server response: '{success: true}'
                var pk = $(this).data('editableContainer').options.pk;
                if(params.response && params.response.success) {
                    alert('value: ' + params.newValue + ' with pk: ' + pk + ' saved!');
                } else {
                    alert('error!');
                }
            });
            **/
            this.$element.triggerHandler('save', params);

            //hide must be after trigger, as saving value may require methods of plugin, applied to input
            this.hide('save');
        },

        /**
        Sets new option

        @method option(key, value)
        @param {string} key
        @param {mixed} value
        **/
        option: function(key, value) {
            this.options[key] = value;
            if (key in this.containerOptions) {
                this.containerOptions[key] = value;
                this.setContainerOption(key, value);
            } else {
                this.formOptions[key] = value;
                if (this.$form) {
                    this.$form.editableform('option', key, value);
                }
            }
        },

        setContainerOption: function(key, value) {
            this.call('option', key, value);
        },

        /**
        Destroys the container instance
        @method destroy()
        **/
        destroy: function() {
            this.hide();
            this.innerDestroy();
            this.$element.off('destroyed');
            this.$element.removeData('editableContainer');
        },

        /* to be overwritten in child classes */
        innerDestroy: function() {

        },

        /*
        Closes other containers except one related to passed element.
        Other containers can be cancelled or submitted (depends on onblur option)
        */
        closeOthers: function(element) {
            $('.editable-open').each(function(i, el) {
                //do nothing with passed element and it's children
                if (el === element || $(el).find(element).length) {
                    return;
                }

                //otherwise cancel or submit all open containers
                var $el = $(el),
                    ec = $el.data('editableContainer');

                if (!ec) {
                    return;
                }

                if (ec.options.onblur === 'cancel') {
                    $el.data('editableContainer').hide('onblur');
                } else if (ec.options.onblur === 'submit') {
                    $el.data('editableContainer').tip().find('form').submit();
                }
            });

        },

        /**
        Activates input of visible container (e.g. set focus)
        @method activate()
        **/
        activate: function() {
            if (this.tip && this.tip().is(':visible') && this.$form) {
                this.$form.data('editableform').input.activate();
            }
        }

    };

    /**
    jQuery method to initialize editableContainer.

    @method $().editableContainer(options)
    @params {Object} options
    @example
    $('#edit').editableContainer({
        type: 'text',
        url: '/post',
        pk: 1,
        value: 'hello'
    });
    **/
    $.fn.editableContainer = function(option) {
        var args = arguments;
        return this.each(function() {
            var $this = $(this),
                dataKey = 'editableContainer',
                data = $this.data(dataKey),
                options = typeof option === 'object' && option,
                Constructor = (options.mode === 'inline') ? Inline : Popup;

            if (!data) {
                $this.data(dataKey, (data = new Constructor(this, options)));
            }

            if (typeof option === 'string') { //call method
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    };

    //store constructors
    $.fn.editableContainer.Popup = Popup;
    $.fn.editableContainer.Inline = Inline;

    //defaults
    $.fn.editableContainer.defaults = {
        /**
        Initial value of form input

        @property value
        @type mixed
        @default null
        @private
        **/
        value: null,
        /**
        Placement of container relative to element. Can be <code>top|right|bottom|left</code>. Not used for inline container.

        @property placement
        @type string
        @default 'top'
        **/
        placement: 'top',
        /**
        Whether to hide container on save/cancel.

        @property autohide
        @type boolean
        @default true
        @private
        **/
        autohide: true,
        /**
        Action when user clicks outside the container. Can be <code>cancel|submit|ignore</code>.
        Setting <code>ignore</code> allows to have several containers open.

        @property onblur
        @type string
        @default 'cancel'
        @since 1.1.1
        **/
        onblur: 'cancel',

        /**
        Animation speed (inline mode only)
        @property anim
        @type string
        @default false
        **/
        anim: false,

        /**
        Mode of editable, can be `popup` or `inline`

        @property mode
        @type string
        @default 'popup'
        @since 1.4.0
        **/
        mode: 'popup'
    };

    /*
     * workaround to have 'destroyed' event to destroy popover when element is destroyed
     * see http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom
     */
    jQuery.event.special.destroyed = {
        remove: function(o) {
            if (o.handler) {
                o.handler();
            }
        }
    };

}(window.jQuery));



/**
 * Editable Inline
 * ---------------------
 */ (function($) {
    "use strict";

    //copy prototype from EditableContainer
    //extend methods
    $.extend($.fn.editableContainer.Inline.prototype, $.fn.editableContainer.Popup.prototype, {
        containerName: 'editableform',
        innerCss: '.editable-inline',
        containerClass: 'editable-container editable-inline', //css class applied to container element

        initContainer: function() {
            //container is <span> element
            this.$tip = $('<span></span>');

            //convert anim to miliseconds (int)
            if (!this.options.anim) {
                this.options.anim = 0;
            }
        },

        splitOptions: function() {
            //all options are passed to form
            this.containerOptions = {};
            this.formOptions = this.options;
        },

        tip: function() {
            return this.$tip;
        },

        innerShow: function() {
            this.$element.hide();
            this.tip().insertAfter(this.$element).show();
        },

        innerHide: function() {
            this.$tip.hide(this.options.anim, $.proxy(function() {
                this.$element.show();
                this.innerDestroy();
            }, this));
        },

        innerDestroy: function() {
            if (this.tip()) {
                this.tip().empty().remove();
            }
        }
    });

}(window.jQuery));



/**
Makes editable any HTML element on the page. Applied as jQuery method.

@class editable
@uses editableContainer
**/
(function($) {
    "use strict";

    var Editable = function(element, options) {
        this.$element = $(element);
        //data-* has more priority over js options: because dynamically created elements may change data-*
        this.options = $.extend({}, $.fn.editable.defaults, options, $.fn.editableutils.getConfigData(this.$element));
        if (this.options.selector) {
            this.initLive();
        } else {
            this.init();
        }

        //check for transition support
        if (this.options.highlight && !$.fn.editableutils.supportsTransitions()) {
            this.options.highlight = false;
        }
    };

    Editable.prototype = {
        constructor: Editable,
        init: function() {
            var isValueByText = false,
                doAutotext, finalize;

            //name
            this.options.name = this.options.name || this.$element.attr('id');

            //create input of specified type. Input needed already here to convert value for initial display (e.g. show text by id for select)
            //also we set scope option to have access to element inside input specific callbacks (e. g. source as function)
            this.options.scope = this.$element[0];
            this.input = $.fn.editableutils.createInput(this.options);
            if (!this.input) {
                return;
            }

            //set value from settings or by element's text
            if (this.options.value === undefined || this.options.value === null) {
                this.value = this.input.html2value($.trim(this.$element.html()));
                isValueByText = true;
            } else {
                /*
                  value can be string when received from 'data-value' attribute
                  for complext objects value can be set as json string in data-value attribute,
                  e.g. data-value="{city: 'Moscow', street: 'Lenina'}"
                */
                this.options.value = $.fn.editableutils.tryParseJson(this.options.value, true);
                if (typeof this.options.value === 'string') {
                    this.value = this.input.str2value(this.options.value);
                } else {
                    this.value = this.options.value;
                }
            }

            //add 'editable' class to every editable element
            this.$element.addClass('editable');

            //specifically for "textarea" add class .editable-pre-wrapped to keep linebreaks
            if (this.input.type === 'textarea') {
                this.$element.addClass('editable-pre-wrapped');
            }

            //attach handler activating editable. In disabled mode it just prevent default action (useful for links)
            if (this.options.toggle !== 'manual') {
                this.$element.addClass('editable-click');
                this.$element.on(this.options.toggle + '.editable', $.proxy(function(e) {
                    //prevent following link if editable enabled
                    if (!this.options.disabled) {
                        e.preventDefault();
                    }

                    //stop propagation not required because in document click handler it checks event target
                    //e.stopPropagation();

                    if (this.options.toggle === 'mouseenter') {
                        //for hover only show container
                        this.show();
                    } else {
                        //when toggle='click' we should not close all other containers as they will be closed automatically in document click listener
                        var closeAll = (this.options.toggle !== 'click');
                        this.toggle(closeAll);
                    }
                }, this));
            } else {
                this.$element.attr('tabindex', - 1); //do not stop focus on element when toggled manually
            }

            //if display is function it's far more convinient to have autotext = always to render correctly on init
            //see https://github.com/vitalets/x-editable-yii/issues/34
            if (typeof this.options.display === 'function') {
                this.options.autotext = 'always';
            }

            //check conditions for autotext:
            switch (this.options.autotext) {
                case 'always':
                    doAutotext = true;
                    break;
                case 'auto':
                    //if element text is empty and value is defined and value not generated by text --> run autotext
                    doAutotext = !$.trim(this.$element.text()).length && this.value !== null && this.value !== undefined && !isValueByText;
                    break;
                default:
                    doAutotext = false;
            }

            //depending on autotext run render() or just finilize init
            $.when(doAutotext ? this.render() : true).then($.proxy(function() {
                if (this.options.disabled) {
                    this.disable();
                } else {
                    this.enable();
                }
                /**
               Fired when element was initialized by `$().editable()` method.
               Please note that you should setup `init` handler **before** applying `editable`.

               @event init
               @param {Object} event event object
               @param {Object} editable editable instance (as here it cannot accessed via data('editable'))
               @since 1.2.0
               @example
               $('#username').on('init', function(e, editable) {
                   alert('initialized ' + editable.options.name);
               });
               $('#username').editable();
               **/
                this.$element.triggerHandler('init', this);
            }, this));
        },

        /*
         Initializes parent element for live editables
        */
        initLive: function() {
            //store selector
            var selector = this.options.selector;
            //modify options for child elements
            this.options.selector = false;
            this.options.autotext = 'never';
            //listen toggle events
            this.$element.on(this.options.toggle + '.editable', selector, $.proxy(function(e) {
                var $target = $(e.target);
                if (!$target.data('editable')) {
                    //if delegated element initially empty, we need to clear it's text (that was manually set to `empty` by user)
                    //see https://github.com/vitalets/x-editable/issues/137
                    if ($target.hasClass(this.options.emptyclass)) {
                        $target.empty();
                    }
                    $target.editable(this.options).trigger(e);
                }
            }, this));
        },

        /*
        Renders value into element's text.
        Can call custom display method from options.
        Can return deferred object.
        @method render()
        @param {mixed} response server response (if exist) to pass into display function
        */
        render: function(response) {
            //do not display anything
            if (this.options.display === false) {
                return;
            }

            //if input has `value2htmlFinal` method, we pass callback in third param to be called when source is loaded
            if (this.input.value2htmlFinal) {
                return this.input.value2html(this.value, this.$element[0], this.options.display, response);
                //if display method defined --> use it
            } else if (typeof this.options.display === 'function') {
                return this.options.display.call(this.$element[0], this.value, response);
                //else use input's original value2html() method
            } else {
                return this.input.value2html(this.value, this.$element[0]);
            }
        },

        /**
        Enables editable
        @method enable()
        **/
        enable: function() {
            this.options.disabled = false;
            this.$element.removeClass('editable-disabled');
            this.handleEmpty(this.isEmpty);
            if (this.options.toggle !== 'manual') {
                if (this.$element.attr('tabindex') === '-1') {
                    this.$element.removeAttr('tabindex');
                }
            }
        },

        /**
        Disables editable
        @method disable()
        **/
        disable: function() {
            this.options.disabled = true;
            this.hide();
            this.$element.addClass('editable-disabled');
            this.handleEmpty(this.isEmpty);
            //do not stop focus on this element
            this.$element.attr('tabindex', - 1);
        },

        /**
        Toggles enabled / disabled state of editable element
        @method toggleDisabled()
        **/
        toggleDisabled: function() {
            if (this.options.disabled) {
                this.enable();
            } else {
                this.disable();
            }
        },

        /**
        Sets new option

        @method option(key, value)
        @param {string|object} key option name or object with several options
        @param {mixed} value option new value
        @example
        $('.editable').editable('option', 'pk', 2);
        **/
        option: function(key, value) {
            //set option(s) by object
            if (key && typeof key === 'object') {
                $.each(key, $.proxy(function(k, v) {
                    this.option($.trim(k), v);
                }, this));
                return;
            }

            //set option by string
            this.options[key] = value;

            //disabled
            if (key === 'disabled') {
                return value ? this.disable() : this.enable();
            }

            //value
            if (key === 'value') {
                this.setValue(value);
            }

            //transfer new option to container!
            if (this.container) {
                this.container.option(key, value);
            }

            //pass option to input directly (as it points to the same in form)
            if (this.input.option) {
                this.input.option(key, value);
            }

        },

        /*
         * set emptytext if element is empty
         */
        handleEmpty: function(isEmpty) {
            //do not handle empty if we do not display anything
            if (this.options.display === false) {
                return;
            }

            /*
            isEmpty may be set directly as param of method.
            It is required when we enable/disable field and can't rely on content
            as node content is text: "Empty" that is not empty %)
            */
            if (isEmpty !== undefined) {
                this.isEmpty = isEmpty;
            } else {
                //detect empty
                //for some inputs we need more smart check
                //e.g. wysihtml5 may have <br>, <p></p>, <img>
                if (typeof(this.input.isEmpty) === 'function') {
                    this.isEmpty = this.input.isEmpty(this.$element);
                } else {
                    this.isEmpty = $.trim(this.$element.html()) === '';
                }
            }

            //emptytext shown only for enabled
            if (!this.options.disabled) {
                if (this.isEmpty) {
                    this.$element.html(this.options.emptytext);
                    if (this.options.emptyclass) {
                        this.$element.addClass(this.options.emptyclass);
                    }
                } else if (this.options.emptyclass) {
                    this.$element.removeClass(this.options.emptyclass);
                }
            } else {
                //below required if element disable property was changed
                if (this.isEmpty) {
                    this.$element.empty();
                    if (this.options.emptyclass) {
                        this.$element.removeClass(this.options.emptyclass);
                    }
                }
            }
        },

        /**
        Shows container with form
        @method show()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/
        show: function(closeAll) {
            if (this.options.disabled) {
                return;
            }

            //init editableContainer: popover, tooltip, inline, etc..
            if (!this.container) {
                var containerOptions = $.extend({}, this.options, {
                    value: this.value,
                    input: this.input //pass input to form (as it is already created)
                });
                this.$element.editableContainer(containerOptions);
                //listen `save` event
                this.$element.on("save.internal", $.proxy(this.save, this));
                this.container = this.$element.data('editableContainer');
            } else if (this.container.tip().is(':visible')) {
                return;
            }

            //show container
            this.container.show(closeAll);
        },

        /**
        Hides container with form
        @method hide()
        **/
        hide: function() {
            if (this.container) {
                this.container.hide();
            }
        },

        /**
        Toggles container visibility (show / hide)
        @method toggle()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/
        toggle: function(closeAll) {
            if (this.container && this.container.tip().is(':visible')) {
                this.hide();
            } else {
                this.show(closeAll);
            }
        },

        /*
         * called when form was submitted
         */
        save: function(e, params) {
            //mark element with unsaved class if needed
            if (this.options.unsavedclass) {
                /*
                 Add unsaved css to element if:
                  - url is not user's function
                  - value was not sent to server
                  - params.response === undefined, that means data was not sent
                  - value changed
                */
                var sent = false;
                sent = sent || typeof this.options.url === 'function';
                sent = sent || this.options.display === false;
                sent = sent || params.response !== undefined;
                sent = sent || (this.options.savenochange && this.input.value2str(this.value) !== this.input.value2str(params.newValue));

                if (sent) {
                    this.$element.removeClass(this.options.unsavedclass);
                } else {
                    this.$element.addClass(this.options.unsavedclass);
                }
            }

            //highlight when saving
            if (this.options.highlight) {
                var $e = this.$element,
                    bgColor = $e.css('background-color');

                $e.css('background-color', this.options.highlight);
                setTimeout(function() {
                    if (bgColor === 'transparent') {
                        bgColor = '';
                    }
                    $e.css('background-color', bgColor);
                    $e.addClass('editable-bg-transition');
                    setTimeout(function() {
                        $e.removeClass('editable-bg-transition');
                    }, 1700);
                }, 10);
            }

            //set new value
            this.setValue(params.newValue, false, params.response);

            /**
            Fired when new value was submitted. You can use <code>$(this).data('editable')</code> to access to editable instance

            @event save
            @param {Object} event event object
            @param {Object} params additional params
            @param {mixed} params.newValue submitted value
            @param {Object} params.response ajax response
            @example
            $('#username').on('save', function(e, params) {
                alert('Saved value: ' + params.newValue);
            });
            **/
            //event itself is triggered by editableContainer. Description here is only for documentation
        },

        validate: function() {
            if (typeof this.options.validate === 'function') {
                return this.options.validate.call(this, this.value);
            }
        },

        /**
        Sets new value of editable
        @method setValue(value, convertStr)
        @param {mixed} value new value
        @param {boolean} convertStr whether to convert value from string to internal format
        **/
        setValue: function(value, convertStr, response) {
            if (convertStr) {
                this.value = this.input.str2value(value);
            } else {
                this.value = value;
            }
            if (this.container) {
                this.container.option('value', this.value);
            }
            $.when(this.render(response))
                .then($.proxy(function() {
                this.handleEmpty();
            }, this));
        },

        /**
        Activates input of visible container (e.g. set focus)
        @method activate()
        **/
        activate: function() {
            if (this.container) {
                this.container.activate();
            }
        },

        /**
        Removes editable feature from element
        @method destroy()
        **/
        destroy: function() {
            this.disable();

            if (this.container) {
                this.container.destroy();
            }

            this.input.destroy();

            if (this.options.toggle !== 'manual') {
                this.$element.removeClass('editable-click');
                this.$element.off(this.options.toggle + '.editable');
            }

            this.$element.off("save.internal");

            this.$element.removeClass('editable editable-open editable-disabled');
            this.$element.removeData('editable');
        }
    };

    /* EDITABLE PLUGIN DEFINITION
     * ======================= */

    /**
    jQuery method to initialize editable element.

    @method $().editable(options)
    @params {Object} options
    @example
    $('#username').editable({
        type: 'text',
        url: '/post',
        pk: 1
    });
    **/
    $.fn.editable = function(option) {
        //special API methods returning non-jquery object
        var result = {}, args = arguments,
            datakey = 'editable';
        switch (option) {
            /**
            Runs client-side validation for all matched editables

            @method validate()
            @returns {Object} validation errors map
            @example
            $('#username, #fullname').editable('validate');
            // possible result:
            {
              username: "username is required",
              fullname: "fullname should be minimum 3 letters length"
            }
            **/
            case 'validate':
                this.each(function() {
                    var $this = $(this),
                        data = $this.data(datakey),
                        error;
                    if (data && (error = data.validate())) {
                        result[data.options.name] = error;
                    }
                });
                return result;

                /**
            Returns current values of editable elements.
            Note that it returns an **object** with name-value pairs, not a value itself. It allows to get data from several elements.
            If value of some editable is `null` or `undefined` it is excluded from result object.
            When param `isSingle` is set to **true** - it is supposed you have single element and will return value of editable instead of object.

            @method getValue()
            @param {bool} isSingle whether to return just value of single element
            @returns {Object} object of element names and values
            @example
            $('#username, #fullname').editable('getValue');
            //result:
            {
            username: "superuser",
            fullname: "John"
            }
            //isSingle = true
            $('#username').editable('getValue', true);
            //result "superuser"
            **/
            case 'getValue':
                if (arguments.length === 2 && arguments[1] === true) { //isSingle = true
                    result = this.eq(0).data(datakey).value;
                } else {
                    this.each(function() {
                        var $this = $(this),
                            data = $this.data(datakey);
                        if (data && data.value !== undefined && data.value !== null) {
                            result[data.options.name] = data.input.value2submit(data.value);
                        }
                    });
                }
                return result;

                /**
            This method collects values from several editable elements and submit them all to server.
            Internally it runs client-side validation for all fields and submits only in case of success.
            See <a href="#newrecord">creating new records</a> for details.
            Since 1.5.1 `submit` can be applied to single element to send data programmatically. In that case
            `url`, `success` and `error` is taken from initial options and you can just call `$('#username').editable('submit')`.

            @method submit(options)
            @param {object} options
            @param {object} options.url url to submit data
            @param {object} options.data additional data to submit
            @param {object} options.ajaxOptions additional ajax options
            @param {function} options.error(obj) error handler
            @param {function} options.success(obj,config) success handler
            @returns {Object} jQuery object
            **/
            case 'submit':
                //collects value, validate and submit to server for creating new record
                var config = arguments[1] || {},
                $elems = this,
                    errors = this.editable('validate');

                // validation ok
                if ($.isEmptyObject(errors)) {
                    var ajaxOptions = {};

                    // for single element use url, success etc from options
                    if ($elems.length === 1) {
                        var editable = $elems.data('editable');
                        //standard params
                        var params = {
                            name: editable.options.name || '',
                            value: editable.input.value2submit(editable.value),
                            pk: (typeof editable.options.pk === 'function') ? editable.options.pk.call(editable.options.scope) : editable.options.pk
                        };

                        //additional params
                        if (typeof editable.options.params === 'function') {
                            params = editable.options.params.call(editable.options.scope, params);
                        } else {
                            //try parse json in single quotes (from data-params attribute)
                            editable.options.params = $.fn.editableutils.tryParseJson(editable.options.params, true);
                            $.extend(params, editable.options.params);
                        }

                        ajaxOptions = {
                            url: editable.options.url,
                            data: params,
                            type: 'POST'
                        };

                        // use success / error from options
                        config.success = config.success || editable.options.success;
                        config.error = config.error || editable.options.error;

                        // multiple elements
                    } else {
                        var values = this.editable('getValue');

                        ajaxOptions = {
                            url: config.url,
                            data: values,
                            type: 'POST'
                        };
                    }

                    // ajax success callabck (response 200 OK)
                    ajaxOptions.success = typeof config.success === 'function' ? function(response) {
                        config.success.call($elems, response, config);
                    } : $.noop;

                    // ajax error callabck
                    ajaxOptions.error = typeof config.error === 'function' ? function() {
                        config.error.apply($elems, arguments);
                    } : $.noop;

                    // extend ajaxOptions
                    if (config.ajaxOptions) {
                        $.extend(ajaxOptions, config.ajaxOptions);
                    }

                    // extra data
                    if (config.data) {
                        $.extend(ajaxOptions.data, config.data);
                    }

                    // perform ajax request
                    $.ajax(ajaxOptions);
                } else { //client-side validation error
                    if (typeof config.error === 'function') {
                        config.error.call($elems, errors);
                    }
                }
                return this;
        }

        //return jquery object
        return this.each(function() {
            var $this = $(this),
                data = $this.data(datakey),
                options = typeof option === 'object' && option;

            //for delegated targets do not store `editable` object for element
            //it's allows several different selectors.
            //see: https://github.com/vitalets/x-editable/issues/312
            if (options && options.selector) {
                data = new Editable(this, options);
                return;
            }

            if (!data) {
                $this.data(datakey, (data = new Editable(this, options)));
            }

            if (typeof option === 'string') { //call method
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    };


    $.fn.editable.defaults = {
        /**
        Type of input. Can be <code>text|textarea|select|date|checklist</code> and more

        @property type
        @type string
        @default 'text'
        **/
        type: 'text',
        /**
        Sets disabled state of editable

        @property disabled
        @type boolean
        @default false
        **/
        disabled: false,
        /**
        How to toggle editable. Can be <code>click|dblclick|mouseenter|manual</code>.
        When set to <code>manual</code> you should manually call <code>show/hide</code> methods of editable.
        **Note**: if you call <code>show</code> or <code>toggle</code> inside **click** handler of some DOM element,
        you need to apply <code>e.stopPropagation()</code> because containers are being closed on any click on document.

        @example
        $('#edit-button').click(function(e) {
            e.stopPropagation();
            $('#username').editable('toggle');
        });

        @property toggle
        @type string
        @default 'click'
        **/
        toggle: 'click',
        /**
        Text shown when element is empty.

        @property emptytext
        @type string
        @default 'Empty'
        **/
        emptytext: 'Empty',
        /**
        Allows to automatically set element's text based on it's value. Can be <code>auto|always|never</code>. Useful for select and date.
        For example, if dropdown list is <code>{1: 'a', 2: 'b'}</code> and element's value set to <code>1</code>, it's html will be automatically set to <code>'a'</code>.
        <code>auto</code> - text will be automatically set only if element is empty.
        <code>always|never</code> - always(never) try to set element's text.

        @property autotext
        @type string
        @default 'auto'
        **/
        autotext: 'auto',
        /**
        Initial value of input. If not set, taken from element's text.
        Note, that if element's text is empty - text is automatically generated from value and can be customized (see `autotext` option).
        For example, to display currency sign:
        @example
        <a id="price" data-type="text" data-value="100"></a>
        <script>
        $('#price').editable({
            ...
            display: function(value) {
              $(this).text(value + '$');
            }
        })
        </script>

        @property value
        @type mixed
        @default element's text
        **/
        value: null,
        /**
        Callback to perform custom displaying of value in element's text.
        If `null`, default input's display used.
        If `false`, no displaying methods will be called, element's text will never change.
        Runs under element's scope.
        _**Parameters:**_

        * `value` current value to be displayed
        * `response` server response (if display called after ajax submit), since 1.4.0

        For _inputs with source_ (select, checklist) parameters are different:

        * `value` current value to be displayed
        * `sourceData` array of items for current input (e.g. dropdown items)
        * `response` server response (if display called after ajax submit), since 1.4.0

        To get currently selected items use `$.fn.editableutils.itemsByValue(value, sourceData)`.

        @property display
        @type function|boolean
        @default null
        @since 1.2.0
        @example
        display: function(value, sourceData) {
           //display checklist as comma-separated values
           var html = [],
               checked = $.fn.editableutils.itemsByValue(value, sourceData);

           if(checked.length) {
               $.each(checked, function(i, v) { html.push($.fn.editableutils.escape(v.text)); });
               $(this).html(html.join(', '));
           } else {
               $(this).empty();
           }
        }
        **/
        display: null,
        /**
        Css class applied when editable text is empty.

        @property emptyclass
        @type string
        @since 1.4.1
        @default editable-empty
        **/
        emptyclass: 'editable-empty',
        /**
        Css class applied when value was stored but not sent to server (`pk` is empty or `send = 'never'`).
        You may set it to `null` if you work with editables locally and submit them together.

        @property unsavedclass
        @type string
        @since 1.4.1
        @default editable-unsaved
        **/
        unsavedclass: 'editable-unsaved',
        /**
        If selector is provided, editable will be delegated to the specified targets.
        Usefull for dynamically generated DOM elements.
        **Please note**, that delegated targets can't be initialized with `emptytext` and `autotext` options,
        as they actually become editable only after first click.
        You should manually set class `editable-click` to these elements.
        Also, if element originally empty you should add class `editable-empty`, set `data-value=""` and write emptytext into element:

        @property selector
        @type string
        @since 1.4.1
        @default null
        @example
        <div id="user">
          <!-- empty -->
          <a href="#" data-name="username" data-type="text" class="editable-click editable-empty" data-value="" title="Username">Empty</a>
          <!-- non-empty -->
          <a href="#" data-name="group" data-type="select" data-source="/groups" data-value="1" class="editable-click" title="Group">Operator</a>
        </div>

        <script>
        $('#user').editable({
            selector: 'a',
            url: '/post',
            pk: 1
        });
        </script>
        **/
        selector: null,
        /**
        Color used to highlight element after update. Implemented via CSS3 transition, works in modern browsers.

        @property highlight
        @type string|boolean
        @since 1.4.5
        @default #FFFF80
        **/
        highlight: '#FFFF80'
    };

}(window.jQuery));


/**
AbstractInput - base class for all editable inputs.
It defines interface to be implemented by any input type.
To create your own input you can inherit from this class.

@class abstractinput
**/
(function($) {
    "use strict";

    //types
    $.fn.editabletypes = {};

    var AbstractInput = function() {};

    AbstractInput.prototype = {
        /**
        Initializes input

        @method init()
        **/
        init: function(type, options, defaults) {
            this.type = type;
            this.options = $.extend({}, defaults, options);
        },

        /*
       this method called before render to init $tpl that is inserted in DOM
       */
        prerender: function() {
            this.$tpl = $(this.options.tpl); //whole tpl as jquery object
            this.$input = this.$tpl; //control itself, can be changed in render method
            this.$clear = null; //clear button
            this.error = null; //error message, if input cannot be rendered
        },

        /**
        Renders input from tpl. Can return jQuery deferred object.
        Can be overwritten in child objects

        @method render()
       **/
        render: function() {

        },

        /**
        Sets element's html by value.

        @method value2html(value, element)
        @param {mixed} value
        @param {DOMElement} element
       **/
        value2html: function(value, element) {
            $(element)[this.options.escape ? 'text' : 'html']($.trim(value));
        },

        /**
        Converts element's html to value

        @method html2value(html)
        @param {string} html
        @returns {mixed}
       **/
        html2value: function(html) {
            return $('<div>').html(html).text();
        },

        /**
        Converts value to string (for internal compare). For submitting to server used value2submit().

        @method value2str(value)
        @param {mixed} value
        @returns {string}
       **/
        value2str: function(value) {
            return value;
        },

        /**
        Converts string received from server into value. Usually from `data-value` attribute.

        @method str2value(str)
        @param {string} str
        @returns {mixed}
       **/
        str2value: function(str) {
            return str;
        },

        /**
        Converts value for submitting to server. Result can be string or object.

        @method value2submit(value)
        @param {mixed} value
        @returns {mixed}
       **/
        value2submit: function(value) {
            return value;
        },

        /**
        Sets value of input.

        @method value2input(value)
        @param {mixed} value
       **/
        value2input: function(value) {
            this.$input.val(value);
        },

        /**
        Returns value of input. Value can be object (e.g. datepicker)

        @method input2value()
       **/
        input2value: function() {
            return this.$input.val();
        },

        /**
        Activates input. For text it sets focus.

        @method activate()
       **/
        activate: function() {
            if (this.$input.is(':visible')) {
                this.$input.focus();
            }
        },

        /**
        Creates input.

        @method clear()
       **/
        clear: function() {
            this.$input.val(null);
        },

        /**
        method to escape html.
       **/
        escape: function(str) {
            return $('<div>').text(str).html();
        },

        /**
        attach handler to automatically submit form when value changed (useful when buttons not shown)
       **/
        autosubmit: function() {

        },

        /**
       Additional actions when destroying element
       **/
        destroy: function() {},

        // -------- helper functions --------
        setClass: function() {
            if (this.options.inputclass) {
                this.$input.addClass(this.options.inputclass);
            }
        },

        setAttr: function(attr) {
            if (this.options[attr] !== undefined && this.options[attr] !== null) {
                this.$input.attr(attr, this.options[attr]);
            }
        },

        option: function(key, value) {
            this.options[key] = value;
        }

    };

    AbstractInput.defaults = {
        /**
        HTML template of input. Normally you should not change it.

        @property tpl
        @type string
        @default ''
        **/
        tpl: '',
        /**
        CSS class automatically applied to input

        @property inputclass
        @type string
        @default null
        **/
        inputclass: null,

        /**
        If `true` - html will be escaped in content of element via $.text() method.
        If `false` - html will not be escaped, $.html() used.
        When you use own `display` function, this option obviosly has no effect.

        @property escape
        @type boolean
        @since 1.5.0
        @default true
        **/
        escape: true,

        //scope for external methods (e.g. source defined as function)
        //for internal use only
        scope: null,

        //need to re-declare showbuttons here to get it's value from common config (passed only options existing in defaults)
        showbuttons: true
    };

    $.extend($.fn.editabletypes, {
        abstractinput: AbstractInput
    });

}(window.jQuery));




/**
List - abstract class for inputs that have source option loaded from js array or via ajax

@class list
@extends abstractinput
**/
(function($) {
    "use strict";

    var List = function(options) {

    };

    $.fn.editableutils.inherit(List, $.fn.editabletypes.abstractinput);

    $.extend(List.prototype, {
        render: function() {
            var deferred = $.Deferred();

            this.error = null;
            this.onSourceReady(function() {
                this.renderList();
                deferred.resolve();
            }, function() {
                this.error = this.options.sourceError;
                deferred.resolve();
            });

            return deferred.promise();
        },

        html2value: function(html) {
            return null; //can't set value by text
        },

        value2html: function(value, element, display, response) {
            var deferred = $.Deferred(),
                success = function() {
                    if (typeof display === 'function') {
                        //custom display method
                        display.call(element, value, this.sourceData, response);
                    } else {
                        this.value2htmlFinal(value, element);
                    }
                    deferred.resolve();
                };

            //for null value just call success without loading source
            if (value === null) {
                success.call(this);
            } else {
                this.onSourceReady(success, function() {
                    deferred.resolve();
                });
            }

            return deferred.promise();
        },

        // ------------- additional functions ------------

        onSourceReady: function(success, error) {
            //run source if it function
            var source;
            if ($.isFunction(this.options.source)) {
                source = this.options.source.call(this.options.scope);
                this.sourceData = null;
                //note: if function returns the same source as URL - sourceData will be taken from cahce and no extra request performed
            } else {
                source = this.options.source;
            }

            //if allready loaded just call success
            if (this.options.sourceCache && $.isArray(this.sourceData)) {
                success.call(this);
                return;
            }

            //try parse json in single quotes (for double quotes jquery does automatically)
            try {
                source = $.fn.editableutils.tryParseJson(source, false);
            } catch (e) {
                error.call(this);
                return;
            }

            //loading from url
            if (typeof source === 'string') {
                //try to get sourceData from cache
                if (this.options.sourceCache) {
                    var cacheID = source,
                        cache;

                    if (!$(document).data(cacheID)) {
                        $(document).data(cacheID, {});
                    }
                    cache = $(document).data(cacheID);

                    //check for cached data
                    if (cache.loading === false && cache.sourceData) { //take source from cache
                        this.sourceData = cache.sourceData;
                        this.doPrepend();
                        success.call(this);
                        return;
                    } else if (cache.loading === true) { //cache is loading, put callback in stack to be called later
                        cache.callbacks.push($.proxy(function() {
                            this.sourceData = cache.sourceData;
                            this.doPrepend();
                            success.call(this);
                        }, this));

                        //also collecting error callbacks
                        cache.err_callbacks.push($.proxy(error, this));
                        return;
                    } else { //no cache yet, activate it
                        cache.loading = true;
                        cache.callbacks = [];
                        cache.err_callbacks = [];
                    }
                }

                //ajaxOptions for source. Can be overwritten bt options.sourceOptions
                var ajaxOptions = $.extend({
                    url: source,
                    type: 'get',
                    cache: false,
                    dataType: 'json',
                    success: $.proxy(function(data) {
                        if (cache) {
                            cache.loading = false;
                        }
                        this.sourceData = this.makeArray(data);
                        if ($.isArray(this.sourceData)) {
                            if (cache) {
                                //store result in cache
                                cache.sourceData = this.sourceData;
                                //run success callbacks for other fields waiting for this source
                                $.each(cache.callbacks, function() {
                                    this.call();
                                });
                            }
                            this.doPrepend();
                            success.call(this);
                        } else {
                            error.call(this);
                            if (cache) {
                                //run error callbacks for other fields waiting for this source
                                $.each(cache.err_callbacks, function() {
                                    this.call();
                                });
                            }
                        }
                    }, this),
                    error: $.proxy(function() {
                        error.call(this);
                        if (cache) {
                            cache.loading = false;
                            //run error callbacks for other fields
                            $.each(cache.err_callbacks, function() {
                                this.call();
                            });
                        }
                    }, this)
                }, this.options.sourceOptions);

                //loading sourceData from server
                $.ajax(ajaxOptions);

            } else { //options as json/array
                this.sourceData = this.makeArray(source);

                if ($.isArray(this.sourceData)) {
                    this.doPrepend();
                    success.call(this);
                } else {
                    error.call(this);
                }
            }
        },

        doPrepend: function() {
            if (this.options.prepend === null || this.options.prepend === undefined) {
                return;
            }

            if (!$.isArray(this.prependData)) {
                //run prepend if it is function (once)
                if ($.isFunction(this.options.prepend)) {
                    this.options.prepend = this.options.prepend.call(this.options.scope);
                }

                //try parse json in single quotes
                this.options.prepend = $.fn.editableutils.tryParseJson(this.options.prepend, true);

                //convert prepend from string to object
                if (typeof this.options.prepend === 'string') {
                    this.options.prepend = {
                        '': this.options.prepend
                    };
                }

                this.prependData = this.makeArray(this.options.prepend);
            }

            if ($.isArray(this.prependData) && $.isArray(this.sourceData)) {
                this.sourceData = this.prependData.concat(this.sourceData);
            }
        },

        /*
         renders input list
        */
        renderList: function() {
            // this method should be overwritten in child class
        },

        /*
         set element's html by value
        */
        value2htmlFinal: function(value, element) {
            // this method should be overwritten in child class
        },

        /**
         * convert data to array suitable for sourceData, e.g. [{value: 1, text: 'abc'}, {...}]
         */
        makeArray: function(data) {
            var count, obj, result = [],
                item, iterateItem;
            if (!data || typeof data === 'string') {
                return null;
            }

            if ($.isArray(data)) { //array
                /*
                   function to iterate inside item of array if item is object.
                   Caclulates count of keys in item and store in obj.
                */
                iterateItem = function(k, v) {
                    obj = {
                        value: k,
                        text: v
                    };
                    if (count++ >= 2) {
                        return false; // exit from `each` if item has more than one key.
                    }
                };

                for (var i = 0; i < data.length; i++) {
                    item = data[i];
                    if (typeof item === 'object') {
                        count = 0; //count of keys inside item
                        $.each(item, iterateItem);
                        //case: [{val1: 'text1'}, {val2: 'text2} ...]
                        if (count === 1) {
                            result.push(obj);
                            //case: [{value: 1, text: 'text1'}, {value: 2, text: 'text2'}, ...]
                        } else if (count > 1) {
                            //removed check of existance: item.hasOwnProperty('value') && item.hasOwnProperty('text')
                            if (item.children) {
                                item.children = this.makeArray(item.children);
                            }
                            result.push(item);
                        }
                    } else {
                        //case: ['text1', 'text2' ...]
                        result.push({
                            value: item,
                            text: item
                        });
                    }
                }
            } else { //case: {val1: 'text1', val2: 'text2, ...}
                $.each(data, function(k, v) {
                    result.push({
                        value: k,
                        text: v
                    });
                });
            }
            return result;
        },

        option: function(key, value) {
            this.options[key] = value;
            if (key === 'source') {
                this.sourceData = null;
            }
            if (key === 'prepend') {
                this.prependData = null;
            }
        }

    });

    List.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        Source data for list.
        If **array** - it should be in format: `[{value: 1, text: "text1"}, {value: 2, text: "text2"}, ...]`
        For compability, object format is also supported: `{"1": "text1", "2": "text2" ...}` but it does not guarantee elements order.

        If **string** - considered ajax url to load items. In that case results will be cached for fields with the same source and name. See also `sourceCache` option.

        If **function**, it should return data in format above (since 1.4.0).

        Since 1.4.1 key `children` supported to render OPTGROUP (for **select** input only).
        `[{text: "group1", children: [{value: 1, text: "text1"}, {value: 2, text: "text2"}]}, ...]`


        @property source
        @type string | array | object | function
        @default null
        **/
        source: null,
        /**
        Data automatically prepended to the beginning of dropdown list.

        @property prepend
        @type string | array | object | function
        @default false
        **/
        prepend: false,
        /**
        Error message when list cannot be loaded (e.g. ajax error)

        @property sourceError
        @type string
        @default Error when loading list
        **/
        sourceError: 'Error when loading list',
        /**
        if <code>true</code> and source is **string url** - results will be cached for fields with the same source.
        Usefull for editable column in grid to prevent extra requests.

        @property sourceCache
        @type boolean
        @default true
        @since 1.2.0
        **/
        sourceCache: true,
        /**
        Additional ajax options to be used in $.ajax() when loading list from server.
        Useful to send extra parameters (`data` key) or change request method (`type` key).

        @property sourceOptions
        @type object|function
        @default null
        @since 1.5.0
        **/
        sourceOptions: null
    });

    $.fn.editabletypes.list = List;

}(window.jQuery));



/**
Text input

@class text
@extends abstractinput
@final
@example
<a href="#" id="username" data-type="text" data-pk="1">awesome</a>
<script>
$(function(){
    $('#username').editable({
        url: '/post',
        title: 'Enter username'
    });
});
</script>
**/
(function($) {
    "use strict";

    var Text = function(options) {
        this.init('text', options, Text.defaults);
    };

    $.fn.editableutils.inherit(Text, $.fn.editabletypes.abstractinput);

    $.extend(Text.prototype, {
        render: function() {
            this.renderClear();
            this.setClass();
            this.setAttr('placeholder');
        },

        activate: function() {
            if (this.$input.is(':visible')) {
                this.$input.focus();
                $.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                if (this.toggleClear) {
                    this.toggleClear();
                }
            }
        },

        //render clear button
        renderClear: function() {
            if (this.options.clear) {
                this.$clear = $('<span class="editable-clear-x"></span>');
                this.$input.after(this.$clear)
                    .css('padding-right', 24)
                    .keyup($.proxy(function(e) {
                    //arrows, enter, tab, etc
                    if (~$.inArray(e.keyCode, [40, 38, 9, 13, 27])) {
                        return;
                    }

                    clearTimeout(this.t);
                    var that = this;
                    this.t = setTimeout(function() {
                        that.toggleClear(e);
                    }, 100);

                }, this))
                    .parent().css('position', 'relative');

                this.$clear.click($.proxy(this.clear, this));
            }
        },

        postrender: function() {
            /*
            //now `clear` is positioned via css
            if(this.$clear) {
                //can position clear button only here, when form is shown and height can be calculated
//                var h = this.$input.outerHeight(true) || 20,
                var h = this.$clear.parent().height(),
                    delta = (h - this.$clear.height()) / 2;

                //this.$clear.css({bottom: delta, right: delta});
            }
            */
        },

        //show / hide clear button
        toggleClear: function(e) {
            if (!this.$clear) {
                return;
            }

            var len = this.$input.val().length,
                visible = this.$clear.is(':visible');

            if (len && !visible) {
                this.$clear.show();
            }

            if (!len && visible) {
                this.$clear.hide();
            }
        },

        clear: function() {
            this.$clear.hide();
            this.$input.val('').focus();
        }
    });

    Text.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl
        @default <input type="text">
        **/
        tpl: '<input type="text">',
        /**
        Placeholder attribute of input. Shown when input is empty.

        @property placeholder
        @type string
        @default null
        **/
        placeholder: null,

        /**
        Whether to show `clear` button

        @property clear
        @type boolean
        @default true
        **/
        clear: true
    });

    $.fn.editabletypes.text = Text;

}(window.jQuery));


/**
Textarea input

@class textarea
@extends abstractinput
@final
@example
<a href="#" id="comments" data-type="textarea" data-pk="1">awesome comment!</a>
<script>
$(function(){
    $('#comments').editable({
        url: '/post',
        title: 'Enter comments',
        rows: 10
    });
});
</script>
**/
(function($) {
    "use strict";

    var Textarea = function(options) {
        this.init('textarea', options, Textarea.defaults);
    };

    $.fn.editableutils.inherit(Textarea, $.fn.editabletypes.abstractinput);

    $.extend(Textarea.prototype, {
        render: function() {
            this.setClass();
            this.setAttr('placeholder');
            this.setAttr('rows');

            //ctrl + enter
            this.$input.keydown(function(e) {
                if (e.ctrlKey && e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        },

        //using `white-space: pre-wrap` solves \n  <--> BR conversion very elegant!
        /*
       value2html: function(value, element) {
            var html = '', lines;
            if(value) {
                lines = value.split("\n");
                for (var i = 0; i < lines.length; i++) {
                    lines[i] = $('<div>').text(lines[i]).html();
                }
                html = lines.join('<br>');
            }
            $(element).html(html);
        },

        html2value: function(html) {
            if(!html) {
                return '';
            }

            var regex = new RegExp(String.fromCharCode(10), 'g');
            var lines = html.split(/<br\s*\/?>/i);
            for (var i = 0; i < lines.length; i++) {
                var text = $('<div>').html(lines[i]).text();

                // Remove newline characters (\n) to avoid them being converted by value2html() method
                // thus adding extra <br> tags
                text = text.replace(regex, '');

                lines[i] = text;
            }
            return lines.join("\n");
        },
         */
        activate: function() {
            $.fn.editabletypes.text.prototype.activate.call(this);
        }
    });

    Textarea.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl
        @default <textarea></textarea>
        **/
        tpl: '<textarea></textarea>',
        /**
        @property inputclass
        @default input-large
        **/
        inputclass: 'input-large',
        /**
        Placeholder attribute of input. Shown when input is empty.

        @property placeholder
        @type string
        @default null
        **/
        placeholder: null,
        /**
        Number of rows in textarea

        @property rows
        @type integer
        @default 7
        **/
        rows: 7
    });

    $.fn.editabletypes.textarea = Textarea;

}(window.jQuery));



/**
Select (dropdown)

@class select
@extends list
@final
@example
<a href="#" id="status" data-type="select" data-pk="1" data-url="/post" data-title="Select status"></a>
<script>
$(function(){
    $('#status').editable({
        value: 2,
        source: [
              {value: 1, text: 'Active'},
              {value: 2, text: 'Blocked'},
              {value: 3, text: 'Deleted'}
           ]
    });
});
</script>
**/
(function($) {
    "use strict";

    var Select = function(options) {
        this.init('select', options, Select.defaults);
    };

    $.fn.editableutils.inherit(Select, $.fn.editabletypes.list);

    $.extend(Select.prototype, {
        renderList: function() {
            this.$input.empty();

            var fillItems = function($el, data) {
                var attr;
                if ($.isArray(data)) {
                    for (var i = 0; i < data.length; i++) {
                        attr = {};
                        if (data[i].children) {
                            attr.label = data[i].text;
                            $el.append(fillItems($('<optgroup>', attr), data[i].children));
                        } else {
                            attr.value = data[i].value;
                            if (data[i].disabled) {
                                attr.disabled = true;
                            }
                            $el.append($('<option>', attr).text(data[i].text));
                        }
                    }
                }
                return $el;
            };

            fillItems(this.$input, this.sourceData);

            this.setClass();

            //enter submit
            this.$input.on('keydown.editable', function(e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        },

        value2htmlFinal: function(value, element) {
            var text = '',
                items = $.fn.editableutils.itemsByValue(value, this.sourceData);

            if (items.length) {
                text = items[0].text;
            }

            //$(element).text(text);
            $.fn.editabletypes.abstractinput.prototype.value2html.call(this, text, element);
        },

        autosubmit: function() {
            this.$input.off('keydown.editable').on('change.editable', function() {
                $(this).closest('form').submit();
            });
        }
    });

    Select.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl
        @default <select></select>
        **/
        tpl: '<select></select>'
    });

    $.fn.editabletypes.select = Select;

}(window.jQuery));



/**
List of checkboxes.
Internally value stored as javascript array of values.

@class checklist
@extends list
@final
@example
<a href="#" id="options" data-type="checklist" data-pk="1" data-url="/post" data-title="Select options"></a>
<script>
$(function(){
    $('#options').editable({
        value: [2, 3],
        source: [
              {value: 1, text: 'option1'},
              {value: 2, text: 'option2'},
              {value: 3, text: 'option3'}
           ]
    });
});
</script>
**/
(function($) {
    "use strict";

    var Checklist = function(options) {
        this.init('checklist', options, Checklist.defaults);
    };

    $.fn.editableutils.inherit(Checklist, $.fn.editabletypes.list);

    $.extend(Checklist.prototype, {
        renderList: function() {
            var $label, $div;

            this.$tpl.empty();

            if (!$.isArray(this.sourceData)) {
                return;
            }

            for (var i = 0; i < this.sourceData.length; i++) {
                $label = $('<label>').append($('<input>', {
                    type: 'checkbox',
                    value: this.sourceData[i].value
                }))
                    .append($('<span>').text(' ' + this.sourceData[i].text));

                $('<div>').append($label).appendTo(this.$tpl);
            }

            this.$input = this.$tpl.find('input[type="checkbox"]');
            this.setClass();
        },

        value2str: function(value) {
            return $.isArray(value) ? value.sort().join($.trim(this.options.separator)) : '';
        },

        //parse separated string
        str2value: function(str) {
            var reg, value = null;
            if (typeof str === 'string' && str.length) {
                reg = new RegExp('\\s*' + $.trim(this.options.separator) + '\\s*');
                value = str.split(reg);
            } else if ($.isArray(str)) {
                value = str;
            } else {
                value = [str];
            }
            return value;
        },

        //set checked on required checkboxes
        value2input: function(value) {
            this.$input.prop('checked', false);
            if ($.isArray(value) && value.length) {
                this.$input.each(function(i, el) {
                    var $el = $(el);
                    // cannot use $.inArray as it performs strict comparison
                    $.each(value, function(j, val) {
                        /*jslint eqeq: true*/
                        if ($el.val() == val) {
                            /*jslint eqeq: false*/
                            $el.prop('checked', true);
                        }
                    });
                });
            }
        },

        input2value: function() {
            var checked = [];
            this.$input.filter(':checked').each(function(i, el) {
                checked.push($(el).val());
            });
            return checked;
        },

        //collect text of checked boxes
        value2htmlFinal: function(value, element) {
            var html = [],
                checked = $.fn.editableutils.itemsByValue(value, this.sourceData),
                escape = this.options.escape;

            if (checked.length) {
                $.each(checked, function(i, v) {
                    var text = escape ? $.fn.editableutils.escape(v.text) : v.text;
                    html.push(text);
                });
                $(element).html(html.join('<br>'));
            } else {
                $(element).empty();
            }
        },

        activate: function() {
            this.$input.first().focus();
        },

        autosubmit: function() {
            this.$input.on('keydown', function(e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        }
    });

    Checklist.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl
        @default <div></div>
        **/
        tpl: '<div class="editable-checklist"></div>',

        /**
        @property inputclass
        @type string
        @default null
        **/
        inputclass: null,

        /**
        Separator of values when reading from `data-value` attribute

        @property separator
        @type string
        @default ','
        **/
        separator: ','
    });

    $.fn.editabletypes.checklist = Checklist;

}(window.jQuery));



/**
HTML5 input types.
Following types are supported:

* password
* email
* url
* tel
* number
* range
* time

Learn more about html5 inputs:
http://www.w3.org/wiki/HTML5_form_additions
To check browser compatibility please see:
https://developer.mozilla.org/en-US/docs/HTML/Element/Input

@class html5types
@extends text
@final
@since 1.3.0
@example
<a href="#" id="email" data-type="email" data-pk="1">admin@example.com</a>
<script>
$(function(){
    $('#email').editable({
        url: '/post',
        title: 'Enter email'
    });
});
</script>
**/

/**
@property tpl
@default depends on type
**/

/*
Password
*/
(function($) {
    "use strict";

    var Password = function(options) {
        this.init('password', options, Password.defaults);
    };
    $.fn.editableutils.inherit(Password, $.fn.editabletypes.text);
    $.extend(Password.prototype, {
        //do not display password, show '[hidden]' instead
        value2html: function(value, element) {
            if (value) {
                $(element).text('[hidden]');
            } else {
                $(element).empty();
            }
        },
        //as password not displayed, should not set value by html
        html2value: function(html) {
            return null;
        }
    });
    Password.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="password">'
    });
    $.fn.editabletypes.password = Password;
}(window.jQuery));


/*
Email
*/
(function($) {
    "use strict";

    var Email = function(options) {
        this.init('email', options, Email.defaults);
    };
    $.fn.editableutils.inherit(Email, $.fn.editabletypes.text);
    Email.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="email">'
    });
    $.fn.editabletypes.email = Email;
}(window.jQuery));


/*
Url
*/
(function($) {
    "use strict";

    var Url = function(options) {
        this.init('url', options, Url.defaults);
    };
    $.fn.editableutils.inherit(Url, $.fn.editabletypes.text);
    Url.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="url">'
    });
    $.fn.editabletypes.url = Url;
}(window.jQuery));


/*
Tel
*/
(function($) {
    "use strict";

    var Tel = function(options) {
        this.init('tel', options, Tel.defaults);
    };
    $.fn.editableutils.inherit(Tel, $.fn.editabletypes.text);
    Tel.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="tel">'
    });
    $.fn.editabletypes.tel = Tel;
}(window.jQuery));


/*
Number
*/
(function($) {
    "use strict";

    var NumberInput = function(options) {
        this.init('number', options, NumberInput.defaults);
    };
    $.fn.editableutils.inherit(NumberInput, $.fn.editabletypes.text);
    $.extend(NumberInput.prototype, {
        render: function() {
            NumberInput.superclass.render.call(this);
            this.setAttr('min');
            this.setAttr('max');
            this.setAttr('step');
        },
        postrender: function() {
            if (this.$clear) {
                //increase right ffset  for up/down arrows
                this.$clear.css({
                    right: 24
                });
                /*
                //can position clear button only here, when form is shown and height can be calculated
                var h = this.$input.outerHeight(true) || 20,
                    delta = (h - this.$clear.height()) / 2;

                //add 12px to offset right for up/down arrows
                this.$clear.css({top: delta, right: delta + 16});
                */
            }
        }
    });
    NumberInput.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="number">',
        inputclass: 'input-mini',
        min: null,
        max: null,
        step: null
    });
    $.fn.editabletypes.number = NumberInput;
}(window.jQuery));


/*
Range (inherit from number)
*/
(function($) {
    "use strict";

    var Range = function(options) {
        this.init('range', options, Range.defaults);
    };
    $.fn.editableutils.inherit(Range, $.fn.editabletypes.number);
    $.extend(Range.prototype, {
        render: function() {
            this.$input = this.$tpl.filter('input');

            this.setClass();
            this.setAttr('min');
            this.setAttr('max');
            this.setAttr('step');

            this.$input.on('input', function() {
                $(this).siblings('output').text($(this).val());
            });
        },
        activate: function() {
            this.$input.focus();
        }
    });
    Range.defaults = $.extend({}, $.fn.editabletypes.number.defaults, {
        tpl: '<input type="range"><output style="width: 30px; display: inline-block"></output>',
        inputclass: 'input-medium'
    });
    $.fn.editabletypes.range = Range;
}(window.jQuery));

/*
Time
*/
(function($) {
    "use strict";

    var Time = function(options) {
        this.init('time', options, Time.defaults);
    };
    //inherit from abstract, as inheritance from text gives selection error.
    $.fn.editableutils.inherit(Time, $.fn.editabletypes.abstractinput);
    $.extend(Time.prototype, {
        render: function() {
            this.setClass();
        }
    });
    Time.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<input type="time">'
    });
    $.fn.editabletypes.time = Time;
}(window.jQuery));




/**
Select2 input. Based on amazing work of Igor Vaynberg https://github.com/ivaynberg/select2.
Please see [original select2 docs](http://ivaynberg.github.com/select2) for detailed description and options.

You should manually download and include select2 distributive:

    <link href="select2/select2.css" rel="stylesheet" type="text/css"></link>
    <script src="select2/select2.js"></script>

To make it **bootstrap-styled** you can use css from [here](https://github.com/fk/select2-bootstrap-theme):

    <link href="select2-bootstrap.css" rel="stylesheet" type="text/css"></link>

**Note:** currently `autotext` feature does not work for select2 with `ajax` remote source.
You need initially put both `data-value` and element's text youself:

    <a href="#" data-type="select2" data-value="1">Text1</a>


@class select2
@extends abstractinput
@since 1.4.1
@final
@example
<a href="#" id="country" data-type="select2" data-pk="1" data-value="ru" data-url="/post" data-title="Select country"></a>
<script>
$(function(){
    //local source
    $('#country').editable({
        source: [
              {id: 'gb', text: 'Great Britain'},
              {id: 'us', text: 'United States'},
              {id: 'ru', text: 'Russia'}
           ],
        select2: {
           multiple: true
        }
    });
    //remote source (simple)
    $('#country').editable({
        source: '/getCountries',
        select2: {
            placeholder: 'Select Country',
            minimumInputLength: 1
        }
    });
    //remote source (advanced)
    $('#country').editable({
        select2: {
            placeholder: 'Select Country',
            allowClear: true,
            minimumInputLength: 3,
            id: function (item) {
                return item.CountryId;
            },
            ajax: {
                url: '/getCountries',
                dataType: 'json',
                data: function (term, page) {
                    return { query: term };
                },
                results: function (data, page) {
                    return { results: data };
                }
            },
            formatResult: function (item) {
                return item.CountryName;
            },
            formatSelection: function (item) {
                return item.CountryName;
            },
            initSelection: function (element, callback) {
                return $.get('/getCountryById', { query: element.val() }, function (data) {
                    callback(data);
                });
            }
        }
    });
});
</script>
**/
(function($) {
    "use strict";

    var Constructor = function(options) {
        this.init('select2', options, Constructor.defaults);

        options.select2 = options.select2 || {};

        // placeholder
        if (options.placeholder) {
            options.select2.placeholder = options.placeholder;
        }

        // Automatically recognize the old `tags` behaviour and convert it into
        // `tags` + `data`, which is what Select2 4.0.0 expects.
        //
        // Also defaults to being a multiple selection, like older versions of
        // Select2.
        if ($.isArray(options.select2.tags)) {
            options.select2.data = options.select2.tags;
            options.select2.tags = true;
            options.select2.multiple = true;
        }

        if (options.select2.formatSelection) {
            options.select2.templateSelection = options.select2.formatSelection;
        }

        if (options.select2.formatResult) {
            options.select2.templateResult = options.select2.formatResult;
        }

        if (options.select2.ajax) {
            if (options.select2.ajax.results) {
                options.select2.ajax.processResults = options.select2.ajax.results;
            }

            if (options.select2.ajax.processResults) {
                var processResults = options.select2.ajax.processResults;

                options.select2.ajax.processResults = $.proxy(function(data) {
                    var results = processResults(data);

                    results.results = this.convertSource(results.results);

                    console.log('processResults', data, results)

                    return results;
                }, this);
            }
        }

        if (options.select2.initSelection) {
            this.options.initFunction = options.select2.initSelection;
            delete options.select2.initSelection;
        }

        //overriding objects in config (as by default jQuery extend() is not recursive)
        this.options.select2 = $.extend({}, Constructor.defaults.select2, options.select2);

        //detect whether it is multi-valued
        this.isMultiple = this.options.select2.multiple;
        this.isRemote = ('ajax' in this.options.select2);

        //store function returning ID of item
        //should be here as used inautotext for local source
        this.idFunc = this.options.select2.id;
        if (typeof(this.idFunc) !== "function") {
            var idKey = this.idFunc || 'id';
            this.idFunc = function(e) {
                return e[idKey];
            };
        }

        //store function that renders text in select2
        this.formatSelection = this.options.select2.formatSelection;
        if (typeof(this.formatSelection) !== "function") {
            this.formatSelection = function(e) {
                return e.text;
            };
        }
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.select);

    $.extend(Constructor.prototype, {
        render: function() {
            console.log('render');
            if (!this.$input.data('select2')) {
                this.$input.select2(this.options.select2);
            }
            console.log(this.$input.html())

            if (this.options.initFunction) {
                this.options.initFunction(this.$input, $.proxy(function(initial) {
                    console.log('initFunction', initial);
                    if ($.isArray(initial)) {

                    } else {
                        var id = this.idFunc(initial);
                        initial.id = id;
                        var option = new Option(initial.text, id);
                        option.selected = true;

                        $(option).data('data', initial);

                        this.$input.append(option);
                        this.$input.trigger('change');
                    }
                }, this));

                delete this.options.initFunction;
            }

            return Constructor.superclass.render.call(this);
        },

        renderList: function() {
            console.log('renderList', arguments)
            var $options = this.$input.children();
            Constructor.superclass.renderList.apply(this, arguments);
            this.$input.prepend($options);

            //can not apply select2 here as it calls initSelection
            //over input that does not have correct value yet.
            //apply select2 only in value2input
            //this.$input.select2(this.options.select2);

            //trigger resize of editableform to re-position container in multi-valued mode
            if (this.isMultiple) {
                this.$input.on('change', function() {
                    $(this).closest('form').parent().triggerHandler('resize');
                });
            }
        },

        /**
         * Used to convert a value (`data-value` or `options.value`) to the actual
         * selected value that can be processed by x-editable.
         *
         * This is needed because x-editable does not support multiple selections
         * by default.
         */
        str2value: function(str) {
            console.log('str2value', str);

            if ($.isArray(str)) {
                return str;
            }

            if (this.isMultiple) {
                return str.split(this.getSeparator());
            }

            return str;
        },

        /**
         * Called when no value is supplied, used to determine the value based on the text.
         */
        html2value: function(html) {
            console.log('html2value', html, this.isMultiple);
            if (!this.isMultiple) {
                return html;
            }

            return html.split(this.options.viewseparator);
        },

        /**
         * Used to update the text in the link based on the selected value
         */
        value2html: function(value, element) {
            console.log('value2html', arguments)
            Constructor.superclass.value2html.apply(this, arguments);
        },

        /**
         * Used to convert the value to the text representation of it.
         *
         * Superclass doesn't support multiple selects, so we need to override this.
         */
        value2htmlFinal: function(value, element) {
            // The select input type can handle single selects fine
            // We have to special case multiple selects, which aren't supported
            // by default.
            if (!$.isArray(value)) {
                console.log('value2htmlFinal', arguments, 'non-array');
                return Constructor.superclass.value2htmlFinal.call(this, value, element);
            }

            var results = [];

            // Convert all of the values into their text
            for (var v = 0; v < value.length; v++) {
                var val = value[v];

                var items = $.fn.editableutils.itemsByValue(val, this.sourceData);

                // There are no items in cases like tagging
                // So just assume that the tag value is also the text
                if (items.length === 0) {
                    results.push(value[v]);
                } else {
                    results.push(items[0].text);
                }
            }

            console.log('results', results);

            // The output is the text joined by the viewseparator (comma by default)
            results = results.join(this.options.viewseparator);

            console.log('value2htmlFinal', arguments, results);

            $(element)[this.options.escape ? 'text' : 'html']($.trim(results));
        },

        /**
         * Used to set the value of Select2 based on the current x-editable selections.
         */
        value2input: function(value) {
            console.log('value2input', value)

            // The value for a multiple select can be passed in as a single string
            // This will convert it from a string to an array of data values
            if (value && !$.isArray(value) && this.isMultiple) {
                value = this.str2value(value);

                console.log('value2input', value, 'fixed');
            }

            if (!value) {
                return;
            }

            // Branch off based on whether or not it's a multiple select
            // Either way, we are adding `<option>` tags for selected values that
            // don't already exist, so they can be selected correctly.
            if ($.isArray(value)) {
                var $options = this.$input.find('option');

                for (var v = 0; v < value.length; v++) {
                    var $filtered = $options.filter(function(i, elem) {
                        return elem.value == value[v].toString();
                    });

                    // Check if the option doesn't already exist
                    if ($filtered.length === 0) {
                        // Automatically create the option for the value
                        this.$input.append(new Option(value[v], value[v]));
                    }
                }
            } else {
                var $filtered = this.$input.find('option').filter(function(i, elem) {
                    return elem.value == value.toString()
                });

                if ($filtered.length === 0) {
                    var $el = $(this.options.scope);
                    var text;
                    if (!$el.data('editable').isEmpty) {
                        text = $el.text();
                    } else {
                        text = value;
                    }
                    this.$input.append(new Option(text, value));
                }
            }

            // After setting the value we must trigger the change event for Select2
            this.$input.val(value).trigger('change');
        },

        autosubmit: function() {
            this.$input.on('change', function(e, isInitial) {
                if (!isInitial) {
                    $(this).closest('form').submit();
                }
            });
        },

        getSeparator: function() {
            return this.options.select2.separator || this.options.separator;
        },

        /*
        Converts source from x-editable format: {value: 1, text: "1"} to
        select2 format: {id: 1, text: "1"}

        Also normalizes the id for the source values to always be a string.
        */
        convertSource: function(source) {
            if ($.isArray(source)) {
                for (var i = 0; i < source.length; i++) {
                    if (source[i].value !== undefined) {
                        source[i].id = source[i].value;
                    }

                    source[i].id = "" + this.idFunc(source[i]);
                }
            }

            return source;
        },

        /**
         * Convert the Select2 data array into a x-editable compatible list of
         * selections.
         *
         * This will also automatically pull selected data from Select2 if
         * nothing was passed in and Select2 was already initialized.
         */
        makeArray: function(data) {
            if (!data && this.$input && this.$input.data('select2')) {
                data = this.$input.select2('data');
            }

            console.log('makeArray', data);

            if ($.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id !== undefined) {
                        data[i].value = data[i].id;
                    }
                }
            }

            return Constructor.superclass.makeArray.call(this, data);
        },

        destroy: function() {
            if (this.$input.data('select2')) {
                this.$input.select2('destroy');
            }
        }

    });

    Constructor.defaults = $.extend({}, $.fn.editabletypes.select.defaults, {
        /**
        Configuration of select2. [Full list of options](http://ivaynberg.github.com/select2).

        @property select2
        @type object
        @default null
        **/
        select2: null,
        /**
        Placeholder attribute of select

        @property placeholder
        @type string
        @default null
        **/
        placeholder: null,
        /**
        Source data for select. It will be assigned to select2 `data` property and kept here just for convenience.
        Please note, that format is different from simple `select` input: use 'id' instead of 'value'.
        E.g. `[{id: 1, text: "text1"}, {id: 2, text: "text2"}, ...]`.

        @property source
        @type array|string|function
        @default null
        **/
        source: null,
        /**
        Separator used to display tags.

        @property viewseparator
        @type string
        @default ', '
        **/
        viewseparator: ', ',

        /**
        Separator of values when reading from `data-value` attribute

        @property separator
        @type string
        @default ','
        **/
        separator: ','
    });

    $.fn.editabletypes.select2 = Constructor;

}(window.jQuery));







/**
 * Combodate - 1.0.5
 * Dropdown date and time picker.
 * Converts text input into dropdowns to pick day, month, year, hour, minute and second.
 * Uses momentjs as datetime library http://momentjs.com.
 * For i18n include corresponding file from https://github.com/timrwood/moment/tree/master/lang
 *
 * Confusion at noon and midnight - see http://en.wikipedia.org/wiki/12-hour_clock#Confusion_at_noon_and_midnight
 * In combodate:
 * 12:00 pm --> 12:00 (24-h format, midday)
 * 12:00 am --> 00:00 (24-h format, midnight, start of day)
 *
 * Differs from momentjs parse rules:
 * 00:00 pm, 12:00 pm --> 12:00 (24-h format, day not change)
 * 00:00 am, 12:00 am --> 00:00 (24-h format, day not change)
 *
 *
 * Author: Vitaliy Potapov
 * Project page: http://github.com/vitalets/combodate
 * Copyright (c) 2012 Vitaliy Potapov. Released under MIT License.
 **/ (function($) {

    var Combodate = function(element, options) {
        this.$element = $(element);
        if (!this.$element.is('input')) {
            $.error('Combodate should be applied to INPUT element');
            return;
        }
        this.options = $.extend({}, $.fn.combodate.defaults, options, this.$element.data());
        this.init();
    };

    Combodate.prototype = {
        constructor: Combodate,
        init: function() {
            this.map = {
                //key   regexp    moment.method
                day: ['D', 'date'],
                month: ['M', 'month'],
                year: ['Y', 'year'],
                hour: ['[Hh]', 'hours'],
                minute: ['m', 'minutes'],
                second: ['s', 'seconds'],
                ampm: ['[Aa]', '']
            };

            this.$widget = $('<span class="combodate"></span>').html(this.getTemplate());

            this.initCombos();

            //update original input on change
            this.$widget.on('change', 'select', $.proxy(function(e) {
                this.$element.val(this.getValue()).change();
                // update days count if month or year changes
                if (this.options.smartDays) {
                    if ($(e.target).is('.month') || $(e.target).is('.year')) {
                        this.fillCombo('day');
                    }
                }
            }, this));

            this.$widget.find('select').css('width', 'auto');

            // hide original input and insert widget
            this.$element.hide().after(this.$widget);

            // set initial value
            this.setValue(this.$element.val() || this.options.value);
        },

        /*
         Replace tokens in template with <select> elements
        */
        getTemplate: function() {
            var tpl = this.options.template;

            //first pass
            $.each(this.map, function(k, v) {
                v = v[0];
                var r = new RegExp(v + '+'),
                    token = v.length > 1 ? v.substring(1, 2) : v;

                tpl = tpl.replace(r, '{' + token + '}');
            });

            //replace spaces with
            tpl = tpl.replace(/ /g, ' ');

            //second pass
            $.each(this.map, function(k, v) {
                v = v[0];
                var token = v.length > 1 ? v.substring(1, 2) : v;

                tpl = tpl.replace('{' + token + '}', '<select class="' + k + '"></select>');
            });

            return tpl;
        },

        /*
         Initialize combos that presents in template
        */
        initCombos: function() {
            for (var k in this.map) {
                var $c = this.$widget.find('.' + k);
                // set properties like this.$day, this.$month etc.
                this['$' + k] = $c.length ? $c : null;
                // fill with items
                this.fillCombo(k);
            }
        },

        /*
         Fill combo with items
        */
        fillCombo: function(k) {
            var $combo = this['$' + k];
            if (!$combo) {
                return;
            }

            // define method name to fill items, e.g `fillDays`
            var f = 'fill' + k.charAt(0).toUpperCase() + k.slice(1);
            var items = this[f]();
            var value = $combo.val();

            $combo.empty();
            for (var i = 0; i < items.length; i++) {
                $combo.append('<option value="' + items[i][0] + '">' + items[i][1] + '</option>');
            }

            $combo.val(value);
        },

        /*
         Initialize items of combos. Handles `firstItem` option
        */
        fillCommon: function(key) {
            var values = [],
                relTime;

            if (this.options.firstItem === 'name') {
                //need both to support moment ver < 2 and  >= 2
                relTime = moment.relativeTime || moment.langData()._relativeTime;
                var header = typeof relTime[key] === 'function' ? relTime[key](1, true, key, false) : relTime[key];
                //take last entry (see momentjs lang files structure)
                header = header.split(' ').reverse()[0];
                values.push(['', header]);
            } else if (this.options.firstItem === 'empty') {
                values.push(['', '']);
            }
            return values;
        },


        /*
        fill day
        */
        fillDay: function() {
            var items = this.fillCommon('d'),
                name, i,
                twoDigit = this.options.template.indexOf('DD') !== -1,
                daysCount = 31;

            // detect days count (depends on month and year)
            // originally https://github.com/vitalets/combodate/pull/7
            if (this.options.smartDays && this.$month && this.$year) {
                var month = parseInt(this.$month.val(), 10);
                var year = parseInt(this.$year.val(), 10);

                if (!isNaN(month) && !isNaN(year)) {
                    daysCount = moment([year, month]).daysInMonth();
                }
            }

            for (i = 1; i <= daysCount; i++) {
                name = twoDigit ? this.leadZero(i) : i;
                items.push([i, name]);
            }
            return items;
        },

        /*
        fill month
        */
        fillMonth: function() {
            var items = this.fillCommon('M'),
                name, i,
                longNames = this.options.template.indexOf('MMMM') !== -1,
                shortNames = this.options.template.indexOf('MMM') !== -1,
                twoDigit = this.options.template.indexOf('MM') !== -1;

            for (i = 0; i <= 11; i++) {
                if (longNames) {
                    //see https://github.com/timrwood/momentjs.com/pull/36
                    name = moment().date(1).month(i).format('MMMM');
                } else if (shortNames) {
                    name = moment().date(1).month(i).format('MMM');
                } else if (twoDigit) {
                    name = this.leadZero(i + 1);
                } else {
                    name = i + 1;
                }
                items.push([i, name]);
            }
            return items;
        },

        /*
        fill year
        */
        fillYear: function() {
            var items = [],
                name, i,
                longNames = this.options.template.indexOf('YYYY') !== -1;

            for (i = this.options.maxYear; i >= this.options.minYear; i--) {
                name = longNames ? i : (i + '').substring(2);
                items[this.options.yearDescending ? 'push' : 'unshift']([i, name]);
            }

            items = this.fillCommon('y').concat(items);

            return items;
        },

        /*
        fill hour
        */
        fillHour: function() {
            var items = this.fillCommon('h'),
                name, i,
                h12 = this.options.template.indexOf('h') !== -1,
                h24 = this.options.template.indexOf('H') !== -1,
                twoDigit = this.options.template.toLowerCase().indexOf('hh') !== -1,
                min = h12 ? 1 : 0,
                max = h12 ? 12 : 23;

            for (i = min; i <= max; i++) {
                name = twoDigit ? this.leadZero(i) : i;
                items.push([i, name]);
            }
            return items;
        },

        /*
        fill minute
        */
        fillMinute: function() {
            var items = this.fillCommon('m'),
                name, i,
                twoDigit = this.options.template.indexOf('mm') !== -1;

            for (i = 0; i <= 59; i += this.options.minuteStep) {
                name = twoDigit ? this.leadZero(i) : i;
                items.push([i, name]);
            }
            return items;
        },

        /*
        fill second
        */
        fillSecond: function() {
            var items = this.fillCommon('s'),
                name, i,
                twoDigit = this.options.template.indexOf('ss') !== -1;

            for (i = 0; i <= 59; i += this.options.secondStep) {
                name = twoDigit ? this.leadZero(i) : i;
                items.push([i, name]);
            }
            return items;
        },

        /*
        fill ampm
        */
        fillAmpm: function() {
            var ampmL = this.options.template.indexOf('a') !== -1,
                ampmU = this.options.template.indexOf('A') !== -1,
                items = [
                    ['am', ampmL ? 'am' : 'AM'],
                    ['pm', ampmL ? 'pm' : 'PM']
                ];
            return items;
        },

        /*
         Returns current date value from combos.
         If format not specified - `options.format` used.
         If format = `null` - Moment object returned.
        */
        getValue: function(format) {
            var dt, values = {},
            that = this,
                notSelected = false;

            //getting selected values
            $.each(this.map, function(k, v) {
                if (k === 'ampm') {
                    return;
                }
                var def = k === 'day' ? 1 : 0;

                values[k] = that['$' + k] ? parseInt(that['$' + k].val(), 10) : def;

                if (isNaN(values[k])) {
                    notSelected = true;
                    return false;
                }
            });

            //if at least one visible combo not selected - return empty string
            if (notSelected) {
                return '';
            }

            //convert hours 12h --> 24h
            if (this.$ampm) {
                //12:00 pm --> 12:00 (24-h format, midday), 12:00 am --> 00:00 (24-h format, midnight, start of day)
                if (values.hour === 12) {
                    values.hour = this.$ampm.val() === 'am' ? 0 : 12;
                } else {
                    values.hour = this.$ampm.val() === 'am' ? values.hour : values.hour + 12;
                }
            }

            dt = moment([values.year, values.month, values.day, values.hour, values.minute, values.second]);

            //highlight invalid date
            this.highlight(dt);

            format = format === undefined ? this.options.format : format;
            if (format === null) {
                return dt.isValid() ? dt : null;
            } else {
                return dt.isValid() ? dt.format(format) : '';
            }
        },

        setValue: function(value) {
            if (!value) {
                return;
            }

            var dt = typeof value === 'string' ? moment(value, this.options.format) : moment(value),
                that = this,
                values = {};

            //function to find nearest value in select options
            function getNearest($select, value) {
                var delta = {};
                $select.children('option').each(function(i, opt) {
                    var optValue = $(opt).attr('value'),
                        distance;

                    if (optValue === '') return;
                    distance = Math.abs(optValue - value);
                    if (typeof delta.distance === 'undefined' || distance < delta.distance) {
                        delta = {
                            value: optValue,
                            distance: distance
                        };
                    }
                });
                return delta.value;
            }

            if (dt.isValid()) {
                //read values from date object
                $.each(this.map, function(k, v) {
                    if (k === 'ampm') {
                        return;
                    }
                    values[k] = dt[v[1]]();
                });

                if (this.$ampm) {
                    //12:00 pm --> 12:00 (24-h format, midday), 12:00 am --> 00:00 (24-h format, midnight, start of day)
                    if (values.hour >= 12) {
                        values.ampm = 'pm';
                        if (values.hour > 12) {
                            values.hour -= 12;
                        }
                    } else {
                        values.ampm = 'am';
                        if (values.hour === 0) {
                            values.hour = 12;
                        }
                    }
                }

                $.each(values, function(k, v) {
                    //call val() for each existing combo, e.g. this.$hour.val()
                    if (that['$' + k]) {

                        if (k === 'minute' && that.options.minuteStep > 1 && that.options.roundTime) {
                            v = getNearest(that['$' + k], v);
                        }

                        if (k === 'second' && that.options.secondStep > 1 && that.options.roundTime) {
                            v = getNearest(that['$' + k], v);
                        }

                        that['$' + k].val(v);
                    }
                });

                // update days count
                if (this.options.smartDays) {
                    this.fillCombo('day');
                }

                this.$element.val(dt.format(this.options.format)).change();
            }
        },

        /*
         highlight combos if date is invalid
        */
        highlight: function(dt) {
            if (!dt.isValid()) {
                if (this.options.errorClass) {
                    this.$widget.addClass(this.options.errorClass);
                } else {
                    //store original border color
                    if (!this.borderColor) {
                        this.borderColor = this.$widget.find('select').css('border-color');
                    }
                    this.$widget.find('select').css('border-color', 'red');
                }
            } else {
                if (this.options.errorClass) {
                    this.$widget.removeClass(this.options.errorClass);
                } else {
                    this.$widget.find('select').css('border-color', this.borderColor);
                }
            }
        },

        leadZero: function(v) {
            return v <= 9 ? '0' + v : v;
        },

        destroy: function() {
            this.$widget.remove();
            this.$element.removeData('combodate').show();
        }

        //todo: clear method
    };

    $.fn.combodate = function(option) {
        var d, args = Array.apply(null, arguments);
        args.shift();

        //getValue returns date as string / object (not jQuery object)
        if (option === 'getValue' && this.length && (d = this.eq(0).data('combodate'))) {
            return d.getValue.apply(d, args);
        }

        return this.each(function() {
            var $this = $(this),
                data = $this.data('combodate'),
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('combodate', (data = new Combodate(this, options)));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
    };

    $.fn.combodate.defaults = {
        //in this format value stored in original input
        format: 'DD-MM-YYYY HH:mm',
        //in this format items in dropdowns are displayed
        template: 'D / MMM / YYYY   H : mm',
        //initial value, can be `new Date()`
        value: null,
        minYear: 1970,
        maxYear: 2015,
        yearDescending: true,
        minuteStep: 5,
        secondStep: 1,
        firstItem: 'empty', //'name', 'empty', 'none'
        errorClass: null,
        roundTime: true, // whether to round minutes and seconds if step > 1
        smartDays: false // whether days in combo depend on selected month: 31, 30, 28
    };

}(window.jQuery));






/**
Combodate input - dropdown date and time picker.
Based on [combodate](http://vitalets.github.com/combodate) plugin (included). To use it you should manually include [momentjs](http://momentjs.com).

    <script src="js/moment.min.js"></script>

Allows to input:

* only date
* only time
* both date and time

Please note, that format is taken from momentjs and **not compatible** with bootstrap-datepicker / jquery UI datepicker.
Internally value stored as `momentjs` object.

@class combodate
@extends abstractinput
@final
@since 1.4.0
@example
<a href="#" id="dob" data-type="combodate" data-pk="1" data-url="/post" data-value="1984-05-15" data-title="Select date"></a>
<script>
$(function(){
    $('#dob').editable({
        format: 'YYYY-MM-DD',
        viewformat: 'DD.MM.YYYY',
        template: 'D / MMMM / YYYY',
        combodate: {
                minYear: 2000,
                maxYear: 2015,
                minuteStep: 1
           }
        }
    });
});
</script>
**/

/*global moment*/

(function($) {
    "use strict";

    var Constructor = function(options) {
        this.init('combodate', options, Constructor.defaults);

        //by default viewformat equals to format
        if (!this.options.viewformat) {
            this.options.viewformat = this.options.format;
        }

        //try parse combodate config defined as json string in data-combodate
        options.combodate = $.fn.editableutils.tryParseJson(options.combodate, true);

        //overriding combodate config (as by default jQuery extend() is not recursive)
        this.options.combodate = $.extend({}, Constructor.defaults.combodate, options.combodate, {
            format: this.options.format,
            template: this.options.template
        });
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.abstractinput);

    $.extend(Constructor.prototype, {
        render: function() {
            this.$input.combodate(this.options.combodate);

            if ($.fn.editableform.engine === 'bs3') {
                this.$input.siblings().find('select').addClass('form-control');
            }

            if (this.options.inputclass) {
                this.$input.siblings().find('select').addClass(this.options.inputclass);
            }
            //"clear" link
            /*
            if(this.options.clear) {
                this.$clear = $('<a href="#"></a>').html(this.options.clear).click($.proxy(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    this.clear();
                }, this));

                this.$tpl.parent().append($('<div class="editable-clear">').append(this.$clear));
            }
            */
        },

        value2html: function(value, element) {
            var text = value ? value.format(this.options.viewformat) : '';
            //$(element).text(text);
            Constructor.superclass.value2html.call(this, text, element);
        },

        html2value: function(html) {
            return html ? moment(html, this.options.viewformat) : null;
        },

        value2str: function(value) {
            return value ? value.format(this.options.format) : '';
        },

        str2value: function(str) {
            return str ? moment(str, this.options.format) : null;
        },

        value2submit: function(value) {
            return this.value2str(value);
        },

        value2input: function(value) {
            this.$input.combodate('setValue', value);
        },

        input2value: function() {
            return this.$input.combodate('getValue', null);
        },

        activate: function() {
            this.$input.siblings('.combodate').find('select').eq(0).focus();
        },

        /*
       clear:  function() {
          this.$input.data('datepicker').date = null;
          this.$input.find('.active').removeClass('active');
       },
       */

        autosubmit: function() {

        }

    });

    Constructor.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl
        @default <input type="text">
        **/
        tpl: '<input type="text">',
        /**
        @property inputclass
        @default null
        **/
        inputclass: null,
        /**
        Format used for sending value to server. Also applied when converting date from <code>data-value</code> attribute.<br>
        See list of tokens in [momentjs docs](http://momentjs.com/docs/#/parsing/string-format)

        @property format
        @type string
        @default YYYY-MM-DD
        **/
        format: 'YYYY-MM-DD',
        /**
        Format used for displaying date. Also applied when converting date from element's text on init.
        If not specified equals to `format`.

        @property viewformat
        @type string
        @default null
        **/
        viewformat: null,
        /**
        Template used for displaying dropdowns.

        @property template
        @type string
        @default D / MMM / YYYY
        **/
        template: 'D / MMM / YYYY',
        /**
        Configuration of combodate.
        Full list of options: http://vitalets.github.com/combodate/#docs

        @property combodate
        @type object
        @default null
        **/
        combodate: null

        /*
        (not implemented yet)
        Text shown as clear date button.
        If <code>false</code> clear button will not be rendered.

        @property clear
        @type boolean|string
        @default 'x clear'
        */
        //clear: '× clear'
    });

    $.fn.editabletypes.combodate = Constructor;

}(window.jQuery));



/**
 * Editable Poshytip
 * ---------------------
 * requires jquery.poshytip.js
 */ (function($) {
    "use strict";

    //extend methods
    $.extend($.fn.editableContainer.Popup.prototype, {
        containerName: 'poshytip',
        innerCss: 'div.tip-inner',
        defaults: $.fn.poshytip.defaults,

        initContainer: function() {
            this.handlePlacement();

            $.extend(this.containerOptions, {
                showOn: 'none',
                content: '',
                alignTo: 'target'
            });

            this.call(this.containerOptions);
        },

        /*
        Overwrite totally show() method as poshytip requires content is set before show
        */
        show: function(closeAll) {
            this.$element.addClass('editable-open');
            if (closeAll !== false) {
                //close all open containers (except this)
                this.closeOthers(this.$element[0]);
            }

            //render form
            this.$form = $('<div>');
            this.renderForm();

            var $label = $('<label>').text(this.options.title || this.$element.data("title") || this.$element.data("originalTitle")),
                $content = $('<div>').append($label).append(this.$form);

            this.call('update', $content);
            this.call('show');

            this.tip().addClass(this.containerClass);
            this.$form.data('editableform').input.activate();
        },

        /* hide */
        innerHide: function() {
            this.call('hide');
        },

        /* destroy */
        innerDestroy: function() {
            this.call('destroy');
        },

        setPosition: function() {
            this.container().refresh(false);
        },

        handlePlacement: function() {
            var x, y, ox = 0,
                oy = 0;
            switch (this.options.placement) {
                case 'top':
                    x = 'center';
                    y = 'top';
                    oy = 5;
                    break;
                case 'right':
                    x = 'right';
                    y = 'center';
                    ox = 10;
                    break;
                case 'bottom':
                    x = 'center';
                    y = 'bottom';
                    oy = 5;
                    break;
                case 'left':
                    x = 'left';
                    y = 'center';
                    ox = 10;
                    break;
            }

            $.extend(this.containerOptions, {
                alignX: x,
                offsetX: ox,
                alignY: y,
                offsetY: oy
            });
        }
    });

    //defaults
    $.fn.editableContainer.defaults = $.extend({}, $.fn.editableContainer.defaults, {
        className: 'tip-yellowsimple'
    });


    /**
     * Poshytip fix: disable incorrect table display
     * see https://github.com/vadikom/poshytip/issues/7
     */
    /*jshint eqeqeq:false, curly: false*/
    if ($.Poshytip) { //need this check, because in inline mode poshytip may not be loaded!
        var tips = [],
            reBgImage = /^url\(["']?([^"'\)]*)["']?\);?$/i,
            rePNG = /\.png$/i,
            ie6 = !! window.createPopup && document.documentElement.currentStyle.minWidth == 'undefined';

        $.Poshytip.prototype.refresh = function(async) {
            if (this.disabled) return;

            var currPos;
            if (async) {
                if (!this.$tip.data('active')) return;
                // save current position as we will need to animate
                currPos = {
                    left: this.$tip.css('left'),
                    top: this.$tip.css('top')
                };
            }

            // reset position to avoid text wrapping, etc.
            this.$tip.css({
                left: 0,
                top: 0
            }).appendTo(document.body);

            // save default opacity
            if (this.opacity === undefined) this.opacity = this.$tip.css('opacity');

            // check for images - this code is here (i.e. executed each time we show the tip and not on init) due to some browser inconsistencies
            var bgImage = this.$tip.css('background-image').match(reBgImage),
                arrow = this.$arrow.css('background-image').match(reBgImage);

            if (bgImage) {
                var bgImagePNG = rePNG.test(bgImage[1]);
                // fallback to background-color/padding/border in IE6 if a PNG is used
                if (ie6 && bgImagePNG) {
                    this.$tip.css('background-image', 'none');
                    this.$inner.css({
                        margin: 0,
                        border: 0,
                        padding: 0
                    });
                    bgImage = bgImagePNG = false;
                } else {
                    this.$tip.prepend('<table class="fallback" border="0" cellpadding="0" cellspacing="0"><tr><td class="tip-top tip-bg-image" colspan="2"><span></span></td><td class="tip-right tip-bg-image" rowspan="2"><span></span></td></tr><tr><td class="tip-left tip-bg-image" rowspan="2"><span></span></td><td></td></tr><tr><td class="tip-bottom tip-bg-image" colspan="2"><span></span></td></tr></table>')
                        .css({
                        border: 0,
                        padding: 0,
                        'background-image': 'none',
                        'background-color': 'transparent'
                    })
                        .find('.tip-bg-image').css('background-image', 'url("' + bgImage[1] + '")').end()
                        .find('td').eq(3).append(this.$inner);
                }
                // disable fade effect in IE due to Alpha filter + translucent PNG issue
                if (bgImagePNG && !$.support.opacity) this.opts.fade = false;
            }
            // IE arrow fixes
            if (arrow && !$.support.opacity) {
                // disable arrow in IE6 if using a PNG
                if (ie6 && rePNG.test(arrow[1])) {
                    arrow = false;
                    this.$arrow.css('background-image', 'none');
                }
                // disable fade effect in IE due to Alpha filter + translucent PNG issue
                this.opts.fade = false;
            }

            var $table = this.$tip.find('table.fallback');
            if (ie6) {
                // fix min/max-width in IE6
                this.$tip[0].style.width = '';
                $table.width('auto').find('td').eq(3).width('auto');
                var tipW = this.$tip.width(),
                    minW = parseInt(this.$tip.css('min-width'), 10),
                    maxW = parseInt(this.$tip.css('max-width'), 10);
                if (!isNaN(minW) && tipW < minW) tipW = minW;
                else if (!isNaN(maxW) && tipW > maxW) tipW = maxW;
                this.$tip.add($table).width(tipW).eq(0).find('td').eq(3).width('100%');
            } else if ($table[0]) {
                // fix the table width if we are using a background image
                // IE9, FF4 use float numbers for width/height so use getComputedStyle for them to avoid text wrapping
                // for details look at: http://vadikom.com/dailies/offsetwidth-offsetheight-useless-in-ie9-firefox4/
                $table.width('auto').find('td').eq(3).width('auto').end().end().width(document.defaultView && document.defaultView.getComputedStyle && parseFloat(document.defaultView.getComputedStyle(this.$tip[0], null).width) || this.$tip.width()).find('td').eq(3).width('100%');
            }
            this.tipOuterW = this.$tip.outerWidth();
            this.tipOuterH = this.$tip.outerHeight();

            this.calcPos();

            // position and show the arrow image
            if (arrow && this.pos.arrow) {
                this.$arrow[0].className = 'tip-arrow tip-arrow-' + this.pos.arrow;
                this.$arrow.css('visibility', 'inherit');
            }

            if (async) {
                this.asyncAnimating = true;
                var self = this;
                this.$tip.css(currPos).animate({
                    left: this.pos.l,
                    top: this.pos.t
                }, 200, function() {
                    self.asyncAnimating = false;
                });
            } else {
                this.$tip.css({
                    left: this.pos.l,
                    top: this.pos.t
                });
            }
        };
    }
    /*jshinteqeqeq: true, curly: true*/
}(window.jQuery));





/**
jQuery UI Datepicker.
Description and examples: http://jqueryui.com/datepicker.
This input is also accessible as **date** type. Do not use it together with __bootstrap-datepicker__ as both apply <code>$().datepicker()</code> method.
For **i18n** you should include js file from here: https://github.com/jquery/jquery-ui/tree/master/ui/i18n.

@class dateui
@extends abstractinput
@final
@example
<a href="#" id="dob" data-type="date" data-pk="1" data-url="/post" data-title="Select date">15/05/1984</a>
<script>
$(function(){
    $('#dob').editable({
        format: 'yyyy-mm-dd',
        viewformat: 'dd/mm/yyyy',
        datepicker: {
                firstDay: 1
           }
        }
    });
});
</script>
**/
(function($) {
    "use strict";

    var DateUI = function(options) {
        this.init('dateui', options, DateUI.defaults);
        this.initPicker(options, DateUI.defaults);
    };

    $.fn.editableutils.inherit(DateUI, $.fn.editabletypes.abstractinput);

    $.extend(DateUI.prototype, {
        initPicker: function(options, defaults) {
            //by default viewformat equals to format
            if (!this.options.viewformat) {
                this.options.viewformat = this.options.format;
            }

            //correct formats: replace yyyy with yy (for compatibility with bootstrap datepicker)
            this.options.viewformat = this.options.viewformat.replace('yyyy', 'yy');
            this.options.format = this.options.format.replace('yyyy', 'yy');

            //overriding datepicker config (as by default jQuery extend() is not recursive)
            //since 1.4 datepicker internally uses viewformat instead of format. Format is for submit only
            this.options.datepicker = $.extend({}, defaults.datepicker, options.datepicker, {
                dateFormat: this.options.viewformat
            });
        },

        render: function() {
            this.$input.datepicker(this.options.datepicker);

            //"clear" link
            if (this.options.clear) {
                this.$clear = $('<a href="#"></a>').html(this.options.clear).click($.proxy(function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.clear();
                }, this));

                this.$tpl.parent().append($('<div class="editable-clear">').append(this.$clear));
            }
        },

        value2html: function(value, element) {
            var text = $.datepicker.formatDate(this.options.viewformat, value);
            DateUI.superclass.value2html.call(this, text, element);
        },

        html2value: function(html) {
            if (typeof html !== 'string') {
                return html;
            }

            //if string does not match format, UI datepicker throws exception
            var d;
            try {
                d = $.datepicker.parseDate(this.options.viewformat, html);
            } catch (e) {}

            return d;
        },

        value2str: function(value) {
            return $.datepicker.formatDate(this.options.format, value);
        },

        str2value: function(str) {
            if (typeof str !== 'string') {
                return str;
            }

            //if string does not match format, UI datepicker throws exception
            var d;
            try {
                d = $.datepicker.parseDate(this.options.format, str);
            } catch (e) {}

            return d;
        },

        value2submit: function(value) {
            return this.value2str(value);
        },

        value2input: function(value) {
            this.$input.datepicker('setDate', value);
        },

        input2value: function() {
            return this.$input.datepicker('getDate');
        },

        activate: function() {},

        clear: function() {
            this.$input.datepicker('setDate', null);
            // submit automatically whe that are no buttons
            if (this.isAutosubmit) {
                this.submit();
            }
        },

        autosubmit: function() {
            this.isAutosubmit = true;
            this.$input.on('mouseup', 'table.ui-datepicker-calendar a.ui-state-default', $.proxy(this.submit, this));
        },

        submit: function() {
            var $form = this.$input.closest('form');
            setTimeout(function() {
                $form.submit();
            }, 200);
        }

    });

    DateUI.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl
        @default <div></div>
        **/
        tpl: '<div class="editable-date"></div>',
        /**
        @property inputclass
        @default null
        **/
        inputclass: null,
        /**
        Format used for sending value to server. Also applied when converting date from <code>data-value</code> attribute.<br>
        Full list of tokens: http://docs.jquery.com/UI/Datepicker/formatDate

        @property format
        @type string
        @default yyyy-mm-dd
        **/
        format: 'yyyy-mm-dd',
        /**
        Format used for displaying date. Also applied when converting date from element's text on init.
        If not specified equals to <code>format</code>

        @property viewformat
        @type string
        @default null
        **/
        viewformat: null,

        /**
        Configuration of datepicker.
        Full list of options: http://api.jqueryui.com/datepicker

        @property datepicker
        @type object
        @default {
           firstDay: 0,
           changeYear: true,
           changeMonth: true
        }
        **/
        datepicker: {
            firstDay: 0,
            changeYear: true,
            changeMonth: true,
            showOtherMonths: true
        },
        /**
        Text shown as clear date button.
        If <code>false</code> clear button will not be rendered.

        @property clear
        @type boolean|string
        @default 'x clear'
        **/
        clear: '× clear'
    });

    $.fn.editabletypes.dateui = DateUI;

}(window.jQuery));



/**
jQuery UI datefield input - modification for inline mode.
Shows normal <input type="text"> and binds popup datepicker.
Automatically shown in inline mode.

@class dateuifield
@extends dateui

@since 1.4.0
**/
(function($) {
    "use strict";

    var DateUIField = function(options) {
        this.init('dateuifield', options, DateUIField.defaults);
        this.initPicker(options, DateUIField.defaults);
    };

    $.fn.editableutils.inherit(DateUIField, $.fn.editabletypes.dateui);

    $.extend(DateUIField.prototype, {
        render: function() {
            //  this.$input = this.$tpl.find('input');
            this.$input.datepicker(this.options.datepicker);
            $.fn.editabletypes.text.prototype.renderClear.call(this);
        },

        value2input: function(value) {
            this.$input.val($.datepicker.formatDate(this.options.viewformat, value));
        },

        input2value: function() {
            return this.html2value(this.$input.val());
        },

        activate: function() {
            $.fn.editabletypes.text.prototype.activate.call(this);
        },

        toggleClear: function() {
            $.fn.editabletypes.text.prototype.toggleClear.call(this);
        },

        autosubmit: function() {
            //reset autosubmit to empty
        }
    });

    DateUIField.defaults = $.extend({}, $.fn.editabletypes.dateui.defaults, {
        /**
        @property tpl
        @default <input type="text">
        **/
        tpl: '<input type="text"/>',
        /**
        @property inputclass
        @default null
        **/
        inputclass: null,

        /* datepicker config */
        datepicker: {
            showOn: "button",
            buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
            buttonImageOnly: true,
            firstDay: 0,
            changeYear: true,
            changeMonth: true,
            showOtherMonths: true
        },

        /* disable clear link */
        clear: false
    });

    $.fn.editabletypes.dateuifield = DateUIField;

}(window.jQuery));




















