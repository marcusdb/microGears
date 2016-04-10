[![NPM](https://nodei.co/npm/microgears.png)](https://nodei.co/npm/microgears/)

[![npm version](https://badge.fury.io/js/microgears.svg)](https://badge.fury.io/js/microgears)
[![Build Status](https://travis-ci.org/marcusdb/microGears.svg?branch=master)](https://travis-ci.org/marcusdb/microGears)
[![Dependency Status](https://david-dm.org/marcusdb/microGears.svg)](https://david-dm.org/marcusdb/microGears)
[![devDependency Status](https://david-dm.org/marcusdb/microGears/dev-status.svg)](https://david-dm.org/marcusdb/microGears#info=devDependencies)
[![Issue Stats](http://issuestats.com/github/marcusdb/microGears/badge/issue?style=flat)](http://issuestats.com/github/marcusdb/microGears)
[![Issue Stats](http://issuestats.com/github/marcusdb/microGears/badge/pr?style=flat)](http://issuestats.com/github/marcusdb/microGears)
[![Code Climate](https://codeclimate.com/github/marcusdb/microGears/badges/gpa.svg)](https://codeclimate.com/github/marcusdb/microGears)
[![Test Coverage](https://codeclimate.com/github/marcusdb/microGears/badges/coverage.svg)](https://codeclimate.com/github/marcusdb/microGears/coverage)
[![Issue Count](https://codeclimate.com/github/marcusdb/microGears/badges/issue_count.svg)](https://codeclimate.com/github/marcusdb/microGears)
[![TypeScript definitions on DefinitelyTyped](//definitelytyped.org/badges/standard.svg)](http://definitelytyped.org)



# MicroGears
MicroGears a super lightweight micro framework for reactive services

MicroGears was build with 3 main objectives in mind.

* enforce immutability of function parameters
* enforce all function calls to be promisified
* enable your service to be filtered in a transparent way (with more then one filter simultaneously)
* help to administer service dependency in favor of a better and more controlled test environment



## How to register a service

The **name** and **namespace** are mandatory fields for the service, the reason is that later you are going to be able to appy the plugins to only certain services or namespaces (ie services.company.persistance or routes.company, etc..).
Needless to say services must be registered before use.

VERY IMPORTANT--->ALL service calls are promisify by microGears for you, so they are **ALWAYS** asynchronous, except when the **async** property is set to false, this property is optional and your **default value is true**

```javascript
var MicroGears = require('microgears');

var userService = {
    name: 'userService',
    async: true, //This is an optional property : [default = true ]. This is the same as omitting it.
    namespace: "services.userservice",
    findUserById: function (id) {
        return {
            name: 'user',
            id: id
        };
    }
};
MicroGears.addService(userService);
```
Since MicroGears is goint to transform the service functions into promises you should keep this in mind when using the framework, except if async is set to false

### Using the registered service

Example

```javascript
    MicroGears.userService.findUserById(req.params.id).then(function (result) {
        console.log(result);
    }).catch(function (error) {
        console.log(error.stack);
    });
```    

## How to register a plugin

The **name** field is mandatory and there must be a **beforeChain**, **afterChain** or both functions, which the first parameter is going to an array of all service function parameters (can be modified or not but should be used as a return of this function),
the next parameter is a meta information of the service call, it is an object that you can share information between another plugins.

The **beforeChain** or **afterChain** function will always have only two parameters: the *args*,  an array of all service function parameters, and *_meta*, an object that have information about service caller, an can used too for sharing information between plugins.

VERY IMPORTANT--->plugins follow the service behaviors about synchronization if async service property, is seted to false, services and plugins will be synchronous, otherwise, all will be async.

### A trace plugin
```javascript
var MicroGears = require('microgears');

var tracePlugin = {
    name: 'tracePlugin',
    beforeChain: function (args, _meta) {
        var serviceName = _meta.serviceName,
            method = _meta.methodName;
        console.log('before call-> '+serviceName+'.'+method);

        _meta.mySharedData = {
            count: 1
        };

        return args
    },
    afterChain: function (result, _meta) {
        var serviceName = _meta.serviceName,
            method = _meta.methodName;

        console.log('after of-> '+serviceName+'.'+method);
        if(_meta.mySharedData.count){
            console.log('this number comes to the beforeChain: '+ _meta.mySharedData.count);
        }

        return result;
    }
};

MicroGears.addPlugin(tracePlugin);
```

### A performance meter plugin (that only measures performance for the *userService* service

```javascript
var MicroGears = require('microgears');

var performancePlugin = {
    name: 'performancePlugin',
    filter: function (next, args) {
        var hrstart, end, hrend, start, logPerformance = false,serviceName=this.microgears.serviceName,method=this.microgears.methodName;
        logPerformance = (serviceName === 'userService');
        if (logPerformance) {
            hrstart = process.hrtime();
            start = new Date();
            
        }
        return next(args).finally(function () {
            if (logPerformance) {
                end = new Date() - start;
                hrend = process.hrtime(hrstart);
                
                console.log('Service:' + serviceName+ ' Method:' + method + "Execution time: %dms", end);
                console.log('Service:' + serviceName+ ' Method:' + method + "Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
            }
        });

    }
};

var performancePlugin = {
    name: 'performancePlugin',
    beforeChain: function (args, _meta) {
        var hrstart, start, logPerformance = false, serviceName = this.microgears.serviceName;

        logPerformance = (serviceName === 'testService');
        if (logPerformance) {
            hrstart = process.hrtime();
            start = new Date();
        }

        _meta.statistcs = {
            hrstart: hrstart,
            start: start,
            logPerformance: logPerformance
        };

        return args;

    },
    afterChain: function (result, _meta) {
        if (_meta.statistcs.logPerformance) {
            _meta.statistcs.end = new Date() - _meta.statistcs.start;
            _meta.statistcs.hrend = process.hrtime(_meta.statistcs.hrstart);
        }

        console.log('Service:' + _meta.serviceName+ ' Method:' + _meta.method + "Execution time: %dms", _meta.statistcs.end);
        console.log('Service:' + _meta.serviceName+ ' Method:' + _meta.method + "Execution time (hr): %ds %dms", _meta.statistcs.hrend[0], _meta.statistcs.hrend[1] / 1000000);

        return result;
    }
};

MicroGears.addPlugin(performancePlugin);
```
