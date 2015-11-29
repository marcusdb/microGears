var MicroGears = require('../../src/index');

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

