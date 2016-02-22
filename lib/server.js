var express = require('express'),
    app     = express();

// default to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Serve up some www.prx.org
 */
exports.listen = function (port, file) {
  file = file || 'index.html'; // index or dev

  app.use(express.static('build', {index: false}));
  app.use(function (req, res) {
    res.sendFile(file, {root: 'build'});
  });
  return app.listen(port);

};

// start listening, if called directly
if (!module.parent || module.parent.exports.PhusionPassenger) {
  var port = process.env['PORT'] || 8080;
  exports.listen(port);
  console.log('Listening on port ' + port)
}
