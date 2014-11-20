describe('angular-id3', function () {

  describe ('Id3Service', function() {
    var Id3Service, $rootScope;

    beforeEach(module('async-loader', function ($provide) {
      mf = [];
      MockAsyncLoader = {};
      MockAsyncLoader._a_mock     = true;
      MockAsyncLoader.load        = function(files) { mf = files; return MockAsyncLoader; };
      MockAsyncLoader.then        = function(f) { var r = f(mf) || MockAsyncLoader; return r;};
      $provide.value('AsyncLoader', MockAsyncLoader);
    }));

    beforeEach(function() {
      module('angular-id3', function ($provide) {

        $provide.decorator('$window', ['$delegate', function($delegate) {
          var mockId3 = function (file, callback) {
            return callback(file['mockErr'], file['mockTags']);
          };
          $delegate.id3 = mockId3;
          return $delegate;
        }]);

      });
    });

    beforeEach(inject(function (_Id3Service_, _$rootScope_) {
      Id3Service = _Id3Service_;
      $rootScope = _$rootScope_;
    }));

    it ("will return tags", function() {
      expect(Id3Service).toBeDefined();
      var mockFile = {name: 'test.mp3', type: 'audio/mpeg', mockTags: {artist: 'miss foo'} };
      var result;
      Id3Service.analyze(mockFile).then( function(res) { result = res; });
      $rootScope.$digest();
      expect(result['artist']).toEqual('miss foo');
    });

  });

});
