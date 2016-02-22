var through = require('through2');
var fs      = require('fs');

/**
 * Helper to read feature flags from the global browser "window"
 */
var gotFlags;
exports.get = function readFlagFile() {
  if (!gotFlags) {
    global.window = {};
    require('../build/assets/flags.js');
    gotFlags = global.window.FEAT;
    delete global.window;
  }
  return gotFlags;
}

/**
 * Gulp helper to find-and-replace feature flags
 */
exports.replace = function replaceFeats() {
  var flagFile  = __dirname + '/../build/assets/flags.js';
  var flagMtime = fs.statSync(flagFile).mtime;
  var flagExp   = /([^\w])FEAT([^\w])([\w_0-9]*)/g;

  // read flags from current file sitting in build directory
  var flags = exports.get();

  // regexp replace FEATs
  function replaceFeats(file, enc, next) {
    var oldStr = String(file.contents);
    var newStr = oldStr.replace(flagExp, function (match, before, after, feat) {
      if (feat && after === '.') {
        if (typeof flags[feat] !== 'undefined') {
          // console.log('matched: ' + match + '    -->   ' + before + JSON.stringify(flags[feat]));
          return before + JSON.stringify(flags[feat]);
        }
        else {
          throw new Error('Undefined feature flag ' + feat);
        }
      }
      else if (!feat) {
        // console.log('matched: ' + match + '    -->   ' + before + JSON.stringify(flags) + after);
        return before + JSON.stringify(flags) + after; // all the flags
      }
      else {
        throw new Error('Invalid FEAT expression: ' + match);
      }
    });
    if (newStr !== oldStr) {
      file.contents = new Buffer(newStr);
      file.stat.mtime = Math.max(flagMtime, file.stat.mtime);
    }

    this.push(file);
    return next();
  }

  return through.obj(replaceFeats);
}
