describe('angular-id3', function () {

  describe ('$id3', function () {

    beforeEach(module('angular-id3'));

    beforeEach(inject(function (_$id3_, _Id3Service_) {
      $id3 = _$id3_;
      Id3Service = _Id3Service_;
    }));

    it ('provides the id3 AV object', function () {
      expect($id3).toBeDefined();
    });

  });

  describe ('Id3Service', function() {
    var $id3, Id3Service, $rootScope;

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

    beforeEach(inject(function (_Id3Service_, _$id3_, _$rootScope_) {
      Id3Service = _Id3Service_;
      $id3 = _$id3_;
      $rootScope = _$rootScope_;
    }));

    it ("will return tags", function() {
      expect(Id3Service).toBeDefined();
      var mockFile = {name: 'test.mp3', type: 'audio/mpeg', mockTags: {artist: 'miss foo'} };
      Id3Service.analyze(mockFile).then( function(res) {
        expect(res['artist']).toEqual('miss foo');
      });
      $rootScope.$digest();
    });

  });

});
