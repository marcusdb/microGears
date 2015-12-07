/* global describe, it, before, beforeEach, after, afterEach, require */
/* jshint mocha:true, nonew:true, curly:true, noarg:true, forin:true, noempty:true, node:true, eqeqeq:true, strict:true, undef:true, expr:true, bitwise:true, -W030 */

"use strict";
var MicroGears = require('../src/index');
var BlueBirdPromise = require('bluebird');
var sinon = require('sinon');
var expect = require('chai').expect;

describe("MicroGears ", function () {

    beforeEach(function () {
        MicroGears.resetMicroGears();
    });

    it("should be able to add a new service", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: 'namespace',
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }

        });

        expect(MicroGears.testService).to.not.be.undefined;
    });
    it("should be able to find a method in the new service", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }

        });

        expect(MicroGears.testService.testFunction1).to.not.be.undefined;
        expect(MicroGears.testService.testFunction1).to.be.a('function');
    });
    it("should be able to call a method in the new service !", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }

        });
        expect(MicroGears.testService.testFunction1('a', 'b')).to.not.be.undefined;
    });
    it("should return a promise for all service method calls", function () {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1, arg2) {
                return 'args: 1:' + arg1 + ' 2:' + arg2;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }

        });
        expect(MicroGears.testService.testFunction1('a', 'b') instanceof BlueBirdPromise).to.not.be.undefined;
    });
    it("should assure parameters are immutable", function (done) {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                arg1.name = 'dddd';
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }

        });
        var thenTest = function (arg) {
            expect(arg).to.be.undefined;
        };
        var catchTest = function (arg) {
            expect(arg).to.not.be.undefined;
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(catchTest).finally(done);

    });

    it("should allow plugins to be added ", function (done) {
        MicroGears.addService({
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }

        });
        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1, arg2) {
                return chain(arg1, arg2);
            }
        };
        MicroGears.addPlugin(plugin1);
        var thenTest = function (arg) {
            expect(arg).to.not.be.undefined;
        };
        var catchTest = function (arg) {
            expect(arg).to.be.undefined;
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(catchTest).finally(done);

    });

    it("should assure plugins are going to be called on service function call ", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }

        };
        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1) {
                return chain(arg1);
            }
        };
        var spy = sinon.spy(plugin1.filter);
        plugin1.filter = spy;

        MicroGears.addService(service);

        MicroGears.addPlugin(plugin1);

        var thenTest = function () {
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);
        };
        var catchTest = function (arg) {
            expect(arg).to.be.undefined;
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(catchTest).finally(done);

    });

    it("should assure that service function call is going to be called on a multiple plugin environment", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1) {
                return chain(arg1);
            }
        };
        MicroGears.addPlugin(plugin1);
        var spy = sinon.spy(service.testFunction1);
        service.testFunction1 = spy;

        MicroGears.addService(service);

        var thenTest = function () {

            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);
        };
        var catchTest = function (arg) {
            expect(arg).to.be.undefined;
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(catchTest).finally(done);

    });

    it("should assure that service function call is chainable through plugins ", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg) {
                return arg;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1) {
                expect(chain).to.be.a('function');
                return chain(arg1);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            filter: function filter(chain, arg1) {
                expect(chain).to.be.a('function');
                return chain(arg1);
            }
        };
        var spy = sinon.spy(plugin1.filter);
        var spy2 = sinon.spy(plugin2.filter);

        plugin1.filter = spy;
        plugin2.filter = spy2;
        MicroGears.addPlugin(plugin1);
        MicroGears.addPlugin(plugin2);

        MicroGears.addService(service);

        var thenTest = function (result) {
            expect(result).to.equal('a');
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);
            expect(spy2.calledOnce).to.be.true;
            expect(spy2.callCount).to.equal(1);
        };
        var catchTest = function (arg) {
            expect(arg).to.be.undefined;
        };
        MicroGears.testService.testFunction1('a').then(thenTest).catch(catchTest).finally(done);

    });
    it("should assure that the context of all plugin and service function calls is the service context ", function (done) {
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function () {
                expect(this.serviceName).to.equal('testService');
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1) {
                return chain(arg1);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            filter: function filter(chain, arg1) {
                return chain(arg1);
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
                expect(arg1).to.equal('firstParameter');
                return true;
            },
            testFunction2: function (arg1, arg2, arg3) {
                expect(arg1).to.equal('firstParameter');
                expect(arg2).to.equal('secondParameter');
                expect(arg3).to.equal('thirdParameter');
                expect(arguments.length).to.equal(3);
                return arg1 + arg2 + arg3;
            }
        };

        MicroGears.addService(service);

        test2 = function () {
            MicroGears.testService.testFunction2('firstParameter', 'secondParameter', 'thirdParameter').finally(done);
        };

        MicroGears.testService.testFunction1('firstParameter').then(test2);

    });

    it("should assure that service parameters are properly propagated when plugins are added ", function (done) {
        var test2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                expect(arg1).to.equal('firstParameter');
                return true;
            },
            testFunction2: function (arg1, arg2, arg3) {
                expect(arg1).to.equal('firstParameter');
                expect(arg2).to.equal('secondParameter');
                expect(arg3).to.equal('thirdParameter');
                expect(arguments.length).to.equal(3);
                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1) {
                return chain(arg1);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            filter: function filter(chain, arg1) {
                return chain(arg1);
            }
        };

        MicroGears.addPlugin(plugin2);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        test2 = function () {
            MicroGears.testService.testFunction2('firstParameter', 'secondParameter', 'thirdParameter').finally(done);
        };

        MicroGears.testService.testFunction1('firstParameter').then(test2);

    });

    it("should allow async plugins to be added ", function (done) {
        var test2;
        var service = {
            name: 'testService',
            namespace: "namespace",
            testFunction1: function (arg1) {
                expect(arg1).to.equal('firstParameter');
                return true;
            },
            testFunction2: function (arg1, arg2, arg3) {
                expect(arg1).to.equal('firstParameter');
                expect(arg2).to.equal('secondParameter');
                expect(arg3).to.equal('thirdParameter');
                expect(arguments.length).to.equal(3);
                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1) {
                return BlueBirdPromise.method(function (arg) {
                    return chain(arg);
                })(arg1);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            filter: function filter(chain, arg1) {
                return chain(arg1);
            }
        };

        MicroGears.addPlugin(plugin2);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        test2 = function (result) {
            expect(result).to.equal(true);
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
                expect(arg1).to.equal('firstParameter');
                throw 'ERROR';

            },
            testFunction2: function (arg1, arg2, arg3) {
                expect(arg1).to.equal('firstParameter');
                expect(arg2).to.equal('secondParameter');
                expect(arg3).to.equal('thirdParameter');
                expect(arguments.length).to.equal(3);
                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1) {
                return (BlueBirdPromise.method(function (arg) {
                    return chain(arg);
                })(arg1));
            }
        };

        var performancePlugin = {
            name: 'performancePlugin',
            filter: function (next, args) {
                var hrstart, end, hrend, start, logPerformance = false, serviceName = this.serviceName, method = this.methodName;
                logPerformance = (this.serviceName === 'testService');
                if (logPerformance) {
                    hrstart = process.hrtime();
                    start = new Date();
                }
                return next(args).finally(function () {
                    if (logPerformance) {
                        end = new Date() - start;
                        hrend = process.hrtime(hrstart);
                        //console.log('Service:' + serviceName+ ' Method:' + method + "Execution time: %dms", end);
                        //console.log('Service:' + serviceName+ ' Method:' + method + "Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
                    }
                });

            }
        };

        MicroGears.addPlugin(performancePlugin);
        MicroGears.addPlugin(plugin1);

        MicroGears.addService(service);

        test2 = function (result) {

            expect(result).to.not.be.undefined;
            done();
        };

        MicroGears.testService.testFunction1('firstParameter').catch(test2);

    });

});





