var helper = require('../common/spec-helper');
var halmock = require('../common/angular-hal-mock');
var prxapp = require('./app');

describe('prx', function () {

  beforeEach(helper.module(prxapp, halmock));

  describe ('appCtrl', function () {
    var $controller, $scope, ctrl;
    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      $scope = $rootScope.$new();
      ctrl = $controller('appCtrl', {$scope: $scope});
    }));

    it ('attaches a player', function () {
      expect(ctrl.player).toBeDefined();
    });
  });

  describe('prxImg directive', function () {
    var $compile, $scope, element;
    beforeEach(inject(function (_$compile_, $rootScope) {
      $compile = _$compile_;
      $scope = $rootScope.$new();
    }));

    describe ('with no defaults', function () {
      beforeEach(function () {
        element = $compile(angular.element('<prx-img src="src"></prx-img>'))($scope);
      });

      it ('has the img class', function () {
        $scope.src = 1;
        expect(element.hasClass('img')).toBeTruthy();
      });
    });

    describe ('with default-class', function () {
      beforeEach(function () {
        element = element = $compile(angular.element('<prx-img src="src" default-class="default"></prx-img>'))($scope);
      });

      it ('adds a default-class class if src is falsy', function () {
        $scope.src = false;
        $scope.$digest();
        expect(element.hasClass('default')).toBeTruthy();
      });

      it ('removes default-class class if src is present', function () {
        $scope.src = "assets/images/boston.png";
        $scope.$digest();
        expect(element.hasClass('default')).toBeFalsy();
      });
    });

    describe ('with default src', function () {
      beforeEach(function () {
        element = element = $compile(angular.element('<prx-img src="src" default="assets/images/boston.png"></prx-img>'))($scope);
      });

      it ('sets src to the default value', function () {
        $scope.src = false;
        $scope.$digest();
        expect(element.find('img').attr('src')).toEqual('assets/images/boston.png');
      });
    });
  });

  describe ('route mixin', function () {
    it('sets a correct stateName and stateParams by default', inject(function (ngHal) {
      var anything = ngHal.mock('http://meta.prx.org/model/anything', {id: 'asdf'});
      var something = ngHal.mock('http://meta.prx.org/model/something/different');

      expect(anything.stateName).toEqual('anything.show');
      expect(something.stateName).toEqual('something.show');

      var params = anything.stateParams();

      expect(params).toEqual({anythingId: 'asdf'});
      expect(anything.stateParams()).toBe(params);
    }));
  });

  describe ('timeAgo filter', function () {
    var timeAgo;

    function secondsAgo (seconds) {
      return new Date(new Date() - seconds * 1000);
    }

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
