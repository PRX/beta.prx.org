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

  describe('prxPickList directive', function () {
    var $compile, $scope, element, ngHal;
    var picklist, picks, items, spy, spy2;

    beforeEach(module('templates'));

    beforeEach(inject(function (_$compile_, $rootScope, _ngHal_, _$timeout_) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      $timeout = _$timeout_;
      ngHal = _ngHal_;
      picklist = ngHal.mock('http://meta.prx.org/model/pick_list');
      $scope.picklist = picklist;
      picks = ngHal.mock('http://meta.prx.org/model/picks');
      items = ngHal.mock('http://meta.prx.org/model/items');
      spy = picklist.stubFollow('prx:picks', picks);
      spy2 = picks.stubFollow('prx:items', items);
    }));

    it ('compiles', function () {
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      expect(element).toBeDefined();
    });

    it ('sets loading to true before a picklist is set on scope', function() {
      element = $compile('<prx-pick-list picklist=""></prx-pick-list>')($scope);
      $scope.$digest();
      $timeout.flush();
      expect(element.isolateScope().loading).toBe(true);
    });

    it ('sets loading to false after a picklist is set on scope and digested', function() {
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(false);
    });

    it ('does not set loading to true if it is already defined and false', function() {
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      $timeout.flush();
      expect(element.isolateScope().loading).toBe(false);
    });

     it ('sets a filtered list of picks on its scope', function() {
      element = $compile('<prx-pick-list picklist="picklist"></prx-pick-list>')($scope);
      $scope.$digest();
      expect(element.isolateScope().filteredPicks).toBe(items);
    });

  });

  describe('prxPick directive', function () {
    var $compile, $scope, element, ngHal;
    var pick;

    beforeEach(module('templates'));

    beforeEach(inject(function (_$compile_, $rootScope, _ngHal_, _$timeout_) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      $timeout = _$timeout_;
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

});
