var grunt = require("grunt");


grunt.initConfig({
    jshint: {
        all: ['src/**/*.js', '*.js', 'test/**/*.js'],
        options: {
            undef: true,
            node:true,
            globals: {
                require: true,
                module: true,
                setTimeout: true,
                __dirname: true,
                process: true,
                setInterval: true,
                /* MOCHA */
                it: true,
                describe: true,
                before: true,
                beforeEach: true,
                after: true,
                afterEach: true
            }
        }
    },
    jasmine_node: {
        options: {
            forceExit: true,
            matchall: false,
            extensions: 'js',
            verbose: true,
            growl: true
        },
        all: []
    }
});

// Register tasks.

grunt.loadNpmTasks('grunt-jasmine-node');

grunt.loadNpmTasks('grunt-contrib-jshint');

// Default task.
grunt.registerTask('default', ['jshint:all','jasmine_node']);

grunt.registerTask('test', ['jshint:all','jasmine_node']);