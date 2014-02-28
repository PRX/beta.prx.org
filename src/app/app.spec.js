describe('prx', function () {
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
});