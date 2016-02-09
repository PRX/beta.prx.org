var express = require('express'),
  jsdom = require('jsdom'),
  http  = require('http'),
  app   = express(),
  fs    = require('fs');
  pShim = '<script id="phantom-shim">window.callPhantom = function () { window.phantomCalled = true; }</script><script';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';



exports.listen = function (listenSpec, folder) {
  var html = fs.readFileSync(folder + '/index.html', 'utf-8').replace('<script', pShim);

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
    res.sendFile('index.html', {root: folder});
  });

  return app.listen(listenSpec);

  function prerender (req, res, next) {
    jsdom.env({
      html: html,
      url: 'http'+(process.env.NODE_ENV=="development"?'':'s')+'://' + req.host + (process.env.NODE_ENV=="development"?":"+listenSpec:"") + req.url,
      features: {
        FetchExternalResources: ["script"],
        ProcessExternalResources: ["script"]
      },
      done: function (errors, window) {
        var ps = window.document.getElementById('phantom-shim');
        ps.parentNode.removeChild(ps);
        ps = window.document.getElementById('sm2-container');
        if (ps) {
          ps.parentNode.removeChild(ps);
        }

        if(window.phantomCalled) {
          respond();
        } else {
          window.callPhantom = function () {
            respond();
          }
        }

        function respond () {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(window.document.documentElement.outerHTML);
          res.end();
          window.close();
        }
      }
    });
  }
};

if (!module.parent || module.parent.exports.PhusionPassenger) {
  exports.listen(3000, __dirname + '/../public');
}
