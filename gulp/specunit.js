var karma = require('karma');
var gutil = require('gulp-util');
var flags = require('../config/flags.conf.js');
var fs    = require('fs');

/**
 * Run jasmine specs via karma
 */
module.exports = function (gulp) {

  return function (done) {
    var tmpFlags = __dirname + '/../build/flags.test.js';

    // HACKY: we need an actual static flags file to run the tests
    fs.writeFileSync(tmpFlags, flags.toBrowser());

    // karma exit codes don't work with gulp
    function handleKarmaExit(exitStatus) {
      fs.unlinkSync(tmpFlags);
      if (exitStatus) {
        var err = new Error('Karma run failed with status ' + exitStatus);
        err.showStack = false;
        done(err);
      }
      else {
        done();
        // TODO: the text-summary reporter seems to hang here!
        if (!gulp.tasks['spec'].running) {
          process.nextTick(function() {
            process.exit(0);
          });
        }
      }
    }

    new karma.Server({
      singleRun: true,
      configFile: __dirname + '/../config/karma.conf.js'
    }, handleKarmaExit).start();

  };

};
