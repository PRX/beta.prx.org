describe('prx.drawer', function () {
  beforeEach(module('templates', 'prx.drawer'));
  var $controller;

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  describe('DrawerItemCtrl', function () {
    var ctrl;
    beforeEach(function () {
      ctrl = $controller('DrawerItemCtrl');
    });

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
    beforeEach(inject(function (_PRXDrawer_) {
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
    beforeEach(function () {
      ctrl = $controller('NavItemCtrl');
    });

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
