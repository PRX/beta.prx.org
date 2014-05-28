var express = require('express'),
  jsdom = require('jsdom'),
  http  = require('http'),
  app   = express();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';



exports.listen = function (listenSpec, folder) {
  if (process.env.NODE_ENV == 'development') {
    app.use(express.static(folder));
    app.use(function (req, res, next) {
      if (typeof req.query.prerender !== 'undefined') {
        prerender(req, res);
      } else {
        next();
      }
    });
  } else {
    app.use(prerender);
  }

  app.use(function (req, res) {
    res.sendfile('index.html', {root: folder});
  });

  return app.listen(listenSpec);

  function prerender (req, res, next) {
    jsdom.env({
      file: folder + '/index.html',
      url: 'http'+(process.env.NODE_ENV=="development"?'':'s')+'://' + req.host + (process.env.NODE_ENV=="development"?":"+listenSpec:"") + req.url,
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
  }
};

if (!module.parent || module.parent.exports.PhusionPassenger) {
  exports.listen(3000, __dirname + '/../public');
}
