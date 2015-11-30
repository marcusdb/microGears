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
[![awsomeness](https://img.shields.io/badge/usability-awsome-brightgreen.svg)](https://github.com/marcusdb/microGears)




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

```javascript
var MicroGears = require('microgears');

var userService = {
    name: 'userService',
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
Since MicroGears is goint to transform the service functions into promises you should keep this in mind when using the framework

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

The **name** field is mandatory and there must be a **filter** function which the first parameter is going to be pointer for the next plugin in the chain or the service function itself (after the whole plugin stack is called)
The **filter** function will always have only two parameters: the *next* function and an array of all service function parameters (can be modified or not but should be used as a parameter to the *next* function call). 

### A trace plugin
```javascript
var MicroGears = require('microgears');

var tracePlugin = {
    name: 'tracePlugin',
    filter: function (next, args) {
        console.info('NameSpace'+this.serviceNameSpace+' Service:' + this.serviceName + ' Method:' + this.methodName + ' BEFORE');
        result = next(args);
        console.info('NameSpace'+this.serviceNameSpace+' Service:' + this.serviceName + ' Method:' + this.methodName + ' BEFORE');
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
        var result, hrstart, end, hrend, start;
        if (this.serviceName==='userService'){
            hrstart = process.hrtime();
            start = new Date();
            result = next(args);
            end = new Date() - start;
            hrend = process.hrtime(hrstart);
    
            console.info('Service:' + this.serviceName + ' Method:' + this.methodName + "Execution time: %dms", end);
            console.info('Service:' + this.serviceName + ' Method:' + this.methodName + "Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
        }else{
            result = next(args);
        }
        
        return result;

    }
};

MicroGears.addPlugin(performancePlugin);
```
