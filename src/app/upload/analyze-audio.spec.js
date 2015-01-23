if (FEAT.TCF_DEMO) {
describe('prx.analyze-audio', function () {

  describe('MimeType', function() {
    var MimeType;

    beforeEach(module('prx.analyze-audio'));

    beforeEach(inject(function (_MimeType_) {
      MimeType = _MimeType_;
    }));

    it("will return the preset file type on lookup", function() {
      var md = MimeType.lookup({name: 'test.foo', type: 'bar/foo'});
      expect(md.major()).toEqual('bar');
      expect(md.minor()).toEqual('foo');
    });

    it("will lookup type from file extension", function() {
      var md = MimeType.lookup({name: 'test.mp2', type: null});
      expect(md.major()).toEqual('audio');
      expect(md.minor()).toEqual('mpeg');
    });

    it("will use default when extension unknown and type null", function() {
      var md = MimeType.lookup({name: 'test.mp2014', type: null});
      expect(md.major()).toEqual('application');
      expect(md.minor()).toEqual('octet-stream');
    });

    it("will use provided default when extension unknown and type null", function() {
      var md = MimeType.lookup({name: 'test.mp2014', type: null}, 'bar/foo');
      expect(md.major()).toEqual('bar');
      expect(md.minor()).toEqual('foo');
    });

  });

  describe('AnalyzeAudio', function() {
    var AnalyzeAudio, $q, $rs, mv, pr, MockAuroraService, MockId3Service;

    beforeEach(module('angular-aurora', function ($provide) {
      mv = {};
      MockAuroraService = {};
      MockAuroraService.mock     = function (md, val) { mv[md] = val;    return MockAuroraService; };
      MockAuroraService.format   = function(file) { pr = mv['format'];   return MockAuroraService; };
      MockAuroraService.duration = function(file) { pr = mv['duration']; return MockAuroraService; };
      MockAuroraService.metadata = function(file) { pr = mv['metadata']; return MockAuroraService; };
      MockAuroraService.then     = function(f) { return f(pr); };
      $provide.value('AuroraService', MockAuroraService);
    }));

    beforeEach(module('angular-id3', function ($provide) {
      MockId3Service = {};
      MockId3Service.analyze     = function(file) { return MockId3Service; };
      MockId3Service.then        = function(f) { return f({album: 'mister bar'}); };
      $provide.value('Id3Service', MockId3Service);
    }));

    beforeEach(module('prx.analyze-audio'));

    beforeEach(inject(function (_AnalyzeAudio_, _$rootScope_) {
      AnalyzeAudio = _AnalyzeAudio_;
      $rs = _$rootScope_;

      MockAuroraService
        .mock('format', {bitRate: 128})
        .mock('duration', 600)
        .mock('metadata', {artist: 'miss foo'});

    }));

    it("can analyze an audio file", function() {
      var mockFile = {name: 'test.mp2', type: null};
      var result;

      AnalyzeAudio.analyze(mockFile).then( function (file) { result = file; });
      $rs.$apply();

      expect(result.mimeType.major()).toEqual('audio');
      expect(result.tags.album).toEqual('mister bar');
      expect(result.format.bitRate).toEqual(128);
      expect(result.duration).toEqual(600);
      // expect(result.metadata.artist).toEqual('miss foo');

    });

  });

  describe('ValidateAudio', function () {
    var _fn, _file;

    beforeEach(module('prx.analyze-audio', function ($provide) {
      MockAnalyzeAudio = {};
      MockAnalyzeAudio.mock     = function(fun)  { _fn = fun; return MockAnalyzeAudio; };
      MockAnalyzeAudio.analyze  = function(file) { _file = file; _fn(_file); return MockAnalyzeAudio; };
      MockAnalyzeAudio.then     = function(f) { return f(_file); };
      $provide.value('AnalyzeAudio', MockAnalyzeAudio);
    }));

    it('validates the format', inject(function (AnalyzeAudio, ValidateAudio, MimeDefinition) {

      AnalyzeAudio.mock( function(file) {
        file.mimeType = new MimeDefinition('foo/bar');
      });

      var result;
      AnalyzeAudio.analyze({}).then( function(file){ result = file; });
      expect(result.mimeType.major()).toEqual('foo');
      ValidateAudio.validateType(result);
      expect(result._results).toBeDefined();
      expect(result._results.notAudio).toBeDefined();
    }));

  });


});

} // FEAT.TCF_DEMO
