describe('storytime', function () {
  beforeEach(module('prx.home.storytime'));

  describe('MailChimp service', function () {
    var MailChimp, $httpBackend;

    beforeEach(inject(function (_MailChimp_, _$httpBackend_) {
      MailChimp = _MailChimp_;
      $httpBackend = _$httpBackend_;
    }));

    it ('has a subscribe method', function () {
      expect(angular.isFunction(MailChimp.subscribe)).toBe(true);
    });

    it ('calls to mailchimp', function () {
      $httpBackend.expectJSONP(new RegExp("https://prx.us3.list-manage.com/subscribe/post-json.*EMAIL=test@example.com")).respond({});
      MailChimp.subscribe('test@example.com');
      $httpBackend.flush();
    });

    it ('resolves when mailchimp succeeds', function () {
      $httpBackend.whenJSONP(new RegExp("https://prx.us3.list-manage.com/subscribe/post-json")).respond({result: "success", msg: "hooray!"});
      var promise = MailChimp.subscribe('test@example.com');
      $httpBackend.flush();
      expect(promise).toResolveTo("hooray!");
    });

    it ('rejects when mailchimp fails', function () {
      $httpBackend.whenJSONP(new RegExp("https://prx.us3.list-manage.com/subscribe/post-json")).respond({result: "error", msg: "error!"});
      var promise = MailChimp.subscribe('error?');
      var caught = promise.catch(angular.identity);
      $httpBackend.flush();
      expect(promise).not.toResolve();
      expect(caught).toResolveTo("error!");
    });

    it ('rejects when an http error occurs', function () {
      $httpBackend.whenJSONP(new RegExp("https://prx.us3.list-manage.com/subscribe/post-json")).respond(500, {});
      var promise = MailChimp.subscribe('error?');
      var caught = promise.catch(angular.identity);
      $httpBackend.flush();
      expect(promise).not.toResolve();
      expect(caught).toResolve();
    });

  });

  describe('StoryTimeErrorCtrl', function () {
    it ('attaches message to itself', inject(function ($controller) {
      expect($controller('StoryTimeErrorCtrl', {$stateParams: {message: 'asdf'}}).message).toEqual('asdf');
    }));
  });

  describe ('StoryTimeFormCtrl', function () {
    var ctrl, MailChimp;
    beforeEach(inject(function ($controller) {
      MailChimp = jasmine.createSpyObj('MailChimp', ['subscribe']);
      ctrl = $controller('StoryTimeFormCtrl', {MailChimp: MailChimp});
    }));

    it ('has a subscribe method', function () {
      expect(angular.isFunction(ctrl.subscribe)).toBe(true);
    });

    describe ('#subscribe', function () {
      var $q, $scope;

      beforeEach(inject(function (_$q_, $rootScope) {
        $q = _$q_;
        $scope = $rootScope;
        MailChimp.subscribe.and.returnValue($q.when("1"));
      }));


      it ('calls through to MailChimp.subscribe', function () {
        ctrl.subscribe();
        expect(MailChimp.subscribe).toHaveBeenCalled();
      });

      it ('passes the email currently scoped', function () {
        ctrl.email = "ASDF";
        ctrl.subscribe();
        expect(MailChimp.subscribe.calls.mostRecent().args[0]).toEqual("ASDF");
      });

      it ('sets #submitting to true', function () {
        ctrl.subscribe();
        expect(ctrl.submitting).toBe(true);
      });

      describe ('success', function () {
        beforeEach(function () {
          MailChimp.subscribe.and.returnValue($q.when("STRING"));
          ctrl.subscribe();
          $scope.$digest();
        });

        it ('sets message to whatever the subscribe call resolved to', function () {
          expect(ctrl.message).toEqual("STRING");
        });

        it ('sets subscribed to true', function () {
          expect(ctrl.subscribed).toBe(true);
        });

        it ('sets submitting to false', function () {
          expect(ctrl.submitting).toBe(false);
        });
      });

      describe ('failure', function () {
        var go;

        beforeEach(inject(function ($state) {
          MailChimp.subscribe.and.returnValue($q.reject("ERROR"));
          go = spyOn($state, 'go');
          ctrl.subscribe();
          $scope.$digest();
        }));

        it ('transitions to the .error state', function () {
          expect(go.calls.mostRecent().args[0]).toEqual('.error');
        });

        it ('passes the failure message as the message param', function () {
          expect(go.calls.mostRecent().args[1].message).toEqual("ERROR");
        });

        it ('sets submitting to false', function () {
          expect(ctrl.submitting).toBe(false);
        });
      });
    });
  });
});
