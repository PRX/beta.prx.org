describe('angular-aurora', function () {

  describe ('$AV', function () {

    beforeEach(module('angular-aurora'));

    beforeEach(inject(function (_$AV_, _AuroraService_) {
      $AV = _$AV_;
      AuroraService = _AuroraService_;
    }));

    it ('provides the aurora AV object', function () {
      expect($AV).toBeDefined();
      expect($AV.Asset).toBeDefined();
    });

  });

  describe ('AuroraService', function() {
    var $AV, AuroraService, $rootScope;

    beforeEach(function() {
      module('angular-aurora', function ($provide) {

        $provide.decorator('$window', ['$delegate', function($delegate) {
          var MockAsset = function (file) { this.file = file; };
          MockAsset.fromFile = function(file) { return new MockAsset(file); };
          MockAsset.prototype = {
            get: function(g, callback) {
              callback(this.file['mockGet']);
            }
          };

          var MockAV  =function () {};
          MockAV.Asset = MockAsset;
          $delegate.AV = MockAV;
          return $delegate;
        }]);

      });
    });

    beforeEach(inject(function (_AuroraService_, _$AV_, _$rootScope_) {
      AuroraService = _AuroraService_;
      $AV = _$AV_;
      $rootScope = _$rootScope_;
    }));

    it ("will analyze file format", function() {
      expect(AuroraService).toBeDefined();
      var mockFile = {name: 'test.mp3', type: 'audio/mpeg', mockGet: {bitRate: '128'} };
      var result;
      AuroraService.format(mockFile).then( function(res) { result = res; });
      $rootScope.$digest();
      expect(result['bitRate']).toEqual('128');
    });

    it ("can get duration of a file", function() {
      expect(AuroraService).toBeDefined();
      var mockFile = {name: 'test.mp3', type: 'audio/mpeg', mockGet: 120 };
      var result;
      AuroraService.format(mockFile).then( function(res) { result = res; });
      $rootScope.$digest();
      expect(result).toEqual(120);
    });

  });

});
