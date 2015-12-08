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
      namespace: 'namespace',
      testFunction1: function (arg1, arg2) {
        return 'args: 1:' + arg1 + ' 2:' + arg2;
      },
      testFunction2: function (arg1, arg2) {
        return arg1 + arg2;
      }

    });

    assert.ok(MicroGears.testService, "testService exists");
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

    assert.ok(MicroGears.testService.testFunction1, 'testFunction1 on testService exists');
    assert.isFunction(MicroGears.testService.testFunction1, 'testFunction1 on testService is a function');
  });

  it("should be able to call a method in the new service", function () {
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

    assert.ok(MicroGears.testService.testFunction1('a', 'b'), 'MicroGears.testService.testFunction1 returns correct value');
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

    assert.instanceOf(MicroGears.testService.testFunction1('a', 'b'), BlueBirdPromise, 'promise instance of Bluebird');
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
      assert.ok(arg);
    };
    var catchTest = function (arg) {
      assert.ok(arg);
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
      assert.ok(arg);
    };
    var catchTest = function (arg) {
      assert.ok(arg);
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
      assert.ok(spy.calledOnce);
      assert.equal(spy.callCount, 1);
    };
    var catchTest = function (arg) {
      assert.ok(arg);
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

      assert.ok(spy.calledOnce);
      assert.equal(spy.callCount, 1);
    };
    var catchTest = function (arg) {
      assert.isUndefined(arg);
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
        assert.isFunction(chain);
        return chain(arg1);
      }
    };
    var plugin2 = {
      name: 'testPlugin2',
      filter: function filter(chain, arg1) {
        assert.isFunction(chain);
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
      assert.equal(result, 'a');
      assert.ok(spy.calledOnce);
      assert.equal(spy.callCount, 1);
      assert.ok(spy2.calledOnce);
      assert.equal(spy2.callCount, 1);
    };
    var catchTest = function (arg) {
      assert.isUndefined(arg);
    };
    MicroGears.testService.testFunction1('a').then(thenTest).catch(catchTest).finally(done);

  });

  it("should assure that the context of all plugin and service function calls is the service context ", function (done) {
    var service = {
      name: 'testService',
      namespace: "namespace",
      testFunction1: function () {
        assert.equal(this.serviceName, 'testService');
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
        throw 'ERROR';

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
          }
        });

      }
    };

    MicroGears.addPlugin(performancePlugin);
    MicroGears.addPlugin(plugin1);

    MicroGears.addService(service);

    test2 = function (result) {

      assert.ok(result);
      done();
    };

    MicroGears.testService.testFunction1('firstParameter').catch(test2);

  });

});