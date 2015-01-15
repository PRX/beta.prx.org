angular.module('prx.drawer', [])
.directive('prxDrawer', function (PRXDrawer) {
  return {
    restrict: 'E',
    templateUrl: 'drawer/container.html',
    transclude: true,
    replace: true,
    controller: function prxDrawerController () {
      this.open = false;
      this.toggle = function () {
        this.open = !this.open;
      };
      this.drawerItems = PRXDrawer.items;
      this.maxNavItems = 0;
      this.setMaxNavItems = function (maxNavItems) {
        if (this.maxNavItems !== maxNavItems) {
          this.drawerItems = PRXDrawer.drawerItems(maxNavItems);
          this.navItems = PRXDrawer.navItems(maxNavItems);
          this.maxNavItems = maxNavItems;
        }
      };
    },
    controllerAs: 'drawer'
  };
})
.directive('prxDrawerContents', function () {
  return {
    restrict: 'E',
    templateUrl: 'drawer/drawer.html',
    replace: true
  };
})
.directive('prxDrawerItem', function () {
  return {
    restrict: 'E',
    templateUrl: 'drawer/drawer_item.html',
    replace: true,
    scope: {item: '='},
    bindToController: true,
    controller: 'DrawerItemCtrl',
    controllerAs: 'drawerItem'
  };
})
.controller('DrawerItemCtrl', function ($compile) {
  this.classes = function () {
    return [this.item.type];
  };
  this.href = function () {
    return this.item.href;
  };
  this.text = function () {
    return this.item.name;
  };

  // if (this.item.)
})
.provider('PRXDrawer', function () {
  var menuItems = [];

  function DrawerItem(type, text, href, shortText) {
    this.type = type;
    this.text = text;
    this.href = href;
    this.shortText = shortText || text;
  }

  var legacy = [
  new DrawerItem("search",
  "Search for a story, theme, or producer",
  "http://www.prx.org/search/all", "Search"),
  new DrawerItem("category",
  "Stories", "http://www.prx.org/pieces", "Browse"),
  new DrawerItem("item", "Diary", "http://www.prx.org/format/Diary"),
  new DrawerItem("item", "Documentary", "http://www.prx.org/format/Documentary"),
  new DrawerItem("item", "Essay", "http://www.prx.org/format/Essay"),
  new DrawerItem("item", "Fiction", "http://www.prx.org/format/Fiction"),
  new DrawerItem("item", "News Reporting", "http://www.prx.org/format/News%20Reporting"),
  new DrawerItem("item", "Special", "http://www.prx.org/format/Special"),
  new DrawerItem("category", "Sign In", "http://www.prx.org/sessions/new")
  ];

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
    templateUrl:'drawer/toggle_button.html',
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
      if (timeout == -1) {
        fn.apply(this, arguments);
        timeout = $timeout(function () { timeout = 0; }, duration);
      } else {
        if (timeout) {
          $timeout.cancel(timeout);
        }
        timeout = $timeout(trigger(this, arguments), duration);
      }
    }

    debouncedVersion.toString = function () {
      return fn.toString();
    };

    return debouncedVersion;
  }
})
.directive('prxNavButtons', function ($window, quickDebounce) {
  return {
    restrict: 'E',
    templateUrl: 'drawer/nav_buttons.html',
    require: '^prxDrawer',
    replace: true,
    link: function (scope, elem, attrs, ctrl) {
      var debouncedCheckWidth = quickDebounce(checkWidth);
      checkWidth();

      angular.element($window).on('resize', debouncedCheckWidth);
      scope.$on('$destroy', function () {
        angular.element($window).off('resize', debouncedCheckWidth);
      });

      function checkWidth () {
        ctrl.setMaxNavItems(~~(elem[0].offsetWidth / 70));
      }
    }
  };
})
.directive('prxNavItem', function () {
  return {
    restrict: 'E',
    templateUrl: 'drawer/nav_item.html',
    replace: true,
    controller: 'NavItemCtrl',
    controllerAs: 'navItem',
    scope: { 'item': '=' },
    bindToController: true
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
