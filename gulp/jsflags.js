var browserify = require('browserify');
var vsource    = require('vinyl-source-stream');
var Readable   = require('stream').Readable;
var fs         = require('fs');

/**
 * Bundle the flags into window.globals
 */
module.exports = function (gulp) {
  var flagFile, flags;
  switch (process.env.NODE_ENV) {
    case 'production':
    case 'release':
      flagFile = 'config/flags.release.json';
      break;
    case 'staging':
      flagFile = 'config/flags.staging.json';
    case 'test':
      flagFile = 'config/flags.test.json';
    default:
      flagFile = 'config/flags.dev.json';
      break;
  }
  flags = require('../' + flagFile);

  // merge in ENV
  Object.keys(flags).forEach(function (key) {
    if (typeof process.env[key] !== 'undefined') {
      flags[key] = process.env[key];
    }
  });

  var newString = '// loaded from ' + flagFile + '\n';
  newString += 'window.FEAT = ' + JSON.stringify(flags, null, 2) + ';'
  var flagStream = new Readable();
  flagStream._read = function noop() {};
  flagStream.push(newString);
  flagStream.push(null);

  return function () {
    try {
      var oldString = fs.readFileSync(__dirname + '/../build/assets/flags.js');
      if (oldString == newString) {
        return; // nothing has changed
      }
    }
    catch(e) {}

    return flagStream
      .pipe(vsource('flags.js'))
      .pipe(gulp.dest('build/assets'));
  };

};
