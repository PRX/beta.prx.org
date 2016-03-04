var fs = require('fs');

/**
 * Just-in-time setup for letsencrypt
 */
module.exports.listen = function letsListen(app, port, sslPort) {
  var LEX = require('letsencrypt-express'); //.testing();

  // for multiple servers under a load balancer, we need a shared folder in
  // s3 to do the handshake.
  if (process.env['LETSENCRYPT_BUCKET']) {
    var cmd = 'mkdir -p /letsencrypt && ';
    cmd += 's3fs ' + process.env['LETSENCRYPT_BUCKET'] + ' /letsencrypt';
    require('child_process').execSync(cmd);
  }

  var lex = LEX.create({
    configDir: '/letsencrypt',
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
