describe('prx.pick_list', function () {

  beforeEach(module('prx.pick_list', 'angular-hal-mock'));

  describe('prxPickList directive', function () {
    var $compile, $scope, element, ngHal;

    beforeEach(module('templates'));

    beforeEach(inject(function (_$compile_, $rootScope, _ngHal_, _$timeout_) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      $timeout = _$timeout_;
      ngHal = _ngHal_;

    }));

    it ('compiles', function () {
      var picklist = ngHal.mock('http://meta.prx.org/model/pick_list');
      $scope.picklist = picklist;
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      expect(element).toBeDefined();
    });

    it ('sets loading to true before a picklist is set on scope', function() {
      var picklist = ngHal.mock('http://meta.prx.org/model/pick_list');
      $scope.picklist = picklist;
      element = $compile('<prx-pick-list picklist=""></prx-pick-list>')($scope);
      $scope.$digest();
      $timeout.flush();
      expect(element.isolateScope().loading).toBe(true);
    });

    it ('sets loading to false after a picklist is set on scope and digested', function() {
      var picklist = ngHal.mock('http://meta.prx.org/model/pick_list');
      var picks = ngHal.mock('http://meta.prx.org/model/pick');
      var spy = picklist.stubFollow('prx:picks', picks);
      var spy2 = picks.stubFollow('prx:items', ngHal.mock());
      $scope.picklist = picklist;
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(false);
    });

    it ('does not set loading to true if it is already defined and false', function() {
      var picklist = ngHal.mock('http://meta.prx.org/model/pick_list');
      var picks = ngHal.mock('http://meta.prx.org/model/pick');
      var spy = picklist.stubFollow('prx:picks', picks);
      var spy2 = picks.stubFollow('prx:items', ngHal.mock());
      $scope.picklist = picklist;
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      $timeout.flush();
      expect(element.isolateScope().loading).toBe(false);
    });

     it ('sets a filtered list of picks on its scope', function() {
      var picklist = ngHal.mock('http://meta.prx.org/model/pick_list');
      var picks = ngHal.mock('http://meta.prx.org/model/pick');
      var items = function() { return 'sigil'};
      var spy = picklist.stubFollow('prx:picks', picks);
      var spy2 = picks.stubFollow('prx:items', items);
      $scope.picklist = picklist;
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      expect(element.isolateScope().filteredPicks).toBe(items);
    });

  });

  describe('prxPick directive', function () {
    var $compile, $scope, element, ngHal;

    beforeEach(module('templates'));

    beforeEach(inject(function (_$compile_, $rootScope, _ngHal_, _$timeout_) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      $timeout = _$timeout_;
      ngHal = _ngHal_;

    }));

    it ('compiles', function () {
      var pick = ngHal.mock('http://meta.prx.org/model/pick');
      $scope.pick = pick;
      element = $compile('<prx-pick pick="pick"></prx-pick>')($scope);
      $scope.$digest();
      expect(element).toBeDefined();
    });


    it ('sets the story for the pick', function() {
      var pick = ngHal.mock('http://meta.prx.org/model/pick');
      var story = function() { return 'sigil' };
      var spy = pick.stubFollow('prx:story', story);
      $scope.pick = pick;
      element = $compile('<prx-pick pick="pick"></prx-pick>')($scope);
      $scope.$digest();
      expect(element.isolateScope().story).toBe(story);
    });

    it ('sets the account for the pick', function() {
      var pick = ngHal.mock('http://meta.prx.org/model/pick');
      var account = function() { return 'sigil' };
      var spy = pick.stubFollow('prx:account', account);
      $scope.pick = pick;
      element = $compile('<prx-pick pick="pick"></prx-pick>')($scope);
      $scope.$digest();
      expect(element.isolateScope().account).toBe(account);
    });

  });

});
