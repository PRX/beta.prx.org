describe('prx.errors', function () {
  beforeEach(module('prx.errors'));

  describe('directive', function () {
    it ('compiles', inject(function ($compile) {
      $compile('<prx-error-modal></prx-error-modal>');
    }));
  });

  describe ('controller', function () {
    var controller, errors;

    beforeEach(inject(function (_prxError_, $controller) {
      errors = _prxError_;
      angular.forEach(errors, function (method, name) {
        if (angular.isFunction(method)) {
          spyOn(errors, name);
        }
      });
      controller = $controller('ErrorCtrl');
    }));

    it ('proxies show to hasError', function () {
      errors.hasError.and.returnValue(true);
      expect(controller.show()).toEqual(true);
    });
  });

  describe('events', function () {
    it ('triggers stateChangeError on $event', inject(function ($rootScope, prxError) {
      spyOn(prxError, 'stateChangeError');
      $rootScope.$broadcast('$stateChangeError');
      expect(prxError.stateChangeError).toHaveBeenCalled();
    }));
  });

  describe ('service', function () {
    var prxError;
    beforeEach(inject(function (_prxError_) {
      prxError = _prxError_;
    }));

    it ('can trigger StateChangeErrors', function () {
      prxError.stateChangeError({}, {}, {}, {}, '');
      expect(prxError.hasError()).toBe(true);
    });

    it ('can not go back to an abstract state', function () {
      prxError.stateChangeError({}, {}, {abstract: true}, {}, '');
      expect(prxError.canGoBack()).toBe(false);
    });

    it ('goes back by passing fromState', inject(function ($state) {
      spyOn($state, 'go');
      prxError.stateChangeError({}, {}, {asd:1}, {foo: 2}, '');
      prxError.goBack();
      expect($state.go).toHaveBeenCalled();
      expect($state.go.calls.mostRecent().args[0]).toEqual({asd:1});
    }));

    it ('retries by passing toState', inject(function ($state) {
      spyOn($state, 'go');
      prxError.stateChangeError({asd: 1}, {}, {foo: 1}, {}, '');
      prxError.retry();
      expect($state.go).toHaveBeenCalled();
      expect($state.go.calls.mostRecent().args[0]).toEqual({asd:1});
    }));

    it ('cant retry when the error was a 404', function () {
      prxError.stateChangeError({}, {}, {}, {}, {status:404});
      expect(prxError.canRetry()).toBe(false);
    });

    it ('is not debuggable when the error was a 404', function () {
      prxError.stateChangeError({}, {}, {}, {}, {status:404});
      expect(prxError.debuggable()).toBe(false);
    });

    it ('can set headline and message for a general error', function () {
      prxError.generalError('asd', '123');
      expect(prxError.headline()).toEqual('asd');
      expect(prxError.message()).toEqual('123');
    });

    it ('gets the object for debugging', function () {
      var e = prxError.generalError();
      expect(prxError.object()).toEqual(e);
    });
  });

});
