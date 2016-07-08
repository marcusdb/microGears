/* global describe, it, before, beforeEach, after, afterEach, require */
/* jshint mocha:true, nonew:true, curly:true, noarg:true, forin:true, noempty:true, node:true, eqeqeq:true, strict:true, undef:true, expr:true, bitwise:true, -W030 */

"use strict";
var MicroGears = require('../src/index');
var BlueBirdPromise = require('bluebird');
var sinon = require('sinon');
var assert = require('chai').assert;

describe("MicroGears ", function () {

    beforeEach(function () {
        MicroGears.resetMicroGears();
    });

    it("should be able to add a new service", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace'

        });

        assert.ok(MicroGears.testService, "testService exists");
    });

    it("should be able to find a method in the new service", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            async: false,
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            }

        });

        assert.ok(MicroGears.testService.testFunction1, 'testFunction1 on testService exists');
        assert.isFunction(MicroGears.testService.testFunction1, 'testFunction1 on testService is a function');
        assert.equal(MicroGears.testService.testFunction1(1, 2), 'args: 1:1 2:2');
    });

    it("should be able to call a method in the new service", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            }

        });

        assert.ok(MicroGears.testService.testFunction1('a', 'b'), 'MicroGears.testService.testFunction1 returns correct value');
    });

    it("should return a promise for all service method calls", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            }

        });

        assert.instanceOf(MicroGears.testService.testFunction1('a', 'b'), BlueBirdPromise, 'promise instance of Bluebird');
    });

    it("should assure parameters are immutable", function (done) {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                arg1.name = 'dddd';
                return true;
            }

        });
        var thenTest = function (arg) {
            assert.ok(arg);
        };

        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(done).finally(done);

    });

    it("should allow plugins to be added ", function (done) {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                return true;
            }

        });
        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function beforeChain(args, _meta) {
                return args;
            }
        };
        MicroGears.addPlugin(plugin1);
        var thenTest = function (arg) {
            assert.ok(arg);
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(done).finally(done);

    });

    it("should assure plugins are going to be called on service function call ", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                return true;
            }

        };
        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args, _meta) {
                return args;
            }
        };
        var spy = sinon.spy(plugin1.beforeChain);
        plugin1.beforeChain = spy;

        MicroGears.addService(service);

        MicroGears.addPlugin(plugin1);

        var thenTest = function () {
            assert.ok(spy.calledOnce);
            assert.equal(spy.callCount, 1);
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(done).finally(done);

    });

    it("should assure that service function call is going to be called on a multiple plugin environment", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                return true;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args, _meta) {
                return args;
            }
        };
        MicroGears.addPlugin(plugin1);
        var spy = sinon.spy(service.testFunction1);
        service.testFunction1 = spy;

        MicroGears.addService(service);

        var thenTest = function () {

            assert.ok(spy.calledOnce);
            assert.equal(spy.callCount, 1);
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(done).finally(done);

    });

    it("should assure that service function call is chainable through plugins ", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg) {
                return arg;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args) {
                return args;
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            beforeChain: function filter(args) {
                return args;
            }
        };
        var spy = sinon.spy(plugin1.beforeChain);
        var spy2 = sinon.spy(plugin2.beforeChain);

        plugin1.beforeChain = spy;
        plugin2.beforeChain = spy2;
        MicroGears.addPlugin(plugin1);
        MicroGears.addPlugin(plugin2);

        MicroGears.addService(service);

        var thenTest = function (result) {
            assert.equal(result, 'a');
            assert.ok(spy.calledOnce);
            assert.equal(spy.callCount, 1);
            assert.ok(spy2.calledOnce);
            assert.equal(spy2.callCount, 1);
        };
        MicroGears.testService.testFunction1('a').then(thenTest).catch(done).finally(done);

    });

    it("should assure that the context of all plugin and service function calls is the service context ", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                assert.equal(this.microgears.serviceName, 'testService');
                return true;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args) {
                return args;
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            beforeChain: function filter(args) {
                return args;
            }
        };

        MicroGears.addPlugin(plugin2);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        MicroGears.testService.testFunction1({name: 'a'}, {}).finally(done);

    });

    it("should assure that service parameters are properly propagated ", function (done) {
        var test2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                assert.equal(arg1, 'firstParameter');
                return true;
            },
            testFunction2: function (arg1, arg2, arg3) {
                assert.equal(arg1, 'firstParameter');
                assert.equal(arg2, 'secondParameter');
                assert.equal(arg3, 'thirdParameter');
                assert.equal(arguments.length, 3);
                return arg1 + arg2 + arg3;
            }
        };

        MicroGears.addService(service);

        test2 = function () {
            return MicroGears.testService.testFunction2('firstParameter', 'secondParameter', 'thirdParameter');
        };

        MicroGears.testService.testFunction1('firstParameter').then(test2).then(function () {
            done();
        });

    });

    it("should assure that service parameters are properly propagated when plugins are added ", function (done) {
        var test2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                assert.equal(arg1, 'firstParameter');
                return true;
            },
            testFunction2: function (arg1, arg2, arg3) {
                assert.equal(arg1, 'firstParameter');
                assert.equal(arg2, 'secondParameter');
                assert.equal(arg3, 'thirdParameter');
                assert.equal(arguments.length, 3);
                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args) {
                return args;
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            beforeChain: function filter(args) {
                return args;
            }
        };

        MicroGears.addPlugin(plugin2);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        test2 = function () {
            return MicroGears.testService.testFunction2('firstParameter', 'secondParameter', 'thirdParameter');
        };

        MicroGears.testService.testFunction1('firstParameter').then(test2).then(function (result) {
            done();
        });

    });

    it("should allow async plugins to be added ", function (done) {
        var test2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                assert.equal(arg1, 'firstParameter');
                return true;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args) {
                return BlueBirdPromise.method(function (arg) {
                    return arg;
                })(args);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            beforeChain: function filter(args) {
                return args;
            }
        };

        MicroGears.addPlugin(plugin2);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        test2 = function (result) {
            assert.ok(result);
            done();
        };

        MicroGears.testService.testFunction1('firstParameter').then(test2);

    });

    it("should allow exceptions to be thrown by the service and capture by the caller ", function (done) {
        var test2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                assert.equal(arg1, 'firstParameter');
                throw new Error('ERROR');

            }
        };
        var service2 = {
            name: 'testService2',
            namespace: "namespace2",
            testFunction1: function (arg1, arg2, arg3) {
                assert.equal(arg1, 'firstParameter');
                assert.equal(arg2, 'secondParameter');
                assert.equal(arg3, 'thirdParameter');
                assert.equal(arguments.length, 3);
                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args) {
                return args;
            }
        };

        var performancePlugin = {
            name: 'performancePlugin',
            beforeChain: function (args, _meta) {
                var hrstart, start, logPerformance = false, serviceName = this.microgears.serviceName, method = this.microgears.methodName;

                logPerformance = (this.microgears.serviceName === 'testService');
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

                return result;
            }
        };

        MicroGears.addPlugin(performancePlugin);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);
        MicroGears.addService(service2);

        test2 = function (result) {

            assert.ok(result);
            done();
        };

        MicroGears.testService2.testFunction1('firstParameter','secondParameter', 'thirdParameter')
            .then(function () {
                return MicroGears.testService.testFunction1('firstParameter');
            })
            .catch(test2);

    });

    it("should have the service meta information available in the plugin context", function (done) {
        var test2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction2: function (arg1, arg2, arg3) {

                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function filter(args, _meta) {

                assert.equal(_meta.serviceName, 'testService');
                assert.equal(_meta.serviceNameSpace, 'namespace');
                assert.equal(_meta.methodName, 'testFunction2');
                return (BlueBirdPromise.method(function (arg) {
                    return arg;
                })(args));
            }
        };

        var plugin2 = {
            name: 'testPlugin2',
            beforeChain: function filter(args, _meta) {

                assert.equal(_meta.serviceName, 'testService');
                assert.equal(_meta.serviceNameSpace, 'namespace');
                assert.equal(_meta.methodName, 'testFunction2');

                return (BlueBirdPromise.method(function (arg) {
                    return arg;
                })(args));
            }
        };

        var plugin3 = {
            name: 'testPlugin3',
            beforeChain: function filter(args) {

                return args;

            }
        };

        MicroGears.addPlugin(plugin3);
        MicroGears.addPlugin(plugin2);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        test2 = function (result) {

            assert.equal(result, 3);
            done();
        };

        MicroGears.testService.testFunction2(1, 1, 1).then(test2);

    });

    it("should intercept methods into prototype", function (done) {
        var test2;

        function Service() {
            this.name = 'testService';
            this.namespace = 'namespace';
        }

        Service.prototype.testFunction1 = function (arg1) {
            assert.equal(arg1, 'firstParameter');
            return true;
        };

        Service.prototype.testFunction2 = function (arg1, arg2, arg3) {
            assert.equal(arg1, 'firstParameter');
            assert.equal(arg2, 'secondParameter');
            assert.equal(arg3, 'thirdParameter');
            assert.equal(arguments.length, 3);
            return arg1 + arg2 + arg3;
        };

        MicroGears.addService(new Service());

        test2 = function () {
            return MicroGears.testService.testFunction2('firstParameter', 'secondParameter', 'thirdParameter');
        };

        MicroGears.testService.testFunction1('firstParameter').then(test2).then(function () {
            done();
        });

    });

    it("should have the service meta information available in the plugin context of a prototypal class", function (done) {
        var test2;

        function Service() {
            this.name = 'testService';
            this.namespace = 'namespace';
            this.async = false;
        }

        Service.prototype.testFunction1 = function (arg1) {
            return arg1;
        };

        Service.prototype.testFunction2 = function (arg1, arg2, arg3) {
            return BlueBirdPromise.resolve(arg1 + arg2 + arg3);
        };

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function filter(args, _meta) {

                assert.equal(_meta.serviceName, 'testService');
                assert.equal(_meta.serviceNameSpace, 'namespace');
                assert.ok(_meta.methodName);
                return args;
            }
        };

        MicroGears.addPlugin(plugin1);

        MicroGears.addService(new Service());

        test2 = function (result) {

            assert.equal(result, 3);
            done();
        };


        assert.equal(MicroGears.testService.testFunction1(1), 1);
        MicroGears.testService.testFunction2(1, 1, 1).then(test2);

    });

    it("should keep the instance of the object in 'this' use prototypal class", function (done) {
        var test2;

        function Service() {
            this.name = 'testService';
            this.namespace = 'namespace';
        }

        Service.prototype.plus1 = function () {
            return 1;
        };

        Service.prototype.callPlus1 = function () {
            return this.plus1().then(function (r) {
                return r + 1;
            });
        };

        MicroGears.addService(new Service());

        test2 = function (result) {

            assert.equal(result, 2);
            done();
        };

        MicroGears.testService.callPlus1().then(test2);

    });

    it("should keep the instance of the object in 'this' use literal object", function (done) {
        var test2;

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            plus1: function () {
                return 1;
            },
            callPlus1: function () {
                return this.plus1().then(function (r) {
                    return r + 1;
                });
            }
        });

        test2 = function (result) {

            assert.equal(result, 2);
            done();
        };

        MicroGears.testService.callPlus1().then(test2);

    });

    it("should not be a promise function", function (done) {

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: false,
            plus1: function (a) {
                assert.equal(a, '1');

                return a + 1;
            },
            callPlus1: function (a) {
                assert.equal(a, '1');

                return this.plus1(a);
            }
        });

        assert.equal(MicroGears.testService.callPlus1('1'), '11');
        done();

    });

    it("should be a promise function", function (done) {

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: true,
            plus1: function (a) {
                assert.equal(a, '1');

                return a + 1;
            },
            callPlus1: function (a) {
                assert.equal(a, '1');

                return this.plus1(a);
            }
        });

        MicroGears.testService.callPlus1('1')
            .then(function (a) {
                assert.equal(a, '11');
                done();
            });

    });

    it("should run and respect the chain order, but not be a promise", function (done) {

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function (args, _meta) {
                assert.ok(_meta.methodName);
                assert.equal(args[0], 'wtf');

                args[0] = args[0] + " weird";

                return args;
            },
            afterChain: function (result, _meta) {

                assert.ok(_meta.methodName === 'callPlus1');
                assert.ok(result === 'wtf weird stuff happens a lot');

                result = result + ' these days';

                return result;
            }
        };

        var plugin2 = {
            name: 'testPlugin2',
            beforeChain: function (args, _meta) {
                assert.ok(_meta.methodName);
                assert.equal(args[0], 'wtf weird');

                args[0] = args[0] + " stuff";

                return args;
            },
            afterChain: function (result, _meta) {

                assert.ok(_meta.methodName);
                assert.ok(result === 'wtf weird stuff happens');

                result = result + ' a lot';

                return result;
            }
        };

        MicroGears.addPlugin(plugin1);
        MicroGears.addPlugin(plugin2);

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: false,
            callPlus1: function (a) {
                assert.equal(a, 'wtf weird stuff');

                return a + ' happens';
            }
        });
        assert.equal(MicroGears.testService.callPlus1('wtf'), 'wtf weird stuff happens a lot these days');
        done();

    });

    it("should run and respect the chain order, but be a promise", function (done) {

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function (args, _meta) {
                assert.ok(_meta.methodName);
                assert.equal(args[0], 'wtf');

                args[0] = args[0] + " weird";

                return args;
            },
            afterChain: function (result, _meta) {

                assert.ok(_meta.methodName === 'callPlus1');
                assert.ok(result === 'wtf weird stuff happens a lot');

                result = result + ' these days';

                return result;
            }
        };

        var plugin2 = {
            name: 'testPlugin2',
            beforeChain: function (args, _meta) {
                assert.ok(_meta.methodName);
                assert.equal(args[0], 'wtf weird');

                args[0] = args[0] + " stuff";

                return args;
            },
            afterChain: function (result, _meta) {
                assert.ok(_meta.methodName);
                assert.ok(result === 'wtf weird stuff happens');

                result = result + ' a lot';

                return result;
            }
        };

        MicroGears.addPlugin(plugin1);
        MicroGears.addPlugin(plugin2);

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: true,
            callPlus1: function (a) {
                assert.equal(a, 'wtf weird stuff');

                return a + ' happens';
            }
        });

        MicroGears.testService.callPlus1('wtf')
            .then(function (a) {
                assert.equal(a, 'wtf weird stuff happens a lot these days');
                done();
            });

    });

    it("should share information between plugins by meta object argument", function (done) {
        var timeToPerform;

        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                assert.equal(arg1, 'firstParameter');

            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args) {
                return args;
            }
        };

        var performancePlugin = {
            name: 'performancePlugin',
            beforeChain: function (args, _meta) {
                var hrstart, start, logPerformance = false, serviceName = this.microgears.serviceName, method = this.microgears.methodName;

                hrstart = process.hrtime();
                start = new Date();

                _meta.statistcs = {
                    hrstart: hrstart,
                    start: start,
                    logPerformance: logPerformance
                };

                return args;

            },
            afterChain: function (result, _meta) {
                _meta.statistcs.end = new Date() - _meta.statistcs.start;
                _meta.statistcs.hrend = process.hrtime(_meta.statistcs.hrstart);
                timeToPerform = _meta.statistcs;

                return result;
            }
        };

        MicroGears.addPlugin(performancePlugin);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        MicroGears.testService.testFunction1('firstParameter').finally(function () {
            assert.ok(timeToPerform.hrend[1]);
            done();
        });

    });

    it("should have the service method result as a parameter to plugin's afterChain method when sync", function (done) {

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function (args, _meta) {

                return args;
            },
            afterChain: function (result, _meta) {

                assert.ok(typeof result === "number");

                return result;
            }
        };

        MicroGears.addPlugin(plugin1);

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: false,
            plus1: function (a) {

                return a + 1;
            },
            callPlus1: function (a) {

                return this.plus1(a);
            }
        });

        MicroGears.testService.callPlus1(1);
        done();

    });

    it("should have the service method result as a parameter to plugin's afterChain method when async", function (done) {

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function (args, _meta) {

                return args;
            },
            afterChain: function (result, _meta) {

                assert.ok(typeof result === "number");

                return result;
            }
        };

        MicroGears.addPlugin(plugin1);

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: true,
            plus1: function (a) {

                return a + 1;
            },
            callPlus1: function (a) {

                return this.plus1(a);
            }
        });

        MicroGears.testService.callPlus1(1).then(function (result) {
            assert.ok(result === 2);
            done();
        });

    });

    it("should work without messing up with the parameters", function (done) {

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function (args, _meta) {

                return args;
            },
            afterChain: function (result, _meta) {

                assert.ok(typeof result === "object");

                return result;
            }
        };

        MicroGears.addPlugin(plugin1);

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: true,
            callPlus1: function (a, b) {

                return [a[0] + 1, a[1] + 1, b[0] + 1, b[1] + 1];
            }
        });

        MicroGears.testService.callPlus1([1, 2, 3, 4], [1, 2, 3, 4]).then(function (result) {
            assert.ok(result[3] === 3 && result[0] === 2);
            done();
        });

    });

    it("when async false and function return a promise, execute afterChain when promise is done", function (done) {

        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function (args, _meta) {

                return args;
            },
            afterChain: function (result, _meta) {

                assert.equal(result, 45);

                return result;
            }
        };

        MicroGears.addPlugin(plugin1);

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: false,
            callPlus1: function () {

                return BlueBirdPromise.resolve(45);
            }
        });

        MicroGears.testService.callPlus1().then(function (result) {
            assert.equal(45, result);
            done();
        });

    });


    it('should not intercept convention private methods (start with underscore "_")', function (done) {
        var plugin1 = {
            name: 'testPlugin1',
            beforeChain: function (args, _meta) {

                return args[0] + 1;
            },
            afterChain: function (result, _meta) {

                return result + 1;
            }
        };

        MicroGears.addPlugin(plugin1);

        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            async: false,
            _callPlus1: function (val) {

                return val;
            }
        });

        var result = MicroGears.testService._callPlus1(1);
        assert.equal(1, result);
        done();
    });

    it("should continue the chain if method throw a exception", function (done) {
        var test2;
        var spy, spy2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                assert.equal(arg1, 'firstParameter');
                throw new Error('ERROR');

            },
            testFunction2: function (arg1, arg2, arg3) {
                assert.equal(arg1, 'firstParameter');
                assert.equal(arg2, 'secondParameter');
                assert.equal(arg3, 'thirdParameter');
                assert.equal(arguments.length, 3);
                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            beforeChain: function filter(args) {
                return args;
            },
            afterChain: function (result, _meta) {
                assert.instanceOf(_meta.error, Error);
                assert.isNull(result);

                return result;
            }
        };

        var performancePlugin = {
            name: 'performancePlugin',
            beforeChain: function (args, _meta) {
                var hrstart, start, logPerformance = false, serviceName = this.microgears.serviceName, method = this.microgears.methodName;

                logPerformance = (this.microgears.serviceName === 'testService');
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
                assert.instanceOf(_meta.error, Error);
                assert.isNull(result);

                return result;
            }
        };

        plugin1.afterChain = spy = sinon.spy(plugin1.afterChain);
        performancePlugin.afterChain = spy2 = sinon.spy(performancePlugin.afterChain);

        MicroGears.addPlugin(performancePlugin);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        test2 = function (result) {
            assert.ok(spy.calledOnce);
            assert.ok(spy2.calledOnce);

            assert.instanceOf(result, Error);
            done();
        };

        MicroGears.testService.testFunction1('firstParameter').catch(test2);

    });

});
