var c   = require( './config/build.json' );
var pkg = require('./package.json');

var spawn  = require('child_process').spawn;
var fs     = require('fs');

var server;

var plugin = require('gulp-load-plugins')();
var instWd = plugin.protractor.webdriver_update;
var prtrct = plugin.protractor.protractor;
var Server = require('karma').Server;

var gulp   = require('gulp');
var es     = require('event-stream');
var through= require('through2');
var walk   = require('walk');
var runSeq = require('run-sequence').use(gulp);
var tinyLr = require('tiny-lr');
var path   = require('path');
var map    = require('vinyl-map');
var istnbl = require('gulp-istanbul-enforcer');
var moveMe = require('rework-move-media');
var jshint = require('jshint').JSHINT;
var Notify = require('node-notifier');

var feats  = require('./lib/gulp-featureflags');
var pngcsh = require('imagemin-pngcrush');
var pngqnt = require('imagemin-pngquant');

var buildDir = c.buildDir;
var complDir = c.compileDir;
var cwd      = __dirname;
var src      = cwd + '/src';
var hintCfg  = c.jsHintCfg;
var fileName = pkg.name + "-" + pkg.version;
var vCopyJs  = c.vendor.copyJs;
var vCopyJsNames = vCopyJs.map( function(path){ return path.split('/').pop(); });
var vBuildJs = c.vendor.buildJs.concat(c.vendor.js).concat(vCopyJs);
var vComplJs = c.vendor.compileJs.concat(c.vendor.js);
var allAppJs = c.app.js.concat(vBuildJs);
var karmaCfg = cwd + '/config/karma.conf.js';
var featsDev = cwd + '/config/flags.dev.json';
var featDist = cwd + '/config/flags.release.json';

var notifier = new Notify({});

// Fix formatting of error messages with newlines
// so that the whole message starts on its own line.
(function () {
  var listeners = gulp.listeners('task_err');
  gulp.removeAllListeners('task_err');

  function formatMultiline(message) {
    if (message.indexOf("\n") !== -1) {
      return ("\n"+message).replace(/\n(?:error[^\s]*\s*)?/ig, "\n   [" + plugin.util.colors.red('error') + "] ");
    } else {
      return message;
    }
  }

  gulp.on('task_err', function (e) {
    if (e.err && e.err.message) {
      e.err.message = formatMultiline(e.err.message);
    } else if (e.message) {
      e.message = formatMultiline(e.message);
    }
  });

  listeners.forEach(function (listener) {
    gulp.on('task_err', listener);
  });
})();

gulp.task('clean', function () {
  return gulp.src([buildDir, complDir, 'coverage'], {read: false})
    .pipe(plugin.clean());
});


/** Static Assets **/

gulp.task('buildAssets', ['compressAssets'], function () {
  return gulp.src('.cache/assets/**/*')
    .pipe(gulp.dest(buildDir));
});

gulp.task('compileAssets', ['compressAssets'], function () {
  return gulp.src('.cache/assets/**/*')
    .pipe(gulp.dest(complDir));
});

gulp.task('compressAssets', function () {
  return es.merge(
      gulp.src(c.app.assets, {base: src}),
      gulp.src(c.vendor.assets, {base: cwd})
    )
    .pipe(plugin.newer('.cache/assets'))
    .pipe(pngcsh({reduce: true}))
    .pipe(pngqnt())
    .pipe(plugin.imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('.cache/assets'));
});

/** Stylesheets **/

gulp.task('stylus', function () {
  return gulp.src(c.app.stylus)
    .pipe(plugin.stylus({
      set: ['linenos'],
      use: ['nib'],
      paths: [src + '/app']
    }))
    .pipe(plugin.rework(moveMe()))
    .pipe(plugin.concat(fileName + '.css'))
    .pipe(gulp.dest('.cache/stylus'));
});

gulp.task('buildCss', ['stylus'], function () {
  return gulp.src('.cache/stylus/**/*')
    .pipe(gulp.dest(buildDir + '/assets'));
});

