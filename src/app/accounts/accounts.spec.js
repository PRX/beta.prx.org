describe('accounts', function () {
  beforeEach(module('prx.accounts', 'angular-hal-mock'));

  describe ('account mixin', function () {
    it ('prefetches the image url and address', inject(function (ngHal, $rootScope) {
      var account = ngHal.mock('http://meta.prx.org/model/account/foo');
      account.stubFollow('prx:image', ngHal.mockEnclosure('http://meta.prx.org/model/image', 'image.png'));
      account.stubFollow('prx:address', ngHal.mock('http://meta.prx.org/model/address', {city: 'Springfield', state: "ST"}));
      account.transform();
      expect(account.imageUrl).toEqual('image.png');
      expect(account.address.toString()).toEqual("Springfield, ST");
    }));
  });

  describe('AccountCtrl', function () {
    it('attaches the account and recent stories', inject(function ($controller) {
      var controller = $controller('AccountCtrl', {
        account: 1,
        recentStories: 2
      });
      expect(controller.current).toBe(1);
      expect(controller.recentStories).toBe(2);
    }));
  });

  describe('AccountDetailsCtrl', function () {
    it('attaches the account', inject(function ($controller) {
      var controller = $controller('AccountDetailsCtrl', {
        account: 'asd'
      });
      expect(controller.current).toEqual('asd');
    }));
  });

  describe('states', function () {
    var state, $injector, ngHal;
    beforeEach(inject(function ($state, _$injector_, _ngHal_) {
      state = $state.get('account.show');
      $injector = _$injector_;
      ngHal = _ngHal_;
    }));

    it ('resolves account', function () {
      var spy = ngHal.stubFollow('prx:account', 'sigil');
      expect($injector.invoke(state.resolve.account, null, {
        $stateParams: {
          accountId: 123
        }
      })).toResolveTo('sigil');
      expect(spy.calls.mostRecent().args[0]).toEqual({id: 123});
    });

    it ('resolves recent stories', function () {
      var mock = ngHal.mock();
      var spy = mock.stubFollow('prx:stories', mock);
      var spy2 = mock.stubFollow('prx:items', 'sigil');
      expect($injector.invoke(state.resolve.recentStories, null, {
        account: mock
      })).toResolveTo('sigil');
      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  describe ('skip filter', function () {
    var $filter;
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
    }));

    it ('removes matching elements', function () {
      expect($filter('skip')([{id:1},{id:2}], {id:2})).toEqual([{id:1}]);
    });

    it ('is a noop when passed nothing', function () {
      expect($filter('skip')([{id:1}])).toEqual([{id:1}]);
    });
  });

  describe('accountRecentStories directive', function () {
    var $compile, $scope, element, ngHal;

    beforeEach(module('templates'));

    beforeEach(inject(function (_$compile_, $rootScope, _ngHal_) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      ngHal = _ngHal_;
      element = $compile('<prx-account-recent-stories account="account"></prx-account-recent-stories>')($scope);
    }));

    it ('compiles', function () {
      $scope.account = ngHal.mock('http://meta.prx.org/model/account')
      $scope.$digest();
      expect(element).toBeDefined();
    });

  });

  describe('limitToHtml directive', function () {
    var $compile, $scope, element, $sce, $timeout;
    beforeEach(inject(function (_$compile_, $rootScope, _$sce_, _$timeout_) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      $sce = _$sce_;
      $timeout = _$timeout_;
      element = $compile('<div limit-to-html="100" ng-bind-html="content"></div>')($scope);
    }));

    it ('compiles', function () {
      $scope.content = $sce.trustAsHtml("<h1>HI!</h1>");
      $scope.$digest();
      expect(element.html()).toEqual("<h1>HI!</h1>");
    });

    /*jshint multistr: true */
    it ('limits long content', function () {
      $scope.content = $sce.trustAsHtml('\
      <h1>This is longer than 100 letters.</h1>\
      <h1>This is longer than 100 letters.</h1>\
      <h1>This is longer than 100 letters.</h1>\
      <h1>This is longer than 100 letters.</h1>\
      <h1>This is longer than 100 letters.</h1>\
      <h1>This is longer than 100 letters.</h1>'.replace(/      /g,''));
      $scope.$digest();
      $timeout.flush();
      expect(element.html()).toEqual('\
      <h1>This is longer than 100 letters.</h1>\
      <h1>This is longer than 100 letters.</h1>\
      <h1>This is longer than 100 letters. ...</h1>'.replace(/      /g, ''));
      $scope.content = $sce.trustAsHtml('\
      <div><p>This is longer than 100 letters. \
      This is longer than 100 letters. \
      This is longer than 100 letters.</p> \
      <p>This is longer than 100 letters. \
      This is longer than 100 letters. \
      This is longer than 100 letters.</p></div>'.replace(/      /g,''));
      $scope.$digest();
      $scope.$digest();
      expect(element.html()).toEqual('<div><p>This is longer than 100 letters. This is longer than 100 letters. This is longer than 100 letters. ...</p></div>');
    });
  });
});
