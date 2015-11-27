var MicroGears=require('../src/index');

var service = {
    name: 'testService', path: "path",
    testFunction1: function (arg1, arg2) {
        console.log(this.name);
        return true;
    },
    testFunction2: function (arg1, arg2) {
        return arg1 + arg2;
    },
};

var plugin1 = function (chain, arg1, arg2) {
    console.log(this.name);
    var result = chain(arg1, arg2);

    return result;
};

var plugin2 = function (chain, arg1, arg2) {
    console.log(this.name);
    var result = chain(arg1, arg2);

    return result;
};

MicroGears.addPlugin(plugin1, 'test plugin');
MicroGears.addPlugin(plugin2, 'test plugin2');

MicroGears.addService(service);
var plugin = function (chain, service, arg1, arg2) {
    return chain(arg1, arg2);
}


MicroGears.testService.testFunction1({name: 'a'}, {});