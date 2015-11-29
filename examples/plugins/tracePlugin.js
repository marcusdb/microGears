
var MicroGears = require('../../src/index');

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

