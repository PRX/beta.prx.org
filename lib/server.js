var express = require('express'),
  jsdom = require('jsdom'),
  http  = require('http'),
  app   = express();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

exports.listen = function (listenSpec, folder) {
  if (process.env.NODE_ENV == 'development') {
    app.use(express.static(folder));
  } else {
    app.use(function (req, res, next) {
      jsdom.env({
        file: folder + '/index.html',
        url: 'https://' + req.host + req.url,
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

          function respond () {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(window.document.documentElement.innerHTML);
            res.end();
          }
        }
      });
    });
  }

  app.use(function (req, res) {
    res.sendfile('index.html', {root: folder});
  });

  return app.listen(listenSpec);
};

if (!module.parent || module.parent.exports.PhusionPassenger) {
  exports.listen(3000, __dirname + '/../public');
}
