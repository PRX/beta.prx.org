var helper   = require('../../../common/spec-helper');
var prxsheet = require('./sheet');

describe('prx.ui.sheet', function () {

  beforeEach(helper.module(prxsheet));

  describe('PrxSheet service', function () {
    var $rootScope;
    var PrxSheet;
    beforeEach(inject(function (_$rootScope_, _$timeout_, _PrxSheet_) {
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      PrxSheet = _PrxSheet_;
    }));

    it ('collapses the sheet on stateChangeStart', function () {
      $rootScope.$emit('$stateChangeStart', {});
      expect(PrxSheet.expand).toBeFalsy();
    });

    it ('hides the sheet if the new state lacks one', function () {
      PrxSheet.show = true;
      $rootScope.$emit('$stateChangeStart', {views: {'sheet@': false}});
      expect(PrxSheet.show).toBeFalsy();
    });

    it ('does not hide the sheet if the new state has one too', function () {
      PrxSheet.show = true;
      $rootScope.$emit('$stateChangeStart', {views: {'sheet@': true}});
      expect(PrxSheet.show).toBeTruthy();
    });

    it ('shows the sheet if the new state has one', function () {
      PrxSheet.show = false;
      $rootScope.$emit('$stateChangeSuccess', {views: {'sheet@': true}});
      expect(PrxSheet.show).toBeTruthy();
    });

    it ('opens the sheet if the new state requests it', function () {
      PrxSheet.expand = false;
      $rootScope.$emit('$stateChangeSuccess', {
        views: {'sheet@': true},
        data: {openSheet: true}
      });
      expect(PrxSheet.expand).toBeTruthy();
    });

    it ('does nothing if new state has no sheet', function () {
      PrxSheet.show = false;
      $rootScope.$emit('$stateChangeSuccess', {});
      expect(PrxSheet.show).toBeFalsy();
    });
  });

  describe('xi-sheet-title', function () {
    it ('has the title of the active sheet', inject(function ($compile, PrxSheet, $rootScope) {
      var elem = $compile('<xi-sheet-title/>')($rootScope);
      PrxSheet.title = "a title!";
      $rootScope.$digest();
      expect(elem.text()).toEqual("a title!");
    }));
  });

  describe('xi-sheet-dismiss', function () {
    it ('toggles the sheet', inject(function ($compile, $rootScope, PrxSheet) {
      var elem = $compile('<a xi-sheet-dismiss/>')($rootScope);
      PrxSheet.expand = true;
      elem.triggerHandler('click');
      expect(PrxSheet.expand).toBeFalsy();
      elem.triggerHandler('click');
      expect(PrxSheet.expand).toBeTruthy();
    }));
  });

  describe('xi-sheet', function () {
    var elem;
    var PrxSheet;
    var $scope;

    beforeEach(inject(function ($compile, _PrxSheet_, $rootScope) {
      elem = $compile('<div xi-sheet>')($rootScope);
      PrxSheet = _PrxSheet_;
      $scope = $rootScope;
    }));

    it ('is visible when sheet is shown', function () {
      PrxSheet.show = true;
      $scope.$digest();
      expect(elem.hasClass('visible')).toBeTruthy();
    });

    it ('is invisible when sheet is unshown', function () {
      PrxSheet.show = false;
      $scope.$digest();
      expect(elem.hasClass('visible')).toBeFalsy();
    });

    it ('is expanded when sheet is too', function () {
      PrxSheet.expand = true;
      $scope.$digest();
      expect(elem.hasClass('expanded')).toBeTruthy();
    });

    it ('is unexpanded when sheet is too', function () {
      PrxSheet.expand = false;
      $scope.$digest();
      expect(elem.hasClass('expanded')).toBeFalsy();
    });
  });
});
