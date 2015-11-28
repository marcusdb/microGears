/* globals require*/
"use strict";
var BlueBirdPromise = require('bluebird');
var R = require('ramda');
var ServiceController;

ServiceController = function ServiceController() {
    var _resetMicroGears, _addService, _validadeService, _buildPluginChain, _createPromisifyProxy, _addPlugin, _removePlugin, _deepFreeze, _servicePubFunctions = {}, _plugins = {}, _pluginChainCache = {}, _buildPluginChainCached, _services;

    _addPlugin = function _addPlugin(plugin) { // plugin has to have 4 args chain,service,body, header
        if (typeof plugin.filter !== 'function') {
            throw 'plugin must be a function';
        }
        if (!plugin.name) {
            throw 'plugin name is mandatory';
        }
        if (!!_plugins[plugin.name]) {
            throw 'plugin ' + plugin.name + ' is already defined';
        }
        _plugins[plugin.name] = plugin.filter;
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
        result = _pluginChainCache[service.name][functionName] || _buildPluginChain(service, fn);
        _pluginChainCache[service.name][functionName] = result;
        return result;
    };

    _buildPluginChain = function _buildPluginChain(service, fn) {
        var previous, currentFn;
        previous = function () {// removing chain & service arguments for the service function call
            return fn.apply(service, Array.prototype.slice.call(arguments).slice(2));
        };
        Object.keys(_plugins).forEach(function (a) {
            previous = R.curry(_plugins[a].bind(service))(previous);
        });
        currentFn = previous;
        return {
            process: function (service, args) {
                return currentFn.apply(service, args);
            }
        };
    };

    _validadeService = function _validadeService(service) {
        if (!R.has('name', service)) {
            throw 'service must have a name';
        }
    };

    _createPromisifyProxy = function _createPromisifyProxy(obj, key) {
        if (typeof obj[key] === 'function') {
            var func = obj[key];
            obj[key] = function () {
                var args = Array.prototype.slice.call(arguments).map(_deepFreeze);
                var meta = {
                    serviceName: obj.name,
                    methodName: key
                };
                return BlueBirdPromise.method(_buildPluginChainCached(meta, func).process)(meta, args);
            };
        }

    };

    _deepFreeze = function _deepFreeze(obj) {
        if (typeof obj !== 'object') {
            return obj;
        }

        // Retrieve the property names defined on obj
        var propNames = Object.getOwnPropertyNames(obj);

        // Freeze properties before freezing self
        propNames.forEach(function (name) {
            var prop = obj[name];

            // Freeze prop if it is an object
            if (typeof prop === 'object' && !Object.isFrozen(prop)) {
                _deepFreeze(prop);
            }

        });

        return Object.freeze(obj);
    };
    _addService = function _addService(service) {
        _validadeService(service);
        _services = _services || [];
        _services.push(service.name);
        Object.keys(service).forEach(R.curry(_createPromisifyProxy)(service));

        _servicePubFunctions[service.name] = service;
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
