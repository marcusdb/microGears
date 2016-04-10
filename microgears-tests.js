/// <reference path="microgears.d.ts" />
function verify_module_file() {
    var tracePlugin = new TracePlugin();
    microgears.addPlugin(tracePlugin);
    var service = new UserService();
    var userService = microgears.addService(service);
}
var TracePlugin = (function () {
    function TracePlugin() {
    }
    TracePlugin.prototype.beforeChain = function (args, _meta) {
        var serviceName = _meta.serviceName, method = _meta.methodName;
        console.log('before call-> ' + serviceName + '.' + method);
        _meta.extra = {
            count: 1
        };
        return args;
    };
    TracePlugin.prototype.afterChain = function (result, _meta) {
        var serviceName = _meta.serviceName, method = _meta.methodName;
        console.log('after of-> ' + serviceName + '.' + method);
        if (_meta.extra.count) {
            console.log('this number comes to the beforeChain: ' + _meta.extra.count);
        }
        return result;
    };
    return TracePlugin;
}());
var User = (function () {
    function User(name, email) {
        this.email = email;
        this.name = name;
    }
    return User;
}());
var UserService = (function () {
    function UserService() {
        this.name = "userService";
        this.namespace = "services.user";
    }
    UserService.prototype.findUserById = function (id) {
        return new User('test', 'test@example.com');
    };
    return UserService;
}());
