var express = require('express'),
    jade    = require('jade'),
    flags   = require('../build/flags.conf'),
    app     = express();

/**
 * Serve up some www.prx.org
 */
exports.listen = function startListening(port, which, reload) {
  var devHtml = exports.render(['assets/app.css'], ['assets/app.js', 'assets/templates.js'], reload);
  var distHtml = exports.render(['assets/app.min.assets.css'], ['assets/app.min.js'], reload);
  var defaultHtml = (which == 'dev') ? devHtml : distHtml;

  // routes
  app.use('/assets', express.static('build/assets', {index: false}));
  app.use('/vendor', express.static('build/vendor', {index: false}));
  app.use('/dev.html', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(devHtml);
  });
  app.use('/dist.html', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(distHtml);
  });
  app.use(function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(defaultHtml);
  });
  return app.listen(port);
};

/**
 * Render some form of the index file
 */
exports.render = function renderIndex(styles, scripts, liveReload) {
  return jade.renderFile('build/index.jade', {
    FEAT: flags.toJSON(),
    inlinescripts: [flags.toBrowser()],
    styles: styles,
    scripts: scripts,
    pretty: true,
    liveReload: liveReload
  });
};

// start listening, if called directly
if (!module.parent) {
  var port = process.env['PORT'] || 8080;
  exports.listen(port);
  console.log('Listening on port ' + port)
}
