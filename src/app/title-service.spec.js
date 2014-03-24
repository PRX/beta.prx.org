describe('title service', function () {
  var stateTitle, $state, $rootScope;

  beforeEach(module('prx.title', function ($stateProvider) {
    $stateProvider.state('base', {
      title: 'base'
    }).state('base.noTitle', {
      resolve: {
        foo: function () {
          return 'fooFromResolve';
        }
      }
    }).state('base.noTitle.nested', {
      title: function (foo) {
        return [foo, "transform"];
      }
    })
    .state('base.noTitle.nested.againNoTitle', {
    }).state('base.noTitle.nested.againNoTitle.last', {
      resolve: {
        foo: function () { return 'overrideResolve'; }
      },
      title: ['foo', function (foo) {
        return foo;
      }]
    });
  }));

  beforeEach(inject(function (_stateTitle_, _$state_, _$rootScope_) {
    stateTitle = _stateTitle_; $state = _$state_; $rootScope = _$rootScope_;
    $state.go('base.noTitle.nested.againNoTitle.last');
    $rootScope.$digest();
  }));

  it ('works', function () {
    expect(stateTitle.string).toEqual("base » fooFromResolve » transform » overrideResolve");
  });

  it ('returns string for toString', function () {
    expect(stateTitle.string).toEqual(stateTitle.toString());
  });

  it ('can set prefix', function () {
    stateTitle.setPrefix('asdf');
    expect(stateTitle.string).toEqual("asdf » base » fooFromResolve » transform » overrideResolve");
  });

  it ('can reset prefix', function () {
    stateTitle.setPrefix('asdf');
    $state.go('base.noTitle.nested.againNoTitle');
    $rootScope.$digest();
    expect(stateTitle.string).toEqual("asdf » base » fooFromResolve » transform");
    stateTitle.setPrefix('foo');
    expect(stateTitle.string).toEqual("foo » base » fooFromResolve » transform");
  });

  describe ('directive', function () {
    var $compile, $scope;
    beforeEach(inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    }));

    it ('sets the prefix', function () {
      spyOn(stateTitle, 'setPrefix');
      $compile("<title>asd</title>")($scope);
      expect(stateTitle.setPrefix).toHaveBeenCalled();
      expect(stateTitle.setPrefix.calls.mostRecent().args[0]).toEqual('asd');
    });

    it ('sets the value', function () {
      var elm = $compile("<title>foo</title>")($scope);
      $state.go('base.noTitle.nested.againNoTitle.last');
      $rootScope.$digest();
      expect(elm.text()).toEqual("foo » base » fooFromResolve » transform » overrideResolve");
    });
  });

});
