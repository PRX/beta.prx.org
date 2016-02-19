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
        scrollInBuffer: '@',
        scrollInLimit: '@'
      },
      link: function (scope, elem, attrs) {
        var buffer = 0;
        scope.$watch('scrollInBuffer', function(is) {
          buffer = parseInt(is, 10) || 0;
        });

        var limit = 0;
        scope.$watch('scrollInLimit', function(val) {
          limit = parseInt(val, 10) || 0;
        });

        var count = 0;
        function windowScrolled(event) {
          if ((elem[0].getBoundingClientRect().top - buffer) < $window.innerHeight) {
            if (limit <= 0 || count < limit) {
              if (scope.onScrollIn({$event: event}) !== false) {
                count++;
              }
            }
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
