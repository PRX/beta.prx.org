module.exports = function errorsDirective() {
  'ngInject';

  return {
    restrict: 'E',
    templateUrl: 'errors/error_modal.html',
    controller: 'ErrorCtrl',
    replace: true,
    controllerAs: 'error'
  };
};
