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
        },
        copy: {
          web: {
            files: [
              {
                src: 'dist/datetime-picker.js',
                dest: 'web/'
              }
            ]
          }
        },
        wiredep: {
          web: {
            src: 'web/index.html'
          }
        },
        connect: {
          options: {
            port: 4000,
            livereload: 4545,
            keepalive: false
          },
          web: {
            options: {
              open: true,
              middleware: function() {
                var serveStatic = require('./node_modules/grunt-contrib-connect/node_modules/serve-static');
                return [
                  serveStatic('web')
                ];
              }
            }
          }
        },
        watch: {
          web: {
            files: ['web/index.html', 'web/main.js', 'web/dist/datetime-picker.js'],
            options: {
              livereload: '<%= connect.options.livereload %>'
            }
          },
          lib: {
            files: 'datetime-picker',
            tasks: ['default', 'copy']
          }
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task
    grunt.registerTask('default', ['ngtemplates', 'concat', 'uglify']);
    grunt.registerTask('web', ['default', 'wiredep', 'copy', 'connect', 'watch'])
};
