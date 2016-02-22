var karma = require('karma');
var gutil = require('gulp-util');

/**
 * Run jasmine specs via karma
 */
module.exports = function (gulp) {

  return function (done) {

    // karma exit codes don't work with gulp
    function handleKarmaExit(exitStatus) {
      if (exitStatus) {
        var err = new Error('Karma run failed with status ' + exitStatus);
        err.showStack = false;
        done(err);
      }
      else {
        done();
        // TODO: the text-summary reporter seems to hang here!
        process.nextTick(function() {
          process.exit(0);
        })
      }
    }

    new karma.Server({
      singleRun: true,
      configFile: __dirname + '/../config/karma.conf.js'
    }, handleKarmaExit).start();

  };

};
