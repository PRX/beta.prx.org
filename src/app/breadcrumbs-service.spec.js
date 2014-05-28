describe('breadcrumb service', function () {
  var stateCrumbs, $state, $rootScope, $timeout;

  beforeEach(module('prx.breadcrumbs', function ($stateProvider) {
    $stateProvider.state('base', {
      url: '/base',
      title: 'base'
    }).state('base.noTitle', {
      url: '/:titleString',
      resolve: {
        foo: function () {
          return 'fooFromResolve';
        }
      }
    }).state('base.noTitle.nested', {
      url: '/okei',
      title: function (foo) {
        return foo;
      }
    })
    .state('base.noTitle.nested.againNoTitle', {
      url: '/123'
    }).state('base.noTitle.nested.againNoTitle.last', {
      url: '/asd',
      resolve: {
        foo: function () { return 'overrideResolve'; }
      },
      title: ['foo', function (foo) {
        return foo;
      }]
    });
  }));

  beforeEach(inject(function (_stateCrumbs_, _$state_, _$rootScope_, _$timeout_) {
    stateCrumbs = _stateCrumbs_; $state = _$state_; $rootScope = _$rootScope_; $timeout = _$timeout_;
    $rootScope.$apply(function () {
      $state.go('base.noTitle.nested.againNoTitle.last');
    });
    $timeout.flush();
  }));

  it ('works', function () {
    expect(stateCrumbs.title).toEqual("overrideResolve");
  });

  it ('returns title for toString', function () {
    expect(stateCrumbs.title).toEqual(stateCrumbs.toString());
  });

  it ('can set suffix', function () {
    stateCrumbs.setSuffix(' on PRX');
    expect(stateCrumbs.title).toEqual("overrideResolve on PRX");
  });

  it ('can reset suffix', function () {
    stateCrumbs.setSuffix('asdf');
    $state.go('base.noTitle.nested.againNoTitle');
    $timeout.flush();
    expect(stateCrumbs.title).toEqual("fooFromResolveasdf");
    stateCrumbs.setSuffix('foo');
    expect(stateCrumbs.title).toEqual("fooFromResolvefoo");
  });

  describe ('directive', function () {
    var $compile, $scope;
    beforeEach(inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    }));

    it ('sets the suffix', function () {
      spyOn(stateCrumbs, 'setSuffix');
      $compile("<title>asd</title>")($scope);
      expect(stateCrumbs.setSuffix).toHaveBeenCalled();
      expect(stateCrumbs.setSuffix.calls.mostRecent().args[0]).toEqual(' on asd');
    });
  });

});
