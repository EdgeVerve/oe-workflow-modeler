/**
 *
 * ©2017-2018 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */

'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  var path = require('path');

  /**
   * Resolve external project resource as file path
   */
  function resolvePath(project, file) {
    return path.join(path.dirname(require.resolve(project)), file);
  }
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: {
      sources: 'app',
      dist: 'dist'
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          list: true,
          // make sure we do not include browser shims unnecessarily
          insertGlobalVars: {
            process: function () {
              return 'undefined';
            },
            Buffer: function () {
              return 'undefined';
            }
          }
        },
        transform: ['brfs']
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/index.js': ['<%= config.sources %>/**/*.js']
        }
      },
      app: {
        files: {
          '<%= config.dist %>/index.js': ['<%= config.sources %>/**/*.js']
        }
      }
    },

    copy: {
      diagram_js: {
        files: [{
          src: resolvePath('diagram-js', 'assets/diagram-js.css'),
          dest: '<%= config.dist %>/css/diagram-js.css'
        }]
      },
      bpmn_js: {
        files: [{
          expand: true,
          cwd: resolvePath('bpmn-js', 'assets'),
          src: ['**/*.*', '!**/*.js'],
          dest: '<%= config.dist %>/vendor'
        }]
      },
      app: {
        files: [{
          expand: true,
          cwd: '<%= config.sources %>/',
          src: ['**/*.*', '!**/*.js'],
          dest: '<%= config.dist %>'
        }]
      }
    },

    less: {
      options: {
        dumpLineNumbers: 'comments',
        paths: [
          'node_modules'
        ]
      },

      styles: {
        files: {
          'dist/css/app.css': 'app/app.css'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },

      samples: {
        files: ['<%= config.sources %>/**/*.*'],
        tasks: ['copy:app']
      },

      less: {
        files: [
          'styles/**/*.less',
          'node_modules/oe-workflow-properties-panel/styles/**/*.less'
        ],
        tasks: [
          'less'
        ]
      }
    },

    connect: {
      livereload: {
        options: {
          port: 9013,
          livereload: true,
          hostname: '0.0.0.0',
          open: true,
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    },
    uglify: {
      options: {
        // mangle: true,
        sourceMap: true,
        mangle: {
          reserved: ['main', 'opendiagram', 'currentFileName']
        },
      },
      target: {
        files: {
          'dist/workflow.min.js': ['dist/index.js']
        }
      }
    }
  });

  // tasks,'less',

  grunt.registerTask('build', ['copy', 'browserify:app', 'uglify']);
  grunt.registerTask('minify', ['uglify']);
  grunt.registerTask('auto-build', [
    'copy',

    'browserify:watch',
    'uglify',
    'connect:livereload',
    'watch'
  ]);
  grunt.registerTask('dist', ['copy',
    'build', 'uglify'
  ]);
  grunt.registerTask('serve', [
    'browserify:watch',
    'connect:livereload',
    'watch'
  ]);
  //'jshint',
  grunt.registerTask('default', ['build']);
};