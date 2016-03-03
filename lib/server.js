var express    = require('express');
var gzipStatic = require('connect-gzip-static');
var jade       = require('jade');
var Buffer     = require('buffer').Buffer;
var zlib       = require('zlib');
var ssl        = require('./ssl');
var app        = express();

/**
 * Serve up some www.prx.org
 */
exports.listen = function startListening(port, sslPort, which, reload) {
  var devAssets = {
    js: ['assets/app.js', 'assets/templates.js'],
    css: ['assets/app.css']
  };
  var distAssets = {
    js: ['assets/app.min.js'],
    css: ['assets/app.min.assets.css']
  };
  var defaultAssets = (which == 'dev') ? devAssets : distAssets;

  // static files
  app.use('/assets', gzipStatic('build/assets', {index: false}));
  app.use('/vendor', gzipStatic('build/vendor', {index: false}));

  // send 404s for missing assets/vendors
  app.all('/assets/*', function send404(req, res) { res.sendStatus(404); });
  app.all('/vendor/*', function send404(req, res) { res.sendStatus(404); });

  // dynamic html (cached at runtime)
  app.get('/dev.html',  serveHtml(devAssets, reload));
  app.get('/dist.html', serveHtml(distAssets, reload));
  app.get('*',          serveHtml(defaultAssets, reload));
  app.head('*',         serveHtml(defaultAssets, reload));

  // optional letsencrypting
  if (sslPort) {
    return ssl.listen(app, port, sslPort);
  }
  else {
    return app.listen(port);
  }
};

/**
 * Rebuild html from scratch (no caching of requires)
 */
function buildHtml(assets, liveReload) {
  delete require.cache[require.resolve('../build/flags.conf')];
  return jade.renderFile('build/index.jade', {
    FEAT: require('../build/flags.conf').toJSON(),
    inlinescripts: [require('../build/flags.conf').toBrowser()],
    styles: assets.css,
    scripts: assets.js,
    pretty: false,
    liveReload: liveReload
  });
}

/**
 * Gzip our html file
 */
function buildGzip(html) {
  return zlib.gzipSync(new Buffer(html, 'utf-8'));
}

/**
 * Serve up some optionally-gzipped html strings
 */
function serveHtml(assets, liveReload) {
  var html = buildHtml(assets, liveReload);
  var gzip = buildGzip(html);

  return function serveSomeHtml(req, res) {
    if (liveReload) {
      html = buildHtml(assets, liveReload);
      gzip = buildGzip(html);
    }
    var acceptEncoding = req.headers['accept-encoding'] || '';
    if (acceptEncoding.match(/\bgzip\b/)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      res.send(gzip);
    }
    else {
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    }
  }
};

// start listening, if called directly
if (!module.parent) {
  var port = process.env['PORT'] || 8080;
  var sslPort = process.env['SSL_PORT'];
  exports.listen(port, sslPort);
  if (sslPort) {
    console.log('Listening on port ' + port + ' and ssl port ' + sslPort);
  }
  else {
    console.log('Listening on port ' + port)
  }
}
