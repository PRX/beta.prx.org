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

    function ValidationResult(msgType, message, attribute) {
      this.type = msgType;
      this.message = message;
      this.attribute = attribute || '_global_';
    }

    function ValidationResults() {
      this.results = [];
      this.byType = {};
      this.byAttr = {};
    }

    ValidationResults.prototype = {
      addMessage: function (mtype, msg, attr) {
        var vr = new ValidationResult(mtype, msg, attr);
        this.results.push(vr);

        if (!angular.isDefined(this.byType[mtype])) { this.byType[mtype] = []; }
        this.byType[mtype].push(vr);

        if (!angular.isDefined(this.byAttr[attr])) { this.byAttr[attr] = []; }
        this.byAttr[attr].push(vr);
      },
      error: function(msg, attr) {
        return this.addMessage('error', msg, attr);
      },
      warning: function(msg, attr) {
        return this.addMessage('warning', msg, attr);
      },
      messages: function(forAttr) {
        var a = forAttr || '_global_';
        return this.byAttr[a];
      }
    };

    this.validateType = function(file) {
      file.validationResults = file.validationResults || new ValidationResults();

      var t = file.mimeType.major();
      if (t == 'video') {
        file.validationResults.warning('audio track will be extracted from the video.', 'mimeType');
      } else if (t == 'audio') {
        if (!file.mimeType.minor().match(/(wav|flac|aiff|alac|raw|pcm)/)) {
          file.validationResults.warning('encoded in a lossy format, transcoding or altering will affect audio quality.', 'mimeType');
        }
      } else {
        file.validationResults.error('must contain audio, but type is "'+t+'".', 'mimeType');
      }
      return this;
    };

    // need to figure out what warnings we want per type, and per channel count
    // for an mp2, bitrate should be 256 for stereo, and 128 for mono
    this.validateBitRate = function(file) {
      file.validationResults = file.validationResults || new ValidationResults();
      if (file.mimeType.major() != 'audio') { return this; }
      return this;
    };

    // need to figure out what warnings we want per type
    // for an mp2, sample rate should by 44100
    this.validateSampleRate = function(file) {
      file.validationResults = file.validationResults || new ValidationResults();
      if (file.mimeType.major() != 'audio') { return this; }
      return this;
    };

    this.validate = function (file) {
      return AnalyzeAudio.analyze(file).then( function () {
        file.validationResults = new ValidationResults();
        this.validateType(file);
        this.validateBitRate(file);
        this.validateSampleRate(file);
      });

    };

  });
}