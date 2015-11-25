var grunt = require("grunt");


grunt.initConfig({
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

grunt.loadNpmTasks('grunt-jasmine-node')

// Default task.
grunt.registerTask('default', 'jasmine_node');