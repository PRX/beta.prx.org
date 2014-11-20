/* istanbul ignore next */
if (FEAT.TCF_DEMO) {
  angular.module('prx.analyze-audio', ['angular-id3', 'angular-aurora'])
  .factory('MimeDefinition', function() {

    function MimeDefinition (type) {
      this.type = type;
    }

    MimeDefinition.prototype = {
      major: function () { return this.type.split('/')[0]; },
      minor: function () { return this.type.split('/')[1]; },
      full:  function () { return this.type; }
    };

    return MimeDefinition;
  })
  .service('MimeType', function MimeTypeService(MimeDefinition) {

    var expectedMimeTypes = {
      "aif": "audio\/x-aiff",
      "aifc": "audio\/x-aiff",
      "aiff": "audio\/x-aiff",
      "caf": "audio\/x-caf",
      "flac": "audio\/x-flac",
      "m2a": "audio\/mpeg",
      "m3a": "audio\/mpeg",
      "m4a": "audio\/mp4",
      "mp2": "audio\/mpeg",
      "mp2a": "audio\/mpeg",
      "mp3": "audio\/mpeg",
      "mp4": "video\/mp4",
      "mp4a": "audio\/mp4",
      "mpga": "audio\/mpeg",
      "oga": "audio\/ogg",
      "ogg": "audio\/ogg",
      "spx": "audio\/ogg",
      "wav": "audio\/x-wav",
      "weba": "audio\/webm",
      "gif": "image\/gif",
      "jpe": "image\/jpeg",
      "jpeg": "image\/jpeg",
      "jpg": "image\/jpeg",
      "png": "image\/png",
      "svg": "image\/svg+xml",
      "svgz": "image\/svg+xml",
      "webp": "image\/webp"
    };

    this.lookup = function(file, defaultType) {
      defaultType = defaultType || "application\/octet-stream";

      var type = file.type;
      if (typeof type === 'undefined' || type === null || type === '') {
        var ext = file.name.split('.').pop();
        type = expectedMimeTypes[ext];
      }
      return new MimeDefinition(type || defaultType);
    };

  })
  .service('AnalyzeAudio', function AnalyzeAudio($q, MimeType, Id3Service, AuroraService) {

    this.analyze = function (file) {

      // try to figure out the mime type
      file.mimeType = MimeType.lookup(file);

      var analysis = [];

      // metadata may be redundant with tags, getting it anyway
      analysis.push( AuroraService.metadata(file).then( function (m) { file.metadata = m; return m; }) );
      analysis.push( AuroraService.format(file).then(   function (f) { file.format   = f; return f; }) );
      analysis.push( AuroraService.duration(file).then( function (d) { file.duration = d; return d; }) );
      analysis.push( Id3Service.analyze(file).then(     function (t) { file.tags     = t; return t; }) );

      // return just the file back in the collected promise
      return $q.all(analysis).then(function (data) { return file; });
    };
  })
  .service('ValidateAudio', function ValidateAudio(AnalyzeAudio) {

    function ValidationResults() {
    }

    ValidationResults.prototype = {
      addMessage: function (validation, options) {
        this[validation] = options;
      },
      error: function(validation, options) {
        options = options || {};
        options.severity = 'error';
        return this.addMessage(validation, options);
      },
      warning: function(context, validation, options) {
        options = options || {};
        options.severity = 'warning';
        return this.addMessage(validation, options);
      }
    };

    // notAudio:      error:   This is not an audio file or media file containing audio
    // videoFile:     warning: the file is video, will use audio track
    // lossyEncoding: warning: uses a lossy encoding, not so good for transcoding
    this.validateType = function(file) {
      file._results = file._results || new ValidationResults();

      var mt = file.mimeType.full();

      var t = file.mimeType.major();
      if (t == 'video') {
        file._results.warning('videoFile', {mimeType: mt});
      } else if (t == 'audio') {
        if (!file.mimeType.minor().match(/(wav|flac|aiff|alac|raw|pcm)/)) {
          file._results.warning('lossyEncoding', {mimeType: mt});
        }
      } else {
        file._results.error('notAudio', {mimeType: mt});
      }
      return this;
    };

    // need to figure out what warnings we want per type, and per channel count
    // for an mp2, bitrate should be 256 for stereo, and 128 for mono
    this.validateBitRate = function(file) {
      file._results = file._results || new ValidationResults();
      if (file.mimeType.major() != 'audio') { return this; }
      return this;
    };

    // need to figure out what warnings we want per type
    // for an mp2, sample rate should by 44100
    this.validateSampleRate = function(file) {
      file._results = file._results || new ValidationResults();
      if (file.mimeType.major() != 'audio') { return this; }
      return this;
    };

    this.validate = function (file) {
      return AnalyzeAudio.analyze(file).then( function () {
        file._results = new ValidationResults();
        this.validateType(file);
        this.validateBitRate(file);
        this.validateSampleRate(file);
      });

    };

  });
}