'use strict';

var scssSrc = "src/scss";
var cssDest = "dist/css";
var jsSrc = "src/js";
var jsDest = "dist/js";

module.exports = function (grunt) {
  pkg: grunt.file.readJSON('package.json'),
      // Project configuration.
      grunt.initConfig({
        clean: {
          css: [cssDest + '/*.css'],
          js: [jsDest + '/app.js']
        },
        concat: {
          options: {
            seperator: ';'
          },
          js: {
            src: [jsSrc + '/**/*.js'],
            dest: jsDest + '/app.js'
          },
          'css-constant': {
            src: [scssSrc + '/_constants.scss'],
            dest: jsDest + '/constantsForJs.css'
          }
        },
        compass: {// Task
          dev: {
            options: {
              sassDir: scssSrc,
              cssDir: cssDest
            }
          }
        },
        watch: {
          default: {
            files: ['src/scss/*.scss', 'src/js/*.js', 'src/js/components/*.js'],
            tasks: ['clean', 'concat:js', 'concat:css-constant', 'compass'],
            options: {
              livereload: true
            }
          }
        }
      });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'concat:js', 'concat:css-constant', 'compass']);
};
