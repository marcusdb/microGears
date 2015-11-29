var grunt = require("grunt");

grunt.initConfig({
    jshint: {
        all: ['src/**/*.js', '*.js', 'spec/**/*.js'],
        options: {
            undef: true,
            node: true,
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
    mochaTest: {
        test: {
            options: {
                reporter: 'spec',
                captureFile: 'results.txt', // Optionally capture the reporter output to a file
                quiet: false, // Optionally suppress output to standard out (defaults to false)
                clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
            },
            src: ['spec/**/*.js']
        }
    }
});

// Register tasks.

grunt.loadNpmTasks('grunt-mocha-test');
grunt.loadNpmTasks('grunt-contrib-jshint');

grunt.registerTask('test', ['jshint:all', 'mochaTest']);