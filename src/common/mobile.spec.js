describe('ngMobile', function () {
  beforeEach(module('ngMobile'));
  describe ('ngMobileOS', function () {

    function setUA(uaString, fun) {
      return function () {
        module(function ($provide) {
          $provide.decorator('$window', function () {
            return {
              navigator: {
                userAgent: uaString
              }
            };
          });
        });
        return inject(fun);
      };
    }

    it ('detects android', setUA('android', function (ngMobileOS) {
      expect(ngMobileOS.android).toBe(true);
    }));

    it ('detects android as not iOS', setUA('Android', function (ngMobileOS) {
      expect(ngMobileOS.iOS).toBe(false);
    }));

    it ('detects iPads', setUA('iPad', function (ngMobileOS) {
      expect(ngMobileOS.iOS).toBe(true);
    }));

    it ('detects iPhones', setUA('iPhone', function (ngMobileOS) {
      expect(ngMobileOS.iOS).toBe(true);
    }));

    it ('detects iPods', setUA('iPod', function (ngMobileOS) {
      expect(ngMobileOS.iOS).toBe(true);
    }));

    it ('detects android as mobile', setUA('Android', function (ngMobileOS) {
      expect(ngMobileOS.isMobile).toBe(true);
    }));

    it ('detects iOS as mobile', setUA('iPhone', function (ngMobileOS) {
      expect(ngMobileOS.isMobile).toBe(true);
    }));

    it ('detects non-mobile browsers', setUA('firefox', function (ngMobileOS) {
      expect(ngMobileOS.isMobile).toBe(false);
    }));
  });

  describe ('directives', function () {
    var elem, container, $compile, $scope, ngMobileOS;

    beforeEach(inject( function ($rootScope, _$compile_, _ngMobileOS_) {
      ngMobileOS = _ngMobileOS_;
      $compile = _$compile_;
      $scope = $rootScope;

      container = angular.element('<div></div>');
      elem = container.clone();
      container.append(elem);
    }));

    it ('hides ios-only elements with android ua', function () {
      ngMobileOS.android = true;
      ngMobileOS.iOS = false;
      ngMobileOS.isMobile = true;
      elem.attr('ios-only', true);
      expect($compile(container)($scope).contents().length).toBe(0);
    });

    it ('hides android-only elements with ios ua', function () {
      ngMobileOS.iOS = true;
      ngMobileOS.android = false;
      ngMobileOS.isMobile = true;
      elem.attr('android-only', true);
      expect($compile(container)($scope).contents().length).toBe(0);
    });

    it ('does not hide ios-only elements with desktop ua', function () {
      ngMobileOS.iOS = false;
      ngMobileOS.isMobile = false;
      elem.attr('ios-only', true);
      expect($compile(container)($scope).contents().length).toBe(1);
    });

    it ('does not hide android-only elements with desktop ua', function () {
      ngMobileOS.android = false;
      ngMobileOS.isMobile = false;
      elem.attr('android-only', true);
      expect($compile(container)($scope).contents().length).toBe(1);
    });

    it ('hides mobile-only elements with desktop ua', function () {
      ngMobileOS.isMobile = false;
      elem.attr('mobile-only', true);
      expect($compile(container)($scope).contents().length).toBe(0);
    });

    it ('does not hide mobile-only elements with mobile ua', function () {
      ngMobileOS.isMobile = true;
      elem.attr('mobile-only', true);
      expect($compile(container)($scope).contents().length).toBe(1);
    });
  });

});
