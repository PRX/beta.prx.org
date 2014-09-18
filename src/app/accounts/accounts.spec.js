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

    it ('can get the old path for group accounts', inject(function (ngHal) {
      var account = ngHal.mock('http://meta.prx.org/model/account/group', {path: 'test'});
      expect(account.oldPath()).toEqual('/group/test');
    }));

    it ('can get the old path for station accounts', inject(function (ngHal) {
      var account = ngHal.mock('http://meta.prx.org/model/account/station', {path: 'test'});
      expect(account.oldPath()).toEqual('/station/test');
    }));

    it ('can get the old path for individual accounts', inject(function (ngHal) {
      var account = ngHal.mock('http://meta.prx.org/model/account/individual', {path: 'test'});
      expect(account.oldPath()).toEqual('/user/test');
    }));

    it ('returns account name for toString', inject(function (ngHal) {
      var account = ngHal.mock('http://meta.prx.org/model/account/test', {name: 'asd'});
      expect(account.toString()).toEqual('asd');
    }));

    it ('parses external links as websites', inject(function (ngHal) {
      var account = ngHal.mock('http://meta.prx.org/model/account/test', {
        _links: {
          'prx:external':[
            {
              href:'http://prx.org'
            },
            {
              href:'http://prx.mx'
            }
          ]
        }
      });
      expect(account.websites()[0].href).toEqual('http://prx.org');
      expect(account.websites()[1].href).toEqual('http://prx.mx');
      expect(account.websites(1)[1].href).toEqual('http://prx.mx');
    }));
  });

  describe('AccountCtrl', function () {
    it('attaches the account and recent, highlighted, and purchased stories', inject(function ($controller) {
      var controller = $controller('AccountCtrl', {
        account: 1,
        recentStories: 2,
        highlightedStories: 3,
        purchasedStories: 4
      });
      expect(controller.current).toBe(1);
      expect(controller.recentStories).toBe(2);
      expect(controller.highlightedStories).toBe(3);
      expect(controller.purchasedStories).toBe(4);
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
      var spy = mock.stubFollow('prx:items');
      $injector.invoke(state.resolve.recentStories, null, {
        storiesList: mock
      });
      expect(spy).toHaveBeenCalled();
    });

    it ('sets title appropriately', function () {
      expect($injector.invoke(state.title, null, {account: "test"})).toEqual('test’s Stories');
    });

    it ('adds a translation for the loaded account', inject(function (urlTranslate) {
      spyOn(urlTranslate, 'addTranslation');
      $injector.invoke(state.resolve.translateUrl, null, {account: {
        id: 212,
        oldPath: function () { return "asd"; }
      }});
      expect(urlTranslate.addTranslation.calls.mostRecent().args).toEqual(['/accounts/212', 'asd']);
    }));
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
      $scope.account = ngHal.mock('http://meta.prx.org/model/account');
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

  describe('onApproachEnd', function () {
    it ('triggers expression when scrolling close to the end', inject(function ($compile, $rootScope, $window) {
      var elem = angular.element("<div style='overflow-y:scroll;height:100px' on-approach-end='triggered=true'><div style='height:500px'></div></div>");
      var scope = $rootScope.$new();
      elem = $compile(elem)(scope);

      $window.document.body.appendChild(elem[0]);

      elem.triggerHandler('scroll');
      expect(scope.triggered).toBeFalsy();

      elem[0].scrollTop = 150;
      elem.triggerHandler('scroll');
      expect(scope.triggered).toBeTruthy();

      $window.document.body.removeChild(elem[0]);
    }));
  });
});
