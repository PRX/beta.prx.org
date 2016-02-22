var angular = require('angular');

// angular flagging
var app = angular.module('prx.modelConfig', [
  require('./angular-hal')
]);
module.exports = app.name;

app.config(function (ngHalProvider) {
  ngHalProvider.mixin('http://meta.prx.org/model/:type/*splat', ['type', function (type) {
    var stateName = type+'.show';
    var idName = type + 'Id';
    return {
      stateName: type + '.show',
      stateParams: function () {
        if(!angular.isDefined(this.$$stateParams)) {
          this.$$stateParams = {};
          this.$$stateParams[idName] = this.id;
        }
        return this.$$stateParams;
      }
    };
  }])
  .mixin('http://meta.prx.org/model/image/*splat', ['resolved', function (resolved) {
    resolved.enclosureUrl = resolved.call('link', 'enclosure').call('url');
  }]);
});
