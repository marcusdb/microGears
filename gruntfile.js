var grunt = require("grunt");


grunt.initConfig({
    env: {
        coverage: {
            APP_DIR_FOR_CODE_COVERAGE: '../test/coverage/instrument/app/'
        }
    },
    instrument: {
        files: 'app/*.js',
        options: {
            lazy: true,
            basePath: 'test/coverage/instrument/'
        }
    },
    storeCoverage: {
        options: {
            dir: 'test/coverage/reports'
        }
    },
    makeReport: {
        src: 'test/coverage/reports/**/*.json',
        options: {
            type: 'lcov',
            dir: 'test/coverage/reports',
            print: 'detail'
        }
    },
    jshint: {
        all: ['src/**/*.js', '*.js', 'spec/**/*.js'],
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
grunt.loadNpmTasks('grunt-istanbul');
grunt.loadNpmTasks('grunt-mocha-test');
grunt.loadNpmTasks('grunt-contrib-jshint');

// Default task.

grunt.registerTask('coverage', ['env:coverage', 'instrument', 'mochaTest',
    'storeCoverage', 'makeReport']);

grunt.registerTask('test', ['jshint:all','mochaTest']);