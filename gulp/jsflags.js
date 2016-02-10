var browserify = require('browserify');
var vsource    = require('vinyl-source-stream');
var Readable   = require('stream').Readable;

/**
 * Bundle the flags into window.globals
 */
module.exports = function (gulp, config) {
  var flags;
  switch (process.env.NODE_ENV) {
    case 'production':
    case 'release':
      flags = require('../config/flags.release.json');
      break;
    case 'staging':
      flags = require('../config/flags.staging.json');
    default:
      flags = require('../config/flags.dev.json');
      break;
  }

  // merge in ENV
  Object.keys(flags).forEach(function (key) {
    if (typeof process.env[key] !== 'undefined') {
      flags[key] = process.env[key];
    }
  });

  var flagStream = new Readable();
  flagStream._read = function noop() {};
  flagStream.push('window.FEAT = ' + JSON.stringify(flags, null, 2) + ';');
  flagStream.push(null);

  return function () {
    return flagStream
      .pipe(vsource('flags.js'))
      .pipe(gulp.dest(config.buildDir + '/assets'));
  };

};
