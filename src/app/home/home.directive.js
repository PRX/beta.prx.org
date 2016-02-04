(function () {

  angular
    .module('prx.home')
    .directive('onScrollIn', onScrollIn);

  onScrollIn.$inject = ['$window'];

  function onScrollIn($window) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var buffer = parseInt(attrs.scrollInBuffer, 10);
        buffer = isNaN(buffer) ? 0 : buffer;

        function windowScrolled(event) {
          if ((elem[0].getBoundingClientRect().top - buffer) < $window.innerHeight) {
            scope.$eval(attrs.onScrollIn);
          }
        }

        angular.element($window).on('scroll', windowScrolled);
        scope.$on('$destroy', function() {
          angular.element($window).off('scroll', windowScrolled);
        });
      }
    };
  }

}());
