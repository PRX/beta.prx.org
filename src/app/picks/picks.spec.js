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

    it ('sets loading to false when pick is an object', function() {
      element = $compile('<prx-pick pick="pick"></prx-pick>')($scope);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(false);
    });

    it ('sets loading to true when pick is a promise', inject(function($q) {
      $scope.pick = $q.defer().promise;
      element = $compile('<prx-pick pick="pick"></prx-pick>')($scope);
      $scope.$digest();
      expect(element.isolateScope().loading).toBe(true);
    }));

  });

  describe('prxPicks service', function() {
    var ngHal, prxPicks, scope, $q_;
    var picklist, picks, picklistStub, picksStub;

    beforeEach(inject(function (_ngHal_, _prxPicks_, $rootScope, _$q_) {
      ngHal = _ngHal_;
      prxPicks = _prxPicks_;
      scope = $rootScope.$new();
      $q = _$q_;
      picklist = ngHal.mock('http://meta.prx.org/model/pick_list');
      picks = ngHal.mock('http://meta.prx.org/model/picks');
      picklistStub = ngHal.stubFollow('prx:pick-list', picklist);
      picksStub = picklist.stubFollow('prx:picks', picks);
    }));

    it ('returns the suggested pick without network request when already set', function() {
      var items = [];
      var itemsStub = picks.stubFollow('prx:items', items);
      prxPicks.suggestedPick();
      scope.$digest();
      prxPicks.suggestedPick();
      scope.$digest();
      expect(picklistStub.calls.count()).toBe(1);
    });

    it ('excludes the passed in story from the set of possible picks', function() {
      var sigil = 'sigil';
      var items = [{id: 1, story: {id: sigil}}];
      var itemsStub = picks.stubFollow('prx:items', items);
      var pick = 'foo';
      prxPicks.suggestedPick({id: sigil}).then(function(p) {
        pick = p;
      });
      scope.$digest();
      expect(pick).toBe(null);
    });

    it ('returns a promise for a pick from the set of possible picks when there is a non-excluded one', function() {
      var suggested = {id: 3, story: {id: 1}};
      var excluded = {id: 4, story: {id: 2}};
      var items = [suggested, excluded];
      var itemsStub = picks.stubFollow('prx:items', items);
      var pick = 'foo';
      prxPicks.suggestedPick(excluded.story).then(function(p) {
        pick = p;
      });
      scope.$digest();
      expect(pick).toBe(suggested);
    });

    it ('returns a promise for a pick when no excluded story is provided', function() {
      var suggested = {id: 2, story: {id: 1}};
      var items = [suggested];
      var itemsStub = picks.stubFollow('prx:items', items);
      var pick = 'foo';
      prxPicks.suggestedPick().then(function(p) {
        pick = p;
      });
      scope.$digest();
      expect(pick).toBe(suggested);
    });

    it ('does not return the same pick twice in a session while others are available', function() {
      var items = [{id: 1, story: {id: 2}}, {id: 3, story: {id: 4}}, {id: 5, story: {id: 6}}];
      var itemsStub = picks.stubFollow('prx:items', items);
      var p1, p2, p3;
      prxPicks.suggestedPick().then(function(p) { p1 = p; });
      scope.$digest();
      prxPicks.suggestedPick().then(function(p) { p2 = p; });
      scope.$digest();
      prxPicks.suggestedPick().then(function(p) { p3 = p; });
      scope.$digest();
      expect(p1).not.toBe(p2);
      expect(p1).not.toBe(p3);
      expect(p2).not.toBe(p3);
    });

    it ('resets the suggested pick list when it is empty', function() {
      var items = [{id: 1, story: {id: 2}}, {id: 3, story: {id: 4}}];
      var itemsStub = picks.stubFollow('prx:items', items);
      var p1, p2, p3;
      prxPicks.suggestedPick().then(function(p) { p1 = p; });
      scope.$digest();
      prxPicks.suggestedPick().then(function(p) { p2 = p; });
      scope.$digest();
      prxPicks.suggestedPick().then(function(p) { p3 = p; });
      scope.$digest();
      expect(p3).not.toBe(null);
      expect(p3).toBeDefined();
    });

  });

});
