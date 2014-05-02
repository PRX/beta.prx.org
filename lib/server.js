var express = require('express'),
  spawn = require('child_process').spawn,
  http  = require('http'),
  app   = express(),
  phantom;

exports.listen = function (listenSpec, folder) {
  phantom = spawn('phantomjs', ['--ignore-ssl-errors=yes', '--ssl-protocol=any', __dirname + '/phantom-render.js', 8081]);
  app.use(express.static(folder));
  app.use(function (req, res, next) {
    if (typeof req.query._skip_prerender_ === 'undefined') {
      var newReq = http.request({hostname: 'localhost', port: 8081, path: req.url}, function (pres) {
        res.status(pres.statusCode);
        res.writeHead(pres.headers);
        pres.on('data', function (data) {
          res.write(data);
        });
        pres.on('end', function () {
          res.end();
        });
      });
      newReq.end();
    } else {
      next();
    }
  });
  app.use(function (req, res) {
    res.sendfile('index.html', {root: folder});
  });
  return app.listen(listenSpec).on('close', function () {
    phantom.kill();
  });
};
