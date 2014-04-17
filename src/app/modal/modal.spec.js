describe('prx.modal', function () {
  beforeEach(module('prx.modal'));

  describe('state instrumentation', function () {
    var $scope, instrumentableState, $state, $compile;

    beforeEach(module(function ($provide) {
      $provide.value('$state', jasmine.createSpyObj('$state', ['href']));
    }));

    beforeEach(inject(function ($rootScope, _$state_, _$compile_) {
      $scope = $rootScope;
      $state = _$state_;
      $compile = _$compile_;
      instrumentableState = {
        views: {
          'modal@': {
            template: ''
          }
        }
      };
    }));

    it ('is triggered by $stateChangeStart', function () {
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
      expect(instrumentableState.views['modal@'].instrumented).toBe(true);
    });

    it ('sets the modal data attribute to true', function () {
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
      expect(instrumentableState.data.modal).toBe(true);
    });

    function getLink(data) {
      var div = angular.element('<div></div>');
      $compile(div.html(data))($scope);
      $scope.$digest();
      return div.children().eq(0);
    }

    it ('prefixes string templates with a link', function () {
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
      var link = getLink(instrumentableState.views['modal@'].template);
      expect(link.attr('ui-sref')).toEqual('^');
      expect(link.hasClass('dismiss')).toBe(true);
    });

    it ('hides the prefixed link when undismissable', function () {
      $state.href.and.returnValue(undefined);
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
      var link = getLink(instrumentableState.views['modal@'].template);
      expect(link.hasClass('ng-hide')).toBe(true);
    });

    it ('shows the prefixed link when dismissable', function () {
      $state.href.and.returnValue('/');
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
      var link = getLink(instrumentableState.views['modal@'].template);
      expect(link.hasClass('ng-hide')).toBe(false);
    });

    it ('does nothing when there is nothing to be done', function () {
      instrumentableState.views['modal@'].template = undefined;
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
    });

    it ('turns url templates into providers that prefix', inject(function ($injector, $templateCache) {
      var data, link;
      $templateCache.put('/foo.html', "<h1>html</h1>");
      instrumentableState.views['modal@'].template = undefined;
      instrumentableState.views['modal@'].templateUrl = '/foo.html';
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
      expect(instrumentableState.views['modal@'].templateUrl).not.toBeDefined();
      $injector.invoke(instrumentableState.views['modal@'].templateProvider, null, {$stateParams: {}}).then(function (result) {
        data = result;
      });
      $scope.$digest();
      expect(data).toBeDefined();
      link = getLink(data);
      expect(link.attr('ui-sref')).toEqual('^');
      expect(link.hasClass('dismiss')).toBe(true);
    }));

    it ('works with function templateUrls', inject(function ($templateCache, $injector) {
      var data, link;
      $templateCache.put('/foo.html', "<h1>html</h1>");
      instrumentableState.views['modal@'].template = undefined;
      instrumentableState.views['modal@'].templateUrl = function (params) {
        return '/' + params.hokey + '.html';
      };
      $scope.$broadcast('$stateChangeStart', instrumentableState, {}, {});
      expect(instrumentableState.views['modal@'].templateUrl).not.toBeDefined();
      $injector.invoke(instrumentableState.views['modal@'].templateProvider, null, {$stateParams: {hokey: 'foo'}}).then(function (result) {
        data = result;
      });
      $scope.$digest();
      expect(data).toBeDefined();
      link = getLink(data);
      expect(link.attr('ui-sref')).toEqual('^');
      expect(link.hasClass('dismiss')).toBe(true);
    }));
  });

  describe ('visibility', function () {
    var modal, $scope;
    beforeEach(inject(function (prxModal, $rootScope) {
      modal = prxModal;
      $scope = $rootScope;
    }));

    it ('is shown on state change start when coming from an abstract state', function () {
      $scope.$broadcast('$stateChangeStart', {data:{modal:true}}, {}, {abstract:true});
      expect(modal.visible).toBe(true);
    });

    it ('is shown on success', function () {
      $scope.$broadcast('$stateChangeSuccess', {data:{modal:true}}, {}, {});
      expect(modal.visible).toBe(true);
    });

    it ('is hidden when state is not a modal state', function () {
      modal.visible = true;
      $scope.$broadcast('$stateChangeSuccess', {}, {}, {});
      expect(modal.visible).toBe(false);
    });
  });


  describe ('ModalCtrl', function () {
    var error, modal, controller;

    beforeEach(inject(function ($controller) {
      error = jasmine.createSpyObj('prxError', ['hasError']);
      modal = {visible: false};
      controller = $controller('ModalCtrl', {
        prxError: error,
        prxModal: modal
      });
    }));

    it ('is error when prxError has error', function () {
      error.hasError.and.returnValue(true);
      expect(controller.error()).toBe(true);
    });

    it ('is visible when prxError has error', function () {
      error.hasError.and.returnValue(true);
      expect(controller.visible()).toBe(true);
    });

    it ('is visible when prxError has no error but modal is visible', function () {
      modal.visible = true;
      expect(controller.visible()).toBe(true);
    });

    it ('is not visible otherwise', function () {
      expect(controller.visible()).toBe(false);
    });
  });

  describe ('directive', function () {
    it ('compiles', inject(function ($compile) {
      $compile('<prx-modal></prx-modal>');
    }));
  });
});
