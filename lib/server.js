var express = require('express'),
  jsdom = require('jsdom'),
  http  = require('http'),
  app   = express();

exports.listen = function (listenSpec, folder) {
  app.use(express.static(folder));
  app.use(function (req, res, next) {
    if (typeof req.query._escaped_fragment_ !== 'undefined') {
      jsdom.env({
        file: folder + '/index.html',
        url: 'https://m-staging.prx.org' + req.url,
        src: ['window.callPhantom = function () { window.phantomCalled = true; }'],
        features: {
          FetchExternalResources: ["script"],
          ProcessExternalResources: true
        },
        done: function (errors, window) {
          if(window.phantomCalled) {
            respond();
          } else {
            window.callPhantom = function () {
              respond();
            }
          }

          function respond() {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(window.document.documentElement.innerHTML);
            res.end();
          }
        }
      });
    } else {
      next();
    }
  });
  app.use(function (req, res) {
    res.sendfile('index.html', {root: folder});
  });

  return app.listen(listenSpec);
};

if (!module.parent || module.parent.exports.PhusionPassenger) {
  exports.listen(3000, __dirname + '/../public');
}
