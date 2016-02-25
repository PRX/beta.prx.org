/**
 * Configurations and feature flags
 *
 * Each of these may be overriden by an ENV variable of the same name
 */
module.exports = {
  toJSON: function() {
    var obj = {};
    Object.keys(module.exports).forEach(function(key) {
      if (typeof module.exports[key] !== 'function') {
        obj[key] = module.exports[key];
      }
    });
    return obj;
  },
  toString: function() {
    return JSON.stringify(module.exports.toJSON());
  },
  toBrowser: function() {
    return 'window.FEAT=' + module.exports.toString() + ';';
  },

  // generic node_env (used mostly for labels)
  NODE_ENV: 'development',

  // configurations
  API_HOST:           'https://cms.prx.org/api/v1',
  COUNT_HOST:         'https://count.prx.org',
  GA_KEY:             '',
  ID_HOST:            'https://id.prx.org',
  ID_CLIENT_KEY:      'mkbKU13rsBTe2bN0T0HXXiFoW27D5dTWBKKieItJ',
  PRXPERIMENTS_HOST:  '',
  SUMO_SITE_ID:       '',
  UPLOADS_AWS_BUCKET: 'prx-up',
  UPLOADS_AWS_KEY:    'AKIAJZ5C7KQPL34SQ63Q',
  UPLOADS_AWS_URL:    'https://dsn15m3yob5tf.cloudfront.net',
  UPLOADS_CLOUDFRONT:  true,
  UPLOADS_LOGGING:     false,
  UPLOADS_SIGNER_URL: 'https://6fzgppd4bk.execute-api.us-east-1.amazonaws.com/prod/signature',

  // feature flags
  SHOW_HOMEPAGE:     true,
  SHOW_LISTENLATER:  false,
  SHOW_LOVESHAREBUY: false,
  SHOW_TCFDEMO:      false,
  SHOW_WELCOMEMAT:   false
};

// override with env
var truthyValues = ['1', 1, 'true', 'yes', 'on', true];
Object.keys(module.exports.toJSON()).forEach(function(key) {
  var defaultValue = module.exports[key];
  var overrideValue = process.env[key];
  if (overrideValue !== undefined) {
    if (typeof defaultValue === 'boolean') {
      overrideValue = truthyValues.indexOf(overrideValue) > -1; // fix bools
    }
    module.exports[key] = overrideValue;
  }
});
