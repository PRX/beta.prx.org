describe('prx.upload.filepicker', function () {
  beforeEach(module('prx.upload.filepicker'));

  it('includes the filepicker service', inject(function (PRXFilePicker) {
    expect(PRXFilePicker).toBeDefined();
  }));

  describe('PRXFilePicker', function () {
    var PRXFilePicker;

    beforeEach(inject(function (_PRXFilePicker_) {
      PRXFilePicker = _PRXFilePicker_;
    }));

    it('has a show method', function () {
      PRXFilePicker.show();
    });

    it('is not visible when show has not been called', function() {
      expect(PRXFilePicker.visible).toBeFalsy();
    });

    it('is visible after show is called', function () {
      PRXFilePicker.show();
      expect(PRXFilePicker.visible).toBeTruthy();
    });

    it('is not visible after dismiss is called', function () {
      PRXFilePicker.show();
      PRXFilePicker.dismiss();
      expect(PRXFilePicker.visible).toBeFalsy();
    });
  });

  describe('prxFilePickerOverlay directive', function () {
    var elem, $scope, filePickerService;

    beforeEach(module(function ($provide) {
      filePickerService = {};
      $provide.constant('PRXFilePicker', filePickerService);
    }));

    beforeEach(inject(function ($rootScope, $compile) {
      $scope = $rootScope.$new();
      elem = $compile('<prx-file-picker-overlay></prx-file-picker-overlay>')($scope);
    }));

    it ('compiles', function () {
      expect(elem).toBeDefined();
    });

    it('is invisible when the service is invisible', function() {
      filePickerService.visible = false;
      $scope.$digest();
      expect(elem.hasClass('ng-hide')).toBeTruthy();
    });

    it('is visible when the service is visible', function() {
      filePickerService.visible = true;
      $scope.$digest();
      expect(elem.hasClass('ng-hide')).toBeFalsy();
    });
  });
});
