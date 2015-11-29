var MicroGears = require('../../src/index');

var performancePlugin = {
    name: 'performancePlugin',
    filter: function (next, args) {
        var result, hrstart, end, hrend, start;
        hrstart = process.hrtime();
        start = new Date();
        result = next(args);
        end = new Date() - start,
            hrend = process.hrtime(hrstart);

        console.info('Service:' + this.serviceName + ' Method:' + this.methodName + "Execution time: %dms", end);
        console.info('Service:' + this.serviceName + ' Method:' + this.methodName + "Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
        return result;

    }
};

MicroGears.addPlugin(performancePlugin);