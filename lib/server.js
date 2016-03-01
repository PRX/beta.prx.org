var express    = require('express');
var gzipStatic = require('connect-gzip-static');
var jade       = require('jade');
var Buffer     = require('buffer').Buffer;
var zlib       = require('zlib');
var flags      = require('../build/flags.conf');
var app        = express();

/**
 * Serve up some www.prx.org
 */
exports.listen = function startListening(port, which, reload) {
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
  app.get('/dev.html',  gzipHtml(devAssets, reload));
  app.get('/dist.html', gzipHtml(distAssets, reload));
  app.get('*',          gzipHtml(defaultAssets, reload));
  app.head('*',         gzipHtml(defaultAssets, reload));
  return app.listen(port);
};

/**
 * Serve up some optionally-gzipped html strings
 */
gzipHtml = function gzipHtml(assets, liveReload) {
  var html = jade.renderFile('build/index.jade', {
    FEAT: flags.toJSON(),
    inlinescripts: [flags.toBrowser()],
    styles: assets.css,
    scripts: assets.js,
    pretty: false,
    liveReload: liveReload
  });
  var gzip = zlib.gzipSync(new Buffer(html, 'utf-8'));

  return function serveSomeHtml(req, res) {
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
  exports.listen(port);
  console.log('Listening on port ' + port)
}
