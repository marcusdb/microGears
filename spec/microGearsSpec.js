var MicroGears = require('../src/index');
var Promise = require('bluebird');

//MicroGears.addService({
//    name: 'userPersistence', path: __dirname,
//    saveData: function (obj) {
//        obj.bla = 666;
//        console.log('saveData Called');
//        console.log('path:' + this.path);
//        return 'RESULT:' + JSON.stringify(obj);
//    },
//    getData: function (obj) {
//        obj.bla = 666;
//        console.log('path:' + this.path);
//        return JSON.stringify(obj);
//    }
//
//});
//
//
//var obj = {bla: 1, ble: 2};
//var promise = ServiceController.userPersistence.saveData(obj)
//console.log('promise:' + ServiceController.userPersistence.saveData);
//console.log('promiseJSON:' + JSON.stringify(promise));
//obj.bla = 1000;
//promise.then(console.log);
//console.log('initial Obj:' + JSON.stringify(obj));
//setTimeout(function () {
//    console.log('initial Obj with delay:' + JSON.stringify(obj));
//}, 10);
//


describe("MicroGears ", function () {
    it("should be able to add a new service", function () {
        MicroGears.addService({
            name: 'testService', path: "path",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            },

        });
        expect(MicroGears.testService).not.toBe(undefined);
    });
    it("should be able to find a method in the new service", function () {
        MicroGears.addService({
            name: 'testService', path: "path",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            },

        });
        expect(MicroGears.testService.testFunction1).not.toBe(undefined);
        expect(typeof MicroGears.testService.testFunction1).toBe('function');
    });
    it("should be able to call a method in the new service !", function () {
        MicroGears.addService({
            name: 'testService', path: "path",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            },

        });
        expect(MicroGears.testService.testFunction1('a', 'b')).not.toBe(undefined);
    });
    it("should return a promise for all service method calls", function () {
        MicroGears.addService({
            name: 'testService', path: "path",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            },

        });
        expect(MicroGears.testService.testFunction1('a', 'b')  instanceof Promise).not.toBe(undefined);
    });
    it("should assure parameters are immutable", function (done) {
        MicroGears.addService({
            name: 'testService', path: "path",
            testFunction1: function (arg1, arg2) {
               'use strict';
                arg1.name = 'dddd'; 
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            },

        });
        var thenTest=function(arg){ expect(arg).toBe(undefined)};
        var catchTest=function(arg){ expect(arg).not.toBe(undefined)};
        MicroGears.testService.testFunction1({name:'a'},{}).then(thenTest).catch(catchTest).finally(done);
       
    });
    it("should assure parameters are immutable if 'use strict' is used", function (done) {
        MicroGears.addService({
            name: 'testService', path: "path",
            testFunction1: function (arg1, arg2) {
               
                arg1.name = 'dddd'; 
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            },

        });
        var thenTest=function(arg){ expect(arg).not.toBe(undefined)};
        var catchTest=function(arg){ expect(arg).toBe(undefined)};
        MicroGears.testService.testFunction1({name:'a'},{}).then(thenTest).catch(catchTest).finally(done);
       
    });

    it("should allow plugins to be added ", function (done) {
        MicroGears.addService({
            name: 'testService', path: "path",
            testFunction1: function (arg1, arg2) {
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            },

        });
        var plugin=function(chain,service,arg1,arg2){

            chain(service,arg1,arg2);
        }
        MicroGears.addPlugin()
        var thenTest=function(arg){ expect(arg).not.toBe(undefined)};
        var catchTest=function(arg){ expect(arg).toBe(undefined)};
        MicroGears.testService.testFunction1({name:'a'},{}).then(thenTest).catch(catchTest).finally(done);

    });

});





