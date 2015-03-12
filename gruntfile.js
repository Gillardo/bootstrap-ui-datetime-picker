/// <vs AfterBuild='default' />
module.exports = function (grunt) {
    'use strict';
    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        ngtemplates: {
            app: {
                src: [
                    'template/*.html',
                ],
                dest: 'dist/datetime-picker.tpls.js',
                options: {
                    module: 'ui.bootstrap.datetimepicker',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true, // Only if you don't use comment directives!
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                }
            }
        },
        concat: {
            options: {
                banner: '// <%= pkg.url %>\n// Version: <%= pkg.version %>\n// Released: <%= grunt.template.today("yyyy-mm-dd") %> \n'
            },
            app: {
                src: [
                    'datetime-picker.js',
                    '<%= ngtemplates.app.dest %>'
                ],
                dest: 'dist/datetime-picker.js'
            }
        },
        uglify: {
            options: {
                banner: '// <%= pkg.url %>\n// Version: <%= pkg.version %>\n// Released: <%= grunt.template.today("yyyy-mm-dd") %> \n'
            },
            app: {
                src: 'dist/datetime-picker.js',
                dest: 'dist/datetime-picker.min.js'
            }
        }

    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Default task
    grunt.registerTask('default', ['ngtemplates', 'concat', 'uglify']);
};