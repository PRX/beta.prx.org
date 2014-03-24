describe('prx', function () {
  describe ('appCtrl', function () {
    var $controller, $scope, ctrl;

    beforeEach(module('prx.appCtrl'));
    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      ctrl = $controller('appCtrl', {$scope: $scope});
    }));

    it ('attaches a player', function () {
      expect($scope.player).toBeDefined();
    });

    it ('hides the modal by default', function () {
      expect($scope.$apply('modal.visible')).toBeFalsy();
    });

    it ('quickly shows the modal if loading directly to one', function () {
      $scope.$emit('$stateChangeStart', {data: {modal: true}}, {}, {abstract: true});
      expect($scope.$apply('modal.visible')).toBeTruthy();
    });

    it ('does not quickly show the modal if coming from another state', function () {
      $scope.$emit('$stateChangeStart', {data: {modal: true}}, {}, {abstract: false});
      expect($scope.$apply('modal.visible')).toBeFalsy();
    });

    it ('shows the modal if we have moved to a modal state', function () {
      $scope.$emit('$stateChangeSuccess', {data: {modal: true}});
      expect($scope.$apply('modal.visible')).toBeTruthy();
    });

    it ('hides the modal if we have moved to a non-modal state', function () {
      $scope.modal.visible = true;
      $scope.$emit('$stateChangeSuccess', {});
      expect($scope.$apply('modal.visible')).toBeFalsy();
    });
  });

  describe('prxImg directive', function () {
    var $compile, $scope, element;
    beforeEach(module('prx'));
    beforeEach(inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
      element = $compile(angular.element('<prx-img src="src"></prx-img>'))($scope);
    }));

    it ('has the img class', function () {
      $scope.src = 1;
      expect(element.hasClass('img')).toBeTruthy();
    });

    it ('has the background-image set to the src prop', function () {
      $scope.src = "foo.jpg";
      $scope.$digest();
      expect(element.css('background-image')).toMatch(/^url\(.*foo\.jpg.*\)$/);
    });
  });

  describe ('timeAgo filter', function () {
    var timeAgo;

    function secondsAgo (seconds) {
      return new Date(new Date() - seconds * 1000);
    }

    beforeEach(module('prx'));

    beforeEach(inject(function ($filter) {
      timeAgo = $filter('timeAgo');
    }));

    var map = {
      'just now': [14],
      '35 seconds ago': [35],
      '25 seconds ago': [25],
      'about a minute ago': [46, 85],
      '2 minutes ago': [95],
      '44 minutes ago': [2640],
      'about an hour ago': [2700, 5350],
      '2 hours ago': [5400, 5800],
      'about a day ago': [86400, 140400],
      '2 days ago': [172800, 180000],
      '14 days ago': [1209600],
      'about a month ago': [2419200, 3060000],
      '2 months ago': [5184000],
      'about a year ago': [31536000, 34880000],
      'a year and 6 months ago': [46656000],
      '2 years ago': [62208000, 62061000],
      '2 years and 7 months ago': [80352000]
    };

    angular.forEach(map, function (values, expectation) {
      angular.forEach(values, function (value) {
        it ('translates to ' + expectation + ' for ' + value + 'seconds in the past', function () {
          expect(timeAgo(secondsAgo(value))).toEqual(expectation);
        });
      });
    });
  });
});
