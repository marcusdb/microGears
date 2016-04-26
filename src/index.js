/* globals require*/
"use strict";
var BlueBirdPromise = require('bluebird');
var R = require('ramda');
var ServiceController;

ServiceController = function ServiceController() {
    var _resetMicroGears, _addService, _validadeService, _buildPluginChain, _createPromisifyProxy, _addPlugin,
        _removePlugin, _deepFreeze, _servicePubFunctions = {}, _plugins = {}, _pluginChainCache = {}, _buildPluginChainCached,
        _services, _buildPluginAsync, _buildPluginSync;

    _addPlugin = function _addPlugin(plugin) { // plugin has to have 4 args chain,service,body, header
        if (typeof plugin.beforeChain !== 'function' && typeof plugin.afterChain !== 'function') {
            throw 'plugin must have a function called beforeChain, afterChain or both';
        }
        if (!plugin.name) {
            throw 'plugin name is mandatory';
        }
        if (!!_plugins[plugin.name]) {
            throw 'plugin ' + plugin.name + ' is already defined';
        }
        _plugins[plugin.name] = {
            beforeChain: plugin.beforeChain,
            afterChain: plugin.afterChain
        };
        _pluginChainCache = {};
    };

    _removePlugin = function _removePlugin(pluginName) { // plugin has to have 4 args chain,service,body, header
        if (!_plugins[pluginName]) {
            throw 'plugin ' + pluginName + ' does not exist';
        }
        delete _plugins[pluginName];
        _pluginChainCache = {};
    };

    _buildPluginChainCached = function _buildPluginChainCached(service, fn) {
        var functionName, result;
        functionName = fn.toString().split(')');
        _pluginChainCache[service.name] = _pluginChainCache[service.name] || {};
        result = _pluginChainCache[service.name][functionName] || _buildPluginChain(service, fn, service.async);
        _pluginChainCache[service.name][functionName] = result;
        return result;
    };

    _buildPluginChain = function _buildPluginChain(service, fn, async) {
        var previous, currentFn, beforePlugins, afterPlugins;
        if (async === undefined) async = true;

        return {
            process: function (service, args, _meta) {

                beforePlugins = Object.keys(_plugins).map(function (e) {
                    return _plugins[e].beforeChain;
                });
                currentFn = (async && _buildPluginAsync || _buildPluginSync).apply(null, [service, fn]);
                afterPlugins = R.reverse(R.filter(R.compose(R.not, R.either(R.isNil, R.isEmpty)), Object.keys(_plugins).map(function (e) {
                    return _plugins[e].afterChain;
                })));
                
                function reduceChain(b) {
                    return function (argsForThen) {
                        return b.apply(service, [argsForThen].concat(_meta));
                    };
                }

                var afterPluginPipe = async &&
                    R.reduce(function (a, b) {
                        return a.then(reduceChain(b));
                    }, R.__, afterPlugins) || R.reduce(function (a, b) {
                        return a.then ? a.then(reduceChain(b)) : reduceChain(b)(a);                        
                    }, R.__, afterPlugins);

                return R.pipe(
                    R.flatten,
                    R.filter(R.compose(R.not, R.either(R.isNil, R.isEmpty))),
                    (async &&
                        R.reduce(function (a, b) {
                            return a.then(function (argsForThen) {
                                return b.apply(service, [(Array.isArray(argsForThen) && argsForThen || [argsForThen])].concat(_meta));
                            });
                        }, BlueBirdPromise.resolve(args)) ||
                        R.reduce(function (a, b) {
                            return b.apply(service, [(Array.isArray(a) && a || [a])].concat(_meta));
                        }, args)
                    ),
                    afterPluginPipe
                )([
                    beforePlugins,
                    currentFn
                ]);

            }
        };
    };

    _buildPluginAsync = function _buildPluginAsync(service, fn) {
        return BlueBirdPromise.method(function (argsArray) {
            return fn.apply(service, (Array.isArray(argsArray) && argsArray || [argsArray]));
        });
    };

    _buildPluginSync = function _buildPluginSync(service, fn) {
        return function (argsArray) {
            return fn.apply(service, (Array.isArray(argsArray) && argsArray || [argsArray]));
        };
    };

    _validadeService = function _validadeService(service) {
        if (!R.has('name', service)) {
            throw 'service must have a name';
        }
    };

    _createPromisifyProxy = function _createPromisifyProxy(obj, key) {
        var async = obj.async;

        if (typeof obj[key] === 'function') {
            var func = obj[key];
            obj[key] = function () {
                var args = Array.prototype.slice.call(arguments);
                var _meta = {
                    serviceName: obj.name,
                    methodName: key,
                    serviceNameSpace: obj.namespace
                };
                obj.microgears = {
                    serviceName: _meta.serviceName,
                    serviceNameSpace: _meta.serviceNameSpace
                };

                return (async && BlueBirdPromise.method(_buildPluginChainCached(obj, func).process)(obj, args, _meta) || _buildPluginChainCached(obj, func).process(obj, args, _meta));
            };
        }

    };

    _addService = function _addService(service) {

        var createProxy;

        if (!service.name) {
            throw 'service name is mandatory';
        }
        if (!service.namespace) {
            throw 'service namespace is mandatory';
        }
        _validadeService(service);
        _services = _services || [];
        _services.push(service.name);

        service.async = (service.async === undefined ? true : service.async);

        createProxy = R.curry(_createPromisifyProxy);

        R.pipe(
            R.flatten,
            R.uniq,
            R.filter(R.compose(R.not, R.equals('constructor'))),
            R.forEach(createProxy(service))
        )([
            Object.getOwnPropertyNames(Object.getPrototypeOf(service)),
            Object.keys(service)
        ]);

        _servicePubFunctions[service.name] = service;
        return service;
    };

    _resetMicroGears = function () {
        var _this = this;
        _services = _services || [];
        _services.forEach(function (serviceName) {
            delete _this[serviceName];
        });
        _services = [];
        _pluginChainCache = {};
        _plugins = {};
    };

    _servicePubFunctions.addService = _addService;
    _servicePubFunctions.addPlugin = _addPlugin;
    _servicePubFunctions.removePlugin = _removePlugin;
    _servicePubFunctions.resetMicroGears = _resetMicroGears;

    return _servicePubFunctions;

}();

module.exports = ServiceController;
