var helper = require('./spec-helper');
var aurora = require('./angular-aurora');

describe('angular-aurora', function () {

  describe ('AuroraService', function() {
    var AuroraService, $rootScope;

    beforeEach(helper.module('async-loader', function ($provide) {
      mf = [];
      MockAsyncLoader = {};
      MockAsyncLoader._a_mock     = true;
      MockAsyncLoader.load        = function(files) { mf = files; return MockAsyncLoader; };
      MockAsyncLoader.then        = function(f) { var r = f(mf) || MockAsyncLoader; return r;};
      $provide.value('AsyncLoader', MockAsyncLoader);
    }));

    beforeEach(function() {
      helper.module(aurora, function ($provide) {

        $provide.decorator('$window', ['$delegate', function($delegate) {
          var MockAsset = function (file) { this.file = file; };
          MockAsset.fromFile = function(file) { return new MockAsset(file); };
          MockAsset.prototype = {
            get: function(g, callback) {
              callback(this.file['mockGet']);
            }
          };

          var MockAV  = function MockAV() {};
          MockAV.Asset = MockAsset;
          $delegate.AV = MockAV;

          return $delegate;
        }]);

      });
    });

    beforeEach(inject(function (_AuroraService_, _$rootScope_) {
      AuroraService = _AuroraService_;
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
