describe('prx.picks', function () {

  beforeEach(module('prx.picks', 'angular-hal-mock'));

  describe ('Pick mixin', function () {

    it('gets the story and account', inject(function (ngHal) {
      var mock = ngHal.mock('http://meta.prx.org/model/pick/foo');
      var story = ngHal.mock('http://meta.prx.org/model/story');
      mock.stubFollow('prx:story', story);
      var account = ngHal.mock('http://meta.prx.org/model/account');
      mock.stubFollow('prx:account', account);
      mock.transform();
      expect(mock.story).toEqual(story);
      expect(mock.account).toEqual(account);
    }));
  });

  describe('prxPick directive', function () {
    var $compile, $scope, element, ngHal;
    var pick;

    beforeEach(module('templates'));

    beforeEach(inject(function (_$compile_, $rootScope, _ngHal_) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      ngHal = _ngHal_;
      pick = ngHal.mock('http://meta.prx.org/model/pick/foo');
      $scope.pick = pick;
    }));

    it ('compiles', function () {
      element = $compile('<prx-pick pick="pick"></prx-pick>')($scope);
      $scope.$digest();
      expect(element).toBeDefined();
    });

  });

  describe ('PickCtrl', function () {
    var $controller, $scope;

    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
    }));

    it ('sets ctrl.current as $scope.picki', function () {
      $scope.picki = "foo";
      var ctrl = $controller('PickCtrl', {$scope: $scope});
      expect(ctrl.current).toEqual($scope.picki);
    });

    it ('sets ctrl.story as $scope.picki.story', function () {
      $scope.picki = {story: 'foo'};
      var ctrl = $controller('PickCtrl', {$scope: $scope});
      expect(ctrl.story).toEqual($scope.picki.story);
    });

    it ('sets the canShowMore when overflowing', function () {
      var ctrl = $controller('PickCtrl', {$scope: $scope});
      ctrl.setCommentOverflow(true);
      expect(ctrl.canShowMore).toBeTruthy();
    });

    it ('sets the canShowMore and shouldExpandComment when no longer overflowing', function () {
      var ctrl = $controller('PickCtrl', {$scope: $scope});
      ctrl.shouldExpandComment = true;
      ctrl.canShowMore = true;

      ctrl.setCommentOverflow(false);
      expect(ctrl.shouldExpandComment).toBeFalsy();
      expect(ctrl.canShowMore).toBeFalsy();
    });

    it ('collapses the comment when the collapse event comes', function () {
      var ctrl = $controller('PickCtrl', {$scope: $scope});
      ctrl.shouldExpandComment = true;

      $scope.$emit('collapse');
      expect(ctrl.shouldExpandComment).toBeFalsy();
    });

    it ('sets expand comment correctly', function () {
      var ctrl = $controller('PickCtrl', {$scope: $scope});
      var collapsed;
      $scope.$on('collapse', function () {
        collapsed = true;
      });
      ctrl.expandComment();
      expect(ctrl.shouldExpandComment).toBeTruthy();
      expect(collapsed).toBe(true);
    });
  });

  describe('OverflowCheck', function () {
    var OverflowCheck, $timeout;
    beforeEach(inject(function (_OverflowCheck_, _$timeout_) {
      OverflowCheck = _OverflowCheck_;
      $timeout = _$timeout_;
    }));

    it ('schedules a timeout when the watch is requested', function () {
      var elem = angular.element('<div>')[0],
        spy = jasmine.createSpy('cb');
      OverflowCheck.watch(elem, spy);
      $timeout.flush();
      expect(spy.calls.mostRecent().args[0]).toBe(false);
    });

    it ('cancels existing timeouts and schedules a new one when watches are requested back to back', function () {
      var elem = angular.element('<div>')[0];
      var elem2 = angular.element(elem).clone()[0];
      spyOn($timeout, 'cancel').and.callThrough();

      OverflowCheck.watch(elem, function () {});
      OverflowCheck.watch(elem2, function () {});
      expect($timeout.cancel).toHaveBeenCalled();
    });

    it ('allows unwatches', function () {
      var elem = angular.element('<div>');
      var elem2 = elem.clone();

      OverflowCheck.watch(elem[0], watcher);
      OverflowCheck.unwatch(elem[0], watcher2);
      OverflowCheck.unwatch(elem[0], watcher);
      OverflowCheck.unwatch(elem[0], watcher);
      OverflowCheck.watch(elem2[0], watcher);
      OverflowCheck.watch(elem2[0], watcher2);
      OverflowCheck.unwatch(elem2[0], watcher2);

      function watcher() {}
      function watcher2() {}
    });
  });

  describe('groupStandalonePicks filter', function () {
    var filter;
    beforeEach(inject(function ($filter) {
      filter = $filter('groupStandalonePicks');
    }));

    it ('does nothing with a non-array', function () {
      expect(filter(false)).toEqual(false);
    });

    it ('lumps a later standalone pick with an earlier one', function () {
      var picks = [{comment: "one"}, "pick1",{comment:true},"pick2", "pick3", {comment:true}];
      var sorted = filter(picks);
      expect(picks[0]).toEqual({comment: "one"});
      expect(picks[1]).toEqual("pick1");
      expect(picks[2]).toEqual("pick2");
      expect(picks[3]).toEqual({comment: true});
      expect(picks[4]).toEqual("pick3");
    });


  });

});
