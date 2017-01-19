angular.module('prx.ui.nav', [])
.service('XiContextMenu', function ($rootScope, $timeout) {
  var ContextMenu = this;
  this.show = false;
  $rootScope.$on("$stateChangeStart", function (event, toState) {
    $timeout(function () {
      if (!event.defaultPrevented) {
        if (!toState.views || !toState.views["contextMenu@"]) {
          ContextMenu.show = false;
        }
      }
    }, 0);
  });
  $rootScope.$on("$stateChangeError", function (event, toState, _, fromState) {
    $timeout(function () {
      if (fromState.views && fromState.views["contextMenu@"]) {
        ContextMenu.show = true;
      }
    }, 0);
  });
  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
    $timeout(function () {
      if (toState.views && toState.views["contextMenu@"]) {
        ContextMenu.show = true;
      }
    }, 0);
  });
})
.directive('xiContextMenu', function (XiContextMenu, $animate) {
  return {
    restrict: 'E',
    link: function (scope, elem, attrs) {
      scope.menu = XiContextMenu;
      scope.$watch('menu.show', function (show) {
        if (show) {
          $animate.addClass(elem, 'visible');
        } else {
          $animate.removeClass(elem, 'visible');
        }
      });
    }
  };
})
.directive('prxDrawer', function (PRXDrawer) {
  return {
    restrict: 'E',
    templateUrl: 'ui/nav/container.html',
    transclude: true,
    replace: true,
    controller: function prxDrawerController () {
      this.open = false;
      this.toggle = function () {
        this.open = !this.open;
      };
      this.totalItems = PRXDrawer.items.length;
      this.drawerItems = PRXDrawer.items;
      this.maxNavItems = 0;
      this.moreNavItems = PRXDrawer.navItems(1);
      this.setMoreNavItems = function (moreNavItems) {
        if (this.moreNavItems.length != Math.min(this.totalItems, moreNavItems)) {
          this.moreNavItems = PRXDrawer.navItems(Math.min(this.totalItems, moreNavItems));
        }
      };
      this.setMaxNavItems = function (maxNavItems) {
        if (this.maxNavItems !== maxNavItems) {
          this.drawerItems = PRXDrawer.drawerItems(maxNavItems);
          this.navItems = PRXDrawer.navItems(maxNavItems);
          this.moreNavItems = PRXDrawer.navItems(maxNavItems + 1);
          this.maxNavItems = maxNavItems;
          if (this.drawerItems.length === 0) {
            this.open = false;
          }
        }
      };
    },
    controllerAs: 'drawer'
  };
})
.directive('prxDrawerContents', function () {
  return {
    restrict: 'E',
    templateUrl: 'ui/nav/drawer.html',
    replace: true
  };
})
.directive('prxDrawerItem', function () {
  return {
    restrict: 'E',
    templateUrl: 'ui/nav/drawer_item.html',
    replace: true,
    scope: {item: '='},
    bindToController: true,
    controller: 'DrawerItemCtrl',
    controllerAs: 'drawerItem'
  };
})
.controller('DrawerItemCtrl', function () {
  this.classes = function () {
    return [this.item.type || 'item'];
  };
  this.href = function () {
    return this.item.href;
  };
  this.text = function () {
    return this.item.name;
  };
})
.provider('PRXDrawer', function () {
  var menuItems = [];

  function DrawerItem(type, text, href, shortText) {
    this.type = type;
    this.text = text;
    this.href = href;
    this.shortText = shortText || text;
  }

  function calculateNavCache(items) {
    var result = [], tmp = angular.copy(items);

    for (var i=0; i<tmp.length; i++) {
      if (tmp[i].nav) {
        result.push(tmp.splice(i, 1)[0]);
        i -= 1;
      }
    }

    result.push.apply(result, tmp);
    return result;
  }

  function Drawer(items, sortFn) {
    var self = this;
    this.open = false;
    this.items = items;
    this.navCache = calculateNavCache(items);
    this.toggle = function toggle () {
      self.open = !self.open;
    };
    this.sortFn = sortFn;
  }

  Drawer.prototype.navItems = function navItems (maxItems) {
    if (maxItems >= this.items.length) { return this.items; }
    var result = this.sortFn(this.navCache.slice(0, maxItems));
    return result;
  };

  Drawer.prototype.drawerItems = function drawerItems (maxNavItems) {
    if (maxNavItems === 0) { return this.items; }
    if (maxNavItems >= this.items.length) { return []; }
    return this.sortFn(this.navCache.slice(maxNavItems));
  };

  getDrawer.$inject = ['$filter'];
  function getDrawer($filter) {
    var orderBy = $filter('orderBy');
    function sortMenuItems(items) {
      return orderBy(items, 'weight');
    }
    angular.forEach(menuItems, function (item) {
      if (typeof item.weight === 'undefined') {
        item.weight = PRXDrawerProvider.MID;
      }
      if (typeof item.nav === 'undefined') {
        item.nav = false;
      }
    });
    return new Drawer(sortMenuItems(menuItems), sortMenuItems);
  }

  var PRXDrawerProvider = {
    $get: getDrawer,
    register: function register () {
      menuItems.push.apply(menuItems, arguments);
      return this;
    },
    TOP: -Infinity,
    BOTTOM: Infinity,
    HIGH: -100,
    LOW: 100,
    MID: 0
  };

  return PRXDrawerProvider;
})
.directive('prxDrawerButton', function () {
  return {
    restrict: 'E',
    replace: true,
    require: '^prxDrawer',
    templateUrl:'ui/nav/toggle_button.html',
    link: function (scope, elem, attrs, ctrl) {
      scope.drawer = ctrl;
    }
  };
})
.factory('quickDebounce', function ($timeout) {
  return quickDebounce;

  function quickDebounce(fn, duration) {
    var timeout = -1;
    duration = duration || 100;
    function trigger(self, args) {
      return function () {
        fn.apply(self, args);
        timeout = 0;
      };
    }

    function debouncedVersion () {
      if (!timeout) {
        var it = trigger(this, arguments);
        timeout = $timeout(function () {
          it();
          timeout = $timeout(function () { timeout = 0; }, duration - 1);
        }, 1);
      } else {
        $timeout.cancel(timeout);
        timeout = $timeout(trigger(this, arguments), duration);
      }
    }

    debouncedVersion.toString = function () {
      return fn.toString();
    };

    return debouncedVersion;
  }
})
.directive('prxNavButtons', function ($window, quickDebounce, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'ui/nav/nav_buttons.html',
    require: '^prxDrawer',
    replace: true,
    transclude: true,
    link: function (scope, elem, attrs, ctrl) {
      var debouncedCheckWidth = quickDebounce(checkWidth, 50);
      var alternateElem = elem.children().eq(0);
      var calculating = false;

      angular.element($window).on('resize', debouncedCheckWidth);
      scope.$on('$destroy', function () {
        angular.element($window).off('resize', debouncedCheckWidth);
      });

      scope.$watch(debouncedCheckWidth);

      $timeout(checkWidth, 200);

      function checkWidth() {
        var isOverflowing = overflowing(elem);
        var altOverflowing = overflowing(alternateElem);
        var hitCap = (ctrl.totalItems == ctrl.moreNavItems.length);

        if (calculating) {
          if (isOverflowing) {
            if (!altOverflowing) {
              calculating = false;
              ctrl.setMaxNavItems(ctrl.moreNavItems.length);
            } else {
              ctrl.setMoreNavItems(ctrl.moreNavItems.length - 1);
            }
          } else {
            if (altOverflowing) {
              calculating = false;
              ctrl.setMaxNavItems(ctrl.moreNavItems.length - 1);
            } else if (hitCap) {
              calculating = false;
              ctrl.setMaxNavItems(ctrl.moreNavItems.length);
            } else {
              ctrl.setMoreNavItems(ctrl.moreNavItems.length + 1);
            }
          }
        } else {
          if (isOverflowing) {
            calculating = true;
            ctrl.setMoreNavItems(ctrl.maxNavItems - 1);
          } else if (!altOverflowing && !hitCap) {
            calculating = true;
            ctrl.setMoreNavItems(ctrl.moreNavItems.length + 1);
          } else if (!altOverflowing && ctrl.maxNavItems < ctrl.moreNavItems.length) {
            ctrl.setMaxNavItems(ctrl.moreNavItems.length);
          }
        }

        if (calculating) {
          $timeout(checkWidth, 1);
        }
      }

      function overflowing(elem) {
        var children = elem.children();
        if (children.length) {
          return elem[0].getBoundingClientRect().left >
            children[0].getBoundingClientRect().left;
        }
        return false;
      }
    }
  };
})
.directive('xiNavItem', function ($compile) {
  return {
    restrict: 'E',
    templateUrl: 'ui/nav/nav_item.html',
    controller: 'NavItemCtrl',
    controllerAs: 'navItem',
    scope: { 'item': '=' },
    transclude: true,
    bindToController: true,
    link: function (scope, elem, _, ctrl) {
      var holder = elem.children();
      if (ctrl.item.template) {
        holder.children().eq(0).replaceWith($compile(ctrl.item.template)(scope.$parent));
      }
      if (ctrl.item.dropdownTemplate) {
        holder.on('click', function (e) {

          if (!holder.hasClass('expanded')) {
            e.preventDefault();
            holder.addClass('expanded');
          }
        });

        holder.on('mouseleave', function () {
          holder.removeClass('expanded');
        });
        holder.children().eq(1).append($compile(ctrl.item.dropdownTemplate)(scope.$parent));
      }
    }
  };
})
.controller('NavItemCtrl', function () {
  this.text = function () {
    return this.item.name;
  };
  this.href = function () {
    return this.item.href;
  };
  this.type = function () {
    return this.item.type;
  };
});
