(function () {

  angular
    .module('prx.ui.overflow')
    .directive('onOverflow', onOverflow);

  onOverflow.$inject = ['OverflowCheck'];

  function onOverflow(OverflowCheck) {
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        var elem = el[0];

        function setOverflow(isOverflowing) {
          scope.$eval(attrs.onOverflow, {'$overflowing': isOverflowing});
        }

        OverflowCheck.watch(elem, setOverflow);

        scope.$on('$destroy', function () {
          OverflowCheck.unwatch(elem, setOverflow);
        });
      }
    };
  }

}());
