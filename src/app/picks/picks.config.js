(function () {

  angular
    .module('prx.picks')
    .config(config);

  config.$inject = ['ngHalProvider'];

  function config(ngHalProvider) {
    ngHalProvider.mixin('http://meta.prx.org/model/pick/*any', ['resolved', function (resolved) {
      resolved.story = resolved.follow('prx:story');
      resolved.account = resolved.follow('prx:account');
    }]);
  }

}());
