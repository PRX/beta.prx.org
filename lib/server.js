var express = require('express'),
  app = express();

exports.listen = function (listenSpec, folder) {
  app.use(express.static(folder));
  app.use(function (req, res) {
    res.sendfile('index.html', {root: folder});
  });
  return app.listen(listenSpec);
};