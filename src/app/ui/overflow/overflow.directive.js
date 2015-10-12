(function () {

  angular
    .module('prx.ui.overflow')
    .directive('overflowClass', overflowClass);

  overflowClass.$inject = ['OverflowCheck'];

  function overflowClass(OverflowCheck) {
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        if(!attrs.overflowClass || attrs.overflowClass == 'overflow-class') {
          attrs.overflowClass = 'overflowing';
        }

        OverflowCheck.watch(el[0], setClass);
        scope.$on('$destroy', function () {
          OverflowCheck.unwatch(el[0], setClass);
        });
        function setClass(on) {
          if (on) {
            el.addClass(attrs.overflowClass);
          } else {
            el.removeClass(attrs.overflowClass);
          }
        }
      }
    };
  }

}());
