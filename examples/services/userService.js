var MicroGears=require('../../src/index');

var userService = {
    name: 'UserService', path: "services.userservice",
    findUserById: function (arg1, arg2) {
        console.log(this.name);
        return true;
    },
    testFunction2: function (arg1, arg2) {
        return arg1 + arg2;
    },
};

MicroGears.addService(userService);