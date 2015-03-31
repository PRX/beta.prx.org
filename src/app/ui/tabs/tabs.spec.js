describe('tabs', function () {
  var $compile, $scope;
  beforeEach(module('prx.ui.tabs', function ($stateProvider) {
    $stateProvider.state('root', {
      url: '/?key'
    }).state('noreloadonsearch', {
      url: '/nr?key&key2',
      reloadOnSearch: false
    });
  }));

  beforeEach(inject(function (_$compile_, $rootScope) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
  }));

  function TabsHelper() {
    var args = [].slice.call(arguments, 0), state;
    if (args[0].indexOf('<') === -1) {
      state = args.shift();
    }
    this.uncompiled = ['<xi-tabs' + (state ? ' state-param="'+state+'"' : '') +
    '>'].concat(args, '</xi-tabs>').join('');
    this.elem = $compile(this.uncompiled)($scope);
    $scope.$digest();
  }

  TabsHelper.prototype = {
    length: function () {
      return this.elem.children().eq(0).children().length;
    },
    isInBounds: function (index) {
      return index >= 0 && index < this.length();
    },
    getTab: function (index) {
      if (this.isInBounds(index)) {
        return this.elem.children().eq(0).children().eq(index);
      }
    },
    clickTab: function (index) {
      if (this.isInBounds(index)) {
        this.getTab(index).children().triggerHandler('click');
        $scope.$digest();
      }
    },
    getActiveTabContent: function () {
      return this.elem.children().eq(1);
    }
  };

  it ('compiles', function () {
    $compile(angular.element('<xi-tabs></xi-tabs>'))($scope);
  });

  it ('can contain tabs', function () {
    var tabs = new TabsHelper('<xi-tab><xi-tab-name>Foo</xi-tab-name></xi-tab>');
    expect(tabs.getTab(0).text()).toEqual('Foo');
  });

  it ('traverses tabs', function () {
    var tabs = new TabsHelper(
      '<xi-tab><xi-tab-name>Foo</xi-tab-name></xi-tab>',
      '<xi-tab><xi-tab-name>Bar</xi-tab-name></xi-tab>'
    );

    expect(tabs.getTab(0).hasClass('active')).toBeTruthy();

    tabs.clickTab(1);

    expect(tabs.getTab(0).hasClass('active')).toBeFalsy();
    expect(tabs.getTab(1).hasClass('active')).toBeTruthy();
  });

  it ('disables tabs', function () {
    var tabs = new TabsHelper(
      '<xi-tab><xi-tab-name>Foo</xi-tab-name></xi-tab>',
      '<xi-tab disabled="disabled"><xi-tab-name>Bar</xi-tab-name></xi-tab>'
    );

    tabs.clickTab(1);
    expect(tabs.getTab(0).hasClass('active')).toBeTruthy();
    expect(tabs.getTab(1).hasClass('active')).toBeFalsy();
  });

  it ('has content', function () {
    var tabs = new TabsHelper(
      '<xi-tab><xi-tab-name>Foo</xi-tab-name>',
      '<xi-tab-content>tab Content</xi-tab-content></xi-tab>'
    );

    expect(tabs.getActiveTabContent().text()).toEqual('tab Content');
  });

  describe('with states', function () {
    var $stateParams, $state;

    beforeEach(inject(function (_$stateParams_, _$state_) {
      $stateParams = _$stateParams_;
      $state = _$state_;
      $state.go('root');
    }));

    it ('can set active state from state params', function () {
      $stateParams.key = 'bar';
      var tabs = new TabsHelper('key',
        '<xi-tab key="foo"><xi-tab-name>Foo</xi-tab-name></xi-tab>',
        '<xi-tab key="bar"><xi-tab-name>Bar</xi-tab-name></xi-tab>',
        '<xi-tab key="baz" disabled=disabled><xi-tab-name>Bar</xi-tab-name></xi-tab>'
      );

      expect(tabs.getTab(0).hasClass('active')).toBeFalsy();
      expect(tabs.getTab(1).hasClass('active')).toBeTruthy();
    });

    it ('activates state correctly', function () {
      var tabs = new TabsHelper('key',
        '<xi-tab key="foo"><xi-tab-name>Foo</xi-tab-name></xi-tab>',
        '<xi-tab key="bar"><xi-tab-name>Bar</xi-tab-name></xi-tab>',
        '<xi-tab key="baz" disabled=disabled><xi-tab-name>Bar</xi-tab-name></xi-tab>'
      );

      tabs.clickTab(1);
      expect($stateParams.key).toEqual('bar');
    });


    describe ('with noreloadonsearch', function () {
      beforeEach(inject(function ($state) {
        $state.go('noreloadonsearch');
      }));

      it ('activates state correctly', function () {

        var tabs = new TabsHelper('key',
          '<xi-tab key="foo"><xi-tab-name>Foo</xi-tab-name></xi-tab>',
          '<xi-tab key="bar"><xi-tab-name>Bar</xi-tab-name></xi-tab>',
          '<xi-tab key="baz" disabled=disabled><xi-tab-name>Bar</xi-tab-name></xi-tab>'
        );

        tabs.clickTab(1);
        expect($stateParams.key).toEqual('bar');
      });

      it ('removes state from with nested tabs when navigating between tabs', function () {
        $state.go('noreloadonsearch', {key: 'foo', key2: 'bing'});
        var nestedTabs = new TabsHelper('key2',
          '<xi-tab key="baz"><xi-tab-name>Baz</xi-tab-name></xi-tab>',
          '<xi-tab key="bing"><xi-tab-name>Bing</xi-tab-name></xi-tab>'
        ).uncompiled;
        var tabs = new TabsHelper('key',
          '<xi-tab key="foo"><xi-tab-name>Foo</xi-tab-name><xi-tab-content>',
          nestedTabs, '</xi-tab-content></xi-tab>',
          '<xi-tab key="bar"><xi-tab-name>Bar</xi-tab-name><xi-tab-content>',
          nestedTabs, '</xi-tab-content></xi-tab>'
        );
        expect($stateParams.key2).toEqual('bing');
        tabs.clickTab(1);
        expect($stateParams.key).toEqual('bar');
        expect($stateParams.key2).toBeUndefined();
      });

      it ('works with nested tabs that do not write to state', function () {
        $state.go('noreloadonsearch', {key: 'foo', key2: 'bing'});
        var nestedTabs = new TabsHelper(
          '<xi-tab><xi-tab-name>Baz</xi-tab-name></xi-tab>',
          '<xi-tab><xi-tab-name>Bing</xi-tab-name></xi-tab>'
        ).uncompiled;
        var tabs = new TabsHelper('key',
          '<xi-tab key="foo"><xi-tab-name>Foo</xi-tab-name><xi-tab-content>',
          nestedTabs, '</xi-tab-content></xi-tab>',
          '<xi-tab key="bar"><xi-tab-name>Bar</xi-tab-name><xi-tab-content>',
          nestedTabs, '</xi-tab-content></xi-tab>'
        );
        expect($stateParams.key2).toEqual('bing');
        tabs.clickTab(1);
        expect($stateParams.key).toEqual('bar');
        expect($stateParams.key2).toEqual('bing');
      });
    });
  });
});
