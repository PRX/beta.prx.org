angular.module('prx.drawer', [])
.directive('prxDrawer', function (PRXDrawer) {
  return {
    restrict: 'E',
    templateUrl: 'drawer/container.html',
    transclude: true,
    replace: true,
    link: function (scope) {
      scope.drawer = PRXDrawer;
    }
  };
})
.directive('prxDrawerContents', function () {
  return {
    restrict: 'E',
    templateUrl: 'drawer/drawer.html',
    replace: true
  };
})
.directive('drawerItem', function () {
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
.controller('DrawerItemCtrl', function () {
  this.classes = function () {
    return [this.item.type];
  };
  this.href = function () {
    return this.item.href;
  };
  this.text = function () {
    return this.item.text;
  };
})
.service('PRXDrawer', function () {
  function DrawerItem(type, text, href, shortText) {
    this.type = type;
    this.text = text;
    this.href = href;
    this.shortText = shortText;
  }

  var drawer = this;
  this.open = false;
  this.items = [
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
    new DrawerItem("item", "Special", "http://www.prx.org/format/Special")
  ];
  this.toggle = function () {
    drawer.open = !drawer.open;
  };
})
.directive('prxDrawerToggle', function (PRXDrawer) {
  return {
    restrict: 'A',
    link: function (scope, elem) {
      function toggleDrawer() {
        scope.$apply(PRXDrawer.toggle);
      }

      elem.on('click', toggleDrawer);
      scope.$on('$destroy', function () {
        elem.off('click', toggleDrawer);
      });
    }
  };
})
.directive('prxNavButtons', function () {
  return {
    restrict: 'E',
    templateUrl: 'drawer/nav_buttons.html',
    controller: 'NavButtonsCtrl',
    controllerAs: 'navButtons',
    replace: true
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
.controller('NavButtonsCtrl', function (PRXDrawer, $filter) {
  this.items = function () {
    return $filter('filter')(PRXDrawer.items, function (item) {
      return item.type != "item";
    });
  };
})
.controller('NavItemCtrl', function () {
  this.text = function () {
    return this.item.shortText || this.item.text;
  };
  this.href = function () {
    return this.item.href;
  };
  this.type = function () {
    return this.item.type;
  };
});
