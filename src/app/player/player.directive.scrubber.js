(function () {

  angular
    .module('prx.player')
    .directive('prxPlayerScrubber', prxPlayerScrubber);

  // prxPlayerScrubber.$inject = [];

  function prxPlayerScrubber() {
    return {
      restrict: 'A',
      scope: {'prxPlayerScrubber': '&'},
      link: function (scope, elem, attrs) {
        elem.bind('click', click);

        elem.children().css('pointer-events', 'none');

        scope.$on('$destroy', function () {
          elem.unbind('click', click);
        });

        function click (event) {
          scope.prxPlayerScrubber({percentage: (event.offsetX || event.layerX) * 100 / event.target.offsetWidth});
        }
      }
    };
  }

}());
