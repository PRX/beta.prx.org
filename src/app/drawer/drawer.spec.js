describe('prx.drawer', function () {
  beforeEach(module('templates', 'prx.drawer'));


  describe('DrawerItemCtrl', function () {
    var ctrl;
    beforeEach(inject(function ($controller) {
      ctrl = $controller('DrawerItemCtrl');
    }));

    it ('returns type in classes', function () {
      ctrl.item = {type: 'asd'};
      expect(ctrl.classes()).toContain('asd');
    });

    it ('returns href', function () {
      ctrl.item = {href: 'asd'};
      expect(ctrl.href()).toEqual('asd');
    });

    it ('returns text', function () {
      ctrl.item = {text: 'asd'};
      expect(ctrl.text()).toEqual('asd');
    });
  });

  describe ('NavButtonsCtrl', function () {
    var ctrl, PRXDrawer;
    beforeEach(inject(function (_PRXDrawer_, $controller) {
      ctrl = $controller('NavButtonsCtrl');
      PRXDrawer = _PRXDrawer_;
    }));

    it ('returns items that are not of type "item"', function () {
      PRXDrawer.items = [{type:'item'}];
      expect(ctrl.items().length).toBe(0);
      PRXDrawer.items = [{type:'item'}, {type:'item'}, {type:'item'}, {type:'one'}];
      expect(ctrl.items().length).toBe(1);
    });
  });

  describe ('NavItemCtrl', function () {
    var ctrl;
    beforeEach(inject(function ($controller) {
      ctrl = $controller('NavItemCtrl');
    }));

    it ('returns shortText', function () {
      ctrl.item = {shortText: 'asd'};
      expect(ctrl.text()).toBe('asd');
    });

    it ('returns type', function () {
      ctrl.item = {type: 123};
      expect(ctrl.type()).toBe(123);
    });

    it ('returns href', function () {
      ctrl.item = {href: 'asd'};
      expect(ctrl.href()).toBe('asd');
    });
  });

  describe ('PRXDrawer', function () {
    describe ('provider', function () {
      var drawerProvider;
      var PRXDrawer;
      beforeEach(module(function (PRXDrawerProvider) {
        drawerProvider = PRXDrawerProvider;
      }));

      // to cause the config block to run, and clean up old runs.
      beforeEach(inject(function () { PRXDrawer = undefined; }));

      function getDrawer() {
        if (!PRXDrawer) {
          inject(function (_PRXDrawer_) {
            PRXDrawer = _PRXDrawer_;
          });
        }

        return PRXDrawer;
      }

      it ('permits registration of menu items', function () {
        drawerProvider.register({
          name: 'Search',
          icon: 'search',
          directive: '<prx-search-in-nav>'
        });
      });

      it ('includes registered menu items after injection', function () {
        drawerProvider.register({
          name: 'Search'
        });

        expect(getDrawer().items[0].name).toEqual('Search');
      });

      it ('can register items that are always in nav', function () {
        drawerProvider.register({
          name: 'Search',
          nav: true
        });

        expect(getDrawer().navItems()[0].name).toEqual('Search');
      });

      it ('can register things that are in the nav when there is room', function () {
        drawerProvider.register({
          name: 'Browse',
        }).register({
          name: 'Search',
          nav: true
        }).register({
          name: 'SignUp',
          nav: true
        });

        expect(getDrawer().navItems(2).length).toEqual(2);
        expect(getDrawer().navItems(2)[0].name).toEqual('Search');
        expect(getDrawer().drawerItems(2).length).toEqual(1);
      });

      it ('orders things by weight', function () {
        drawerProvider.register({
          name: 'Browse'
        }).register({
          name: 'SignUp',
          nav: true,
          weight: drawerProvider.LAST
        }).register({
          name: 'Search',
          weight: drawerProvider.FIRST,
          nav: true
        });

        var sortedItems = getDrawer().drawerItems(0);

        expect(sortedItems[0].name).toEqual('Search');
        expect(sortedItems[1].name).toEqual('Browse');
        expect(sortedItems[2].name).toEqual('SignUp');
      });

      it ('combines nav sorting with weight sorting', function () {
        drawerProvider.register({
          name: 'Browse'
        }).register({
          name: 'Other',
          weight: drawerProvider.HIGH
        }).register({
          name: 'SignUp',
          nav: true,
          weight: drawerProvider.LAST
        }).register({
          name: 'Search',
          weight: drawerProvider.FIRST,
          nav: true
        });

        var navItems = getDrawer().navItems(3);
        expect(navItems[0].name).toEqual('Search');
        expect(navItems[1].name).toEqual('Other');
        expect(navItems[2].name).toEqual('SignUp');

        navItems = getDrawer().navItems(2);
        expect(navItems[0].name).toEqual('Search');
        expect(navItems[1].name).toEqual('SignUp');
        expect(getDrawer().drawerItems(2)[0].name).toEqual('Other');
        expect(getDrawer().drawerItems(2)[1].name).toEqual('Browse');
      });
    });

    describe ('service', function () {
      var PRXDrawer;
      beforeEach(inject(function (_PRXDrawer_) {
        PRXDrawer = _PRXDrawer_;
      }));

      it ('toggles', function () {
        PRXDrawer.open = false;
        PRXDrawer.toggle();
        expect(PRXDrawer.open).toBe(true);
        PRXDrawer.toggle();
        expect(PRXDrawer.open).toBe(false);
      });

      it ('has navItems()', function () {
        expect(PRXDrawer.navItems()).toEqual([]);
      });
    });
  });

  describe ('prxDrawerToggle directive', function () {
    var elem, drawer, scope;

    beforeEach(inject(function ($compile, PRXDrawer, $rootScope) {
      elem = angular.element('<a prx-drawer-toggle></>');
      drawer = PRXDrawer;
      spyOn(PRXDrawer, 'toggle');
      scope = $rootScope.$new();
      elem = $compile(elem)(scope);
    }));

    it ('toggles drawer on click', function () {
      elem.triggerHandler('click');
      expect(drawer.toggle).toHaveBeenCalled();
    });

    it ('cleans up', function () {
      scope.$emit('$destroy');
      elem.triggerHandler('click');
      expect(drawer.toggle).not.toHaveBeenCalled();
    });
  });

  describe ('prxDrawer directive', function () {
    it ("compiles", inject(function ($compile, $rootScope, PRXDrawer, $window) {
      var elem = $compile('<prx-drawer>')($rootScope.$new());
      $rootScope.$digest();
      expect(elem.scope().drawer).toBe(PRXDrawer);
    }));
  });

  describe ('prxNavButtons directive', function () {
    it ("compiles", inject(function ($compile, $rootScope) {
      $compile('<prx-nav-buttons>')($rootScope);
    }));
  });

});
