describe('prx.upload', function () {

  beforeEach(module('angular-evaporate', function (evaporateProvider, $provide) {

    evaporateProvider.awsKey('AKIRAISAGREATMOVIE');

    $provide.decorator('$window', ['$delegate', function($delegate) {

      function mockEvaporate(options) {
        this.options = options;
        this.config = null;
      }

      mockEvaporate.prototype = {
        add: function (config) {
          this.config = config;
          return config.file['testId'];
        }
      };

      $delegate.Evaporate = mockEvaporate;

      return $delegate;
    }]);

  }));

  beforeEach(module('prx.upload'));

  describe ('Upload', function () {
    var uploadSvc;
    var evaporate;
    var $rs;

    beforeEach(inject(function (Upload, _evaporate_, _$rootScope_) {
      uploadSvc = Upload;
      $rs = _$rootScope_;
      evaporate = _evaporate_;
    }));

    it('adds a file to the Upload service', function () {
      var mockFile = {name: 'foo', testId: 123};
      var up = uploadSvc.upload(mockFile);
      expect(up.file).toEqual(mockFile);
      expect(up.uploadId).toEqual(123);
      expect(up.progress).toEqual(0);
    });

    it('updates the progress', function () {
      var mockFile = {name: 'foo', testId: 123};
      var up = uploadSvc.upload(mockFile);
      var progressFn = evaporate._evaporate.config.progress;

      expect(up.progress).toEqual(0);
      $rs.$apply( function() { progressFn(0.5); } );
      expect(up.progress).toEqual(0.5);

    });

  });

});