gulp.task('compressCss', ['stylus'], function () {
  return gulp.src('.cache/stylus/**/*')
    .pipe(plugin.csso())
    .pipe(gulp.dest('.cache/css-compress'));
})

gulp.task('compileCss', ['compressCss', 'compressAssets'], function () {
  return gulp.src('.cache/css-compress/**/*')
    .pipe(plugin.base64({ baseDir: '.cache/assets' }))
    .pipe(gulp.dest(complDir + '/assets'));
});

/** Javascript **/

gulp.task('spec', ['templates', 'buildJs', 'helperJs'], function (done) {
  new Server({ configFile: karmaCfg, singleRun: true }, function (e) {
    if (e) {
      done(new plugin.util.PluginError('karma', {message: 'Karma tests failed'}));
    } else {
      done();
    }
  }).start();
});

gulp.task('jshint', function () {
  var errors = { length : 0 };
  function formatErrors (errors) {
    return errors.length + " total errors. \n" + (Object.keys(errors).map(function (file) {
      if (file == 'length') { return }
      ers = errors[file];
      return file + ": " + ers.length + " errors \n" + ers.map(function (error) {
        if (error)
          return "    l" + error.line + "c" + error.character + ": " + error.evidence + " – " + error.reason;
      }).join("\n");
    }).join("\n"));
  }

  return es.merge(gulp.src(c.app.js), gulp.src(c.app.specs))
    .pipe(through.obj(function (file, enc, next) {
      if (!file.isNull()) {
        if(!jshint(file.contents.toString('utf8'), hintCfg)) {
          errors[file.relative] = jshint.errors;
          errors.length += jshint.errors.length;
        }
      }
      this.push(file);
      next();
    }))
    .pipe(through.obj(function (file, enc, next) {
      if (errors.length) {
        next(new plugin.util.PluginError('gulp-jshint', formatErrors(errors)));
        this.end();
      } else {
        next();
      }
    }));
});

gulp.task('buildJs', ['jshint'], function () {
  return es.merge(gulp.src(c.app.js)
      .pipe(feats(featsDev, {strict: false, default: true}))
    , gulp.src(vBuildJs, {base: cwd}))
    .pipe(plugin.newer(buildDir))
    .pipe(gulp.dest(buildDir));
});

gulp.task('helperJs', function () {
  var path = c.test.helper.dst.split('/');
  var name = path.splice(path.length-1, 1)[0];
  path = path.join('/');

  return gulp.src(c.test.helper.src)
    .pipe(feats(featsDev, {strict: false, default: true}))
    .pipe(plugin.rename(name))
    .pipe(plugin.newer(path))
    .pipe(gulp.dest(path));
});

gulp.task('helperJsDist', function () {
  var path = c.test.helper.dst.split('/');
  var name = '.release' + path.splice(path.length-1, 1)[0];
  path = path.join('/');

  return gulp.src(c.test.helper.src)
    .pipe(feats(featDist, {strict: true, default: false}))
    .pipe(plugin.rename(name))
    .pipe(gulp.dest(path));
});

gulp.task('js', ['spec', 'buildJs']);

gulp.task('html', function (cb) {
  var walker = walk.walk(buildDir, { followLinks: false });
  var ctx = {styles:[], scripts:[], compile: false};
  walker.on('file', function (root, stat, next) {
    root = path.relative(buildDir, root);

    if (vCopyJsNames.indexOf(stat.name.toString()) != -1) {
      // skip it
      // console.log('ignore', stat.name);
    } else if (stat.name == 'angular.js') {
      ctx.scripts.unshift(root + '/' + stat.name);
    } else {
      if (stat.name.match(/\.css$/)) {
        ctx.styles.push(root + '/' + stat.name);
      } else if (stat.name.match(/\.js$/)) {
        ctx.scripts.push(root + '/' + stat.name);
      }
    }
    next();
  });
  walker.on('end', function () {
    gulp.src(c.app.html)
      .pipe(plugin.template(ctx))
      .pipe(gulp.dest(buildDir))
      .on('end', cb);
  });
});

