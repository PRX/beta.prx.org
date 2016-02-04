(function () {

  angular
    .module('prx.home')
    .directive('onScrollIn', onScrollIn);

  onScrollIn.$inject = ['$window'];

  function onScrollIn($window) {
    return {
      restrict: 'A',
      scope: {
        onScrollIn: '&',
        scrollInBuffer: '@'
      },
      link: function (scope, elem, attrs) {
        var buffer = 0;
        scope.$watch('scrollInBuffer', function(is) {
          buffer = parseInt(is, 10) || 0;
        });

        function windowScrolled(event) {
          if ((elem[0].getBoundingClientRect().top - buffer) < $window.innerHeight) {
            scope.onScrollIn({$event: event});
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
