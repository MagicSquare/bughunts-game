'use strict';

module.exports = function (grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  var path = require('path');
  var appConfig = {
    app: path.resolve()
  };

  grunt.initConfig({

    //Project settings
    bughunts_challenge: appConfig,

    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
  });

  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('default', ['test']);

};