gulp.task('templates', function () {
  var compiled = gulp.src(c.app.jade)
    .pipe(plugin.rename(function (path) {
      path.dirname = path.dirname.replace(/^app\/?/, '');
      path.extname = '';
    }))
    .pipe(plugin.newer(buildDir + '/templates-app.js'))
    .pipe(plugin.jade());
  return es.merge(
      compiled.pipe(map(function(code) { return code; }))
      .pipe(plugin.newer(buildDir))
      .pipe(gulp.dest(buildDir)),
      compiled.pipe(plugin.angularTemplatecache('templates.js', {standalone: true}))
        .pipe(gulp.dest(buildDir + '/app'))
    );
});

gulp.task('build', function (cb) {
  runSeq('clean', ['templates', 'js', 'buildCss', 'buildAssets'], 'html', cb);
});

gulp.task('dist', ['distJs', 'compileCss', 'compileAssets', 'distHtml', 'distVCopyJs']);

gulp.task('distVCopyJs', ['buildJs'], function () {
  return gulp.src(vCopyJs, {base: cwd})
  .pipe(plugin.uglify({preserveComments: 'some', outSourceMap: true}))
  .pipe(gulp.dest(complDir));
});

gulp.task('distJs', ['buildJs', 'templates'], function () {
  return es.merge(
    gulp.src(vComplJs),
    gulp.src(c.app.js.concat(buildDir + '/app/templates.js'))
      .pipe(plugin.ngAnnotate())
      .pipe(feats(featDist, {strict: true, default: false}))
  )
  .pipe(plugin.order(['**/angular?(.min).js', '*']))
  .pipe(plugin.concat(fileName+'.js'))
  .pipe(gulp.dest(complDir + '/assets'))
  .pipe(plugin.uglify({preserveComments: 'some', outSourceMap: true}))
  .pipe(plugin.rename(function (path) {
    if (path.extname == '.js') {
      path.extname = '.min.js';
    }
  }))
  .pipe(gulp.dest(complDir + '/assets'));
});

gulp.task('distHtml', function () {
  var ctx = {
    styles:['/assets/' + fileName + '.css'],
    scripts:['/assets/' + fileName + '.min.js'],
    compile: true
  };
  return gulp.src(c.app.html)
    .pipe(plugin.template(ctx))
    .pipe(feats(featDist, {strict: true, default: false}))
    .pipe(gulp.dest(complDir));
});

gulp.task('testDist', ['helperJsDist'], function (done) {
  new Server({
    configFile: karmaCfg,
    singleRun: true,
    files: [complDir+"/**/*.min.js"].concat(
      c.test.helper.dst.split('/').slice(0, -1).join('/') + '/.release' +
      c.test.helper.dst.split('/').slice(-1), c.test.js, c.app.specs,
      c.test.assets.map(function (pattern) {
        return {
          pattern: pattern, watched: true, included: false, served: true
        };
      })
    ),
    browsers: ['PhantomJS'],
    reporters: ['dots']
  }, function (e) {
    if (e) {
      done(new plugin.util.PluginError('karma', {message: 'Karma tests failed'}));
    } else {
      done();
    }
  }).start();
});

gulp.task('cacheBust', function (done) {
  var cachebust = new require('gulp-cachebust')();
  gulp.src(complDir + '/assets/**/*.*')
    .pipe(cachebust.resources())
    .pipe(gulp.dest(complDir + '/assets'))
    .on('end', function () {
      gulp.src(complDir + '/**/*.{html,css}')
      .pipe(cachebust.references())
      .pipe(gulp.dest(complDir))
      .on('end', done);
    });
});

gulp.task('compressDist', function () {
  return gulp.src(complDir + "/**/*.*")
  .pipe(plugin.gzip())
  .pipe(gulp.dest(complDir));
});

gulp.task('compile', function (cb) {
  runSeq('dist', 'testDist', 'cacheBust', 'compressDist', cb);
});

gulp.task('compileServer', function () {
  if (server) {
    server.close();
  }
  server = require(cwd+'/'+c.app.server).listen(process.env.PORT||8080, complDir);
});

gulp.task('build_', function (cb) {
  runSeq('clean', ['templates', 'buildJs', 'buildCss', 'buildAssets'], 'html', cb);
});

gulp.task('watch', ['build_', 'installWebdriver', 'helperJs'], function (cb) {
  server = require(cwd+'/'+c.app.server)
    .listen(process.env.PORT || 8080, buildDir);
  plugin.util.log("Listening on port " + process.env.PORT || 8080);

  var lr = tinyLr();
  lr.listen(35729);
  plugin.util.log("LiveReload server started on port 35729");

  gulp.watch(buildDir + "/**/*", function (e) {
    lr.changed({
      body: {
        files: [path.relative(buildDir, e.path)]
      }
    });
  });

  gulp.watch('./src/**/*.styl', ['buildCss']);
  gulp.watch(c.app.jade, ['templates']);
  gulp.watch(c.app.html, ['html']);
  gulp.watch([buildDir + '/**/*.js', buildDir + '/**/*.css'], function (e) {
    if (e.type != 'changed') {
      gulp.run('html');
    }
  });

  gulp.watch(c.e2eSpecs, ['runProtractor']);

  new Server({ configFile: karmaCfg, autoWatch: true }).start();

  gulp.watch(allAppJs.concat(featsDev), ['buildJs', 'helperJs']);
  gulp.watch("src/**/*.js", ['buildJs', 'helperJs']);
});

gulp.task('default', ['watch']);

gulp.on('err', function (e) {
  if (!this.tasks['watch'].running) {
    plugin.util.log("Failure. Terminating.");
    process.exit(1);
  } else {
    notifier.notify({message: "Error in " + e.err.plugin + ": " + e.message }, function (e, t) { });
    plugin.util.log(plugin.util.colors.red("Error in build. Continuing execution for `watch` task."));
    console.log('');
    plugin.util.beep();
  }
});

gulp.task('checkCoverage', ['spec'], function () {
  return gulp.src('.')
    .pipe(istnbl({
      thresholds: c.covReq,
      coverageDirectory : 'coverage',
      rootDirectory : ''
    }));
});

gulp.task('coveralls', ['checkCoverage', 'compile'], function (done) {
  var ps = spawn(cwd+'/node_modules/coveralls/bin/coveralls.js');
  var coverageDir = cwd + '/coverage/';
  fs.readdir(coverageDir, pickFolder);
  ps.on('exit', function (c) {
    done();
  });
  ps.stdout.on('data', log);
  ps.stderr.on('data', log);

  function pickFolder (err, folders) {
    var folder = folders[0];
    fs.readFile(coverageDir + folder + '/lcov.info', pipeFile);
  }

  function pipeFile (err, data) {
    ps.stdin.write(data.toString().replace(/\/public\/(?!app\/templates)(.*)\.js/g, "/src/$1.js"));
    ps.stdin.end();
  }

  function log (data) {
    plugin.util.log(data.toString().replace(/^\n|\n$/g, ''));
  }
});

gulp.task('installWebdriver', function (cb) {
  if (process.env['TRAVIS']) {
    cb();
  } else {
    return instWd(cb);
  }
});

gulp.task('protractor', ['installWebdriver', 'compile', 'compileServer'], function (cb) {
  return gulp.src(c.e2eSpecs)
  .pipe(prtrct({configFile: c.protractorCfg}))
  .on('error', function (e) { cb(e); this.emit('end'); })
  .on('end', function () { server.close(); });
});

gulp.task('runProtractor', function () {
  return gulp.src(c.e2eSpecs)
  .pipe(prtrct({configFile: c.protractorCfg, baseUrl: 'http://localhost:8080'}))
  .on('error', function (e) { this.emit('end', new plugin.util.PluginError('gulp-jshint', e)); });
});

gulp.task('ci', ['coveralls']);
