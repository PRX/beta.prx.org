(function () {

  angular
    .module('prx.errors')
    .directive('prxErrorModal', prxErrorModal);

  // prxErrorModal.$inject = [];

  function prxErrorModal() {
    return {
      restrict: 'E',
      templateUrl: 'errors/error_modal.html',
      controller: 'ErrorCtrl',
      replace: true,
      controllerAs: 'error'
    };
  }

}());
