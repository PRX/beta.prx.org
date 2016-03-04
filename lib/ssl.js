var LEX = require('letsencrypt-express').testing();

/**
 * Just-in-time setup for letsencrypt
 */
module.exports.listen = function letsListen(app, port, sslPort) {
  var lex = LEX.create({
    configDir: '/letsencrypt/etc',
    approveRegistration: function (hostname, cb) {
      cb(null, {
        domains: [hostname],
        email: 'tech-team@prx.org',
        agreeTos: true
      });
    }
  });

  lex.onRequest = app;
  return lex.listen([port], [sslPort], function () {
    var protocol = ('requestCert' in this) ? 'https': 'http';
  });
};
