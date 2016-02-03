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

        angular.element($window).bind('scroll', function(event) {
          var elemTop = elem[0].getBoundingClientRect().top;
          if ((elemTop - buffer) < $window.pageYOffset) {
            scope.$eval(attrs.onScrollIn);
          }
        });
      }
    };
  }

}());
