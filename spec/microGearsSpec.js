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
            filter: function filter(chain, arg1, arg2) {
                return chain(arg1, arg2);
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
            filter: function filter(chain, arg1, arg2) {
                return chain(arg1, arg2);
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
            testFunction1: function () {
                return true;
            },
            testFunction2: function (arg1, arg2) {
                return arg1 + arg2;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1, arg2) {
                expect(chain).to.be.a('function');
                return chain(arg1, arg2);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            filter: function filter(chain, arg1, arg2) {
                expect(chain).to.be.a('function');
                return chain(arg1, arg2);
            }
        };
        var spy = sinon.spy(plugin1.filter);
        var spy2 = sinon.spy(plugin2.filter);

        plugin1.filter = spy;
        plugin2.filter = spy2;
        MicroGears.addPlugin(plugin1);
        MicroGears.addPlugin(plugin2);

        MicroGears.addService(service);

        var thenTest = function () {

            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);
            expect(spy2.calledOnce).to.be.true;
            expect(spy2.callCount).to.equal(1);
        };
        var catchTest = function (arg) {
            expect(arg).to.be.undefined;
        };
        MicroGears.testService.testFunction1({name: 'a'}, {}).then(thenTest).catch(catchTest).finally(done);

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
            filter: function filter(chain, arg1, arg2) {
                return chain(arg1, arg2);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            filter: function filter(chain, arg1, arg2) {
                return chain(arg1, arg2);
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
                console.log(arguments);
                expect(arg1).to.equal('firstParameter');
                expect(arg2).to.equal('secondParameter');
                expect(arg3).to.equal('thirdParameter');
                expect(arguments.length).to.equal(3);
                return arg1 + arg2 + arg3;
            }
        };

        var plugin1 = {
            name: 'testPlugin',
            filter: function filter(chain, arg1, arg2) {
                return chain(arg1, arg2);
            }
        };
        var plugin2 = {
            name: 'testPlugin2',
            filter: function filter(chain, arg1, arg2, arg3) {
                return chain(arg1, arg2, arg3);
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

});





