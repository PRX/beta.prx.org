angular.module('prx.ads', [])

.directive('prxAd', function($window, $timeout) {
  return {
    restrict: 'E',
    replace: true,
    template: "<div class='ad'><div class='slot'/></div>",
    controller: function controller() {
      var timeoutPromise;
      var self = this;
      this.width = this.height = 0;
      this.reload = function(gSlot, newwidth, newheight) {
        if (timeoutPromise) {
          $timeout.cancel(timeoutPromise);
        }
        timeoutPromise = $timeout(function() {
          if (self.width != newwidth || self.height != newheight) {
            self.width = newwidth;
            self.height = newheight;
            if (angular.isDefined($window.googletag)) {
              gSlot.defineSizeMapping([[[0,0],[self.width,self.height]]]);
              $window.googletag.pubads().refresh([gSlot]);
            }
          }
        }, 5);
      };
    },
    link: function(scope, elem, attrs, ctrl) {
      elem = elem.children().eq(0);
      elem.attr('id', 'div-gpt-ad-' + Math.random().toString(36).substr(2, 9));
      ctrl.width = elem[0].offsetWidth;
      ctrl.height = elem[0].offsetHeight;
      var win = angular.element($window);
      if (angular.isDefined($window.googletag)) {
        $window.googletag.cmd.push(function() {
          gSlot = $window.googletag.defineSlot(attrs.slot, [ctrl.width, ctrl.height], elem.attr('id')).addService($window.googletag.pubads());
          gSlot.defineSizeMapping([[[0,0],[ctrl.width,ctrl.height]]]);
          $window.googletag.enableServices();
          $window.googletag.display(elem.attr('id'));
        });
        win.on('resize', function doReload() {
          ctrl.reload(gSlot, elem[0].offsetWidth, elem[0].offsetHeight);
        });
        scope.$on('$destroy', function () {
          win.off('resize', doReload);
        });
      } else {
        elem.css('background-color', 'grey');
      }
    }
  };
})

;
