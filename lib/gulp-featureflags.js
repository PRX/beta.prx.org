var gutil   = require('gulp-util');
var through = require('through2');
var fs      = require('fs');

function doReplace(string, exp, flags, opts) {
  var newStr = string.replace(exp, function (s, b, feat) {
    if (feat == 'JSON') {
      return b + JSON.stringify(flags);
    } else if (typeof flags[feat] !== 'undefined') {
      return b + JSON.stringify(flags[feat]);
    } else if (opts.strict) {
      throw new Error('undefined feature flag ' + feat);
    } else if (typeof opts.default !== 'undefined') {
      return b + JSON.stringify(opts.default);
    } else {
      return s;
    }
  });
  return [newStr !== string, newStr];
}

module.exports = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  var opts = args.shift() || {};
  var flagFile = opts['file'];
  if (opts.constructor == String) {
    flagFile = opts;
    opts = args.shift() || {};
  }

  if (typeof opts.strict === 'undefined') {
    opts.strict = true;
  }

  opts.global = opts.global || 'FEAT';

  if (typeof flagFile == 'undefined') {
    throw new gutil.PluginError('gulp-featureflags', 'Features JSON file option required.');
  }

  var exp = new RegExp('([^\\w])' + opts.global + '\\.([\\w_0-9]+)', 'g');
  var flags = JSON.parse(fs.readFileSync(flagFile));
  var mtime = fs.statSync(flagFile).mtime;

  return through.obj(function (file, enc, next) {
    var cstat = fs.statSync(flagFile).mtime;
    if (cstat > mtime) {
      mtime = cstat;
      flags = JSON.parse(fs.readFileSync(flagFile));
    }

    Object.keys(flags).forEach(function (key) {
      if (typeof process.env[key] !== 'undefined') {
        try {
          flags[key] = JSON.parse(process.env[key])
        } catch(e) {
          flags[key] = process.env[key]
        }
      }
    });

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-featureflags', 'streams not supported'));
    }

    if(file.isBuffer()){
      try {
        var result = doReplace(String(file.contents), exp, flags, opts);
        if (result[0]) {
          file.contents = new Buffer(result[1]);
          file.stat.mtime = Math.max(mtime, file.stat.mtime);
        }
      } catch(e) {
        this.emit('error', new Error(e));
      }
    }

    this.push(file);
    return next();
  });
}
