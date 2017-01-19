(function () {

  angular
    .module('prx.player')
    .controller('GlobalPlayerCtrl', GlobalPlayerCtrl);

  GlobalPlayerCtrl.$inject = ['prxPlayer'];

  function GlobalPlayerCtrl(prxPlayer) {
    this.global = prxPlayer;
  }

}());
