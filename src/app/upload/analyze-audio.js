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
.service('MimeTypeValidator', function (MimeType, MimeDefinition, $q) {
  this.validate = function (file, types) {
    var deferred = $q.defer();

    var mimeType = MimeType.lookup(file);
    var match = false;

    angular.forEach(types, function (type) {
      var typeDef = new MimeDefinition(type);

      if ((typeDef.minor() === '*' && typeDef.major() === mimeType.major()) || typeDef.type === mimeType.type) {
        match = true;
      }
    });

    if (match) {
      deferred.resolve();
    } else {
      deferred.reject('Unacceptable MIME type');
    }

    return deferred.promise;
  };
})
.service('BulkTypeValidator', function ($q, MimeTypeValidator) {
  this.validate = function (files, types) {

    var all = [];
    angular.forEach(files, function (file) {
      all.push(MimeTypeValidator.validate(file, types));
    });

    return $q.all(all);
  };
})
.service('ID3Validator', function ($q, Id3Service) {
  this.validate = function (file, requiredTags) {
    var deferred = $q.defer();

    Id3Service.analyze(file).then(function (tags) {
      // TODO
      if (true) {
         deferred.resolve();
      } else {
        deferred.reject('Missing required ID3 tags');
      }
    });

    return deferred.promise;
  };
})
.service('DurationValidator', function (AuroraService, $q) {
  this.validate = function (file, min, max) {
    var deferred = $q.defer();
    var minDuration = min;
    var maxDuration = max;

    if (!min) { minDuration = 0.0; }
    if (!max) { maxDuration = Infinity; }

    AuroraService.duration(file).then(function (duration) {
      if (duration >= minDuration && duration <= maxDuration) {
         deferred.resolve();
      } else {
        deferred.reject('File duration outside allowed bounds');
      }
    });

    return deferred.promise;
  };
})
.service('FormatValidator', function (AuroraService, $q) {
  this.validate = function (file, params) {
    var deferred = $q.defer();

    AuroraService.format(file).then(function (format) {
      var error;
      for (var key in params) {
        if (params.hasOwnProperty(key) && format.hasOwnProperty(key)) {
          if (typeof params[key] === 'number' && params[key] !== format[key]) {
            error = true;
            break;
          } else if (typeof params[key] === 'string' && params[key] !== format[key]) {
            error = true;
            break;
          } else if (Array.isArray(params[key])) {
            var min, max;

            min = params[key][0] ? params[key][0] : 0;
            max = params[key][1] ? params[key][1] : Infinity;

            if (format[key] < min || format[key] > max) {
              error = true;
              break;
            }
          }
        }
      }

      if (error) {
        deferred.reject('File format is invalid');
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  };
})
.service('AnalyzeAudio', function AnalyzeAudio($q, MimeType, Id3Service, AuroraService) {

  this.analyze = function (file) {

    // try to figure out the mime type
    file.mimeType = MimeType.lookup(file);

    var analysis = [];

    // metadata may be redundant with tags, getting it anyway
    AuroraService.metadata(file).then( function (m) { file.metadata = m; return m; });

    analysis.push( AuroraService.format(file).then(   function (f) { file.format   = f; return f; }) );
    analysis.push( AuroraService.duration(file).then( function (d) { file.duration = d; return d; }) );
    analysis.push( Id3Service.analyze(file).then(     function (t) { file.tags     = t; return t; }) );

    // return just the file back in the collected promise
    return $q.all(analysis).then(function (data) { return file; });
  };
})
.service('ValidateAudio', function (AnalyzeAudio) {

  var ValidateAudio = this;

  function ValidationResults() {
  }

  ValidationResults.prototype = {
    addMessage: function (validation, options) {
      this[validation] = options;
    },
    error: function(validation, options) {
      options = options || {};
      options.severity = 'error';
      this.addMessage(validation, options);
    },
    warning: function(validation, options) {
      options = options || {};
      options.severity = 'warning';
      this.addMessage(validation, options);
    }
  };

  // notAudio:      error:   This is not an audio file or media file containing audio
  // videoFile:     warning: the file is video, will use audio track
  // lossyEncoding: warning: uses a lossy encoding, not so good for transcoding
  ValidateAudio.validateType = function(file) {
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
      file._results.warning('notAudio', {mimeType: mt});
    }
    return ValidateAudio;
  };

  // need to figure out what warnings we want per type, and per channel count
  // for an mp2, bitrate should be 256 for stereo, and 128 for mono
  ValidateAudio.validateBitRate = function(file) {
    file._results = file._results || new ValidationResults();
    if (file.mimeType.major() != 'audio') { return ValidateAudio; }

    // mp2 validation
    if (file.format.format == 'mp2') {
      var channelRate = (file.format.bitrate / file.format.channelsPerFrame);
      if (channelRate < 128) {
        file._results.error('broadcastLowBitrate', {bitrate: file.format.bitrate, channelsPerFrame: file.format.channelsPerFrame} );
      }
    }

    return ValidateAudio;
  };

  // need to figure out what warnings we want per type
  // for an mp2, sample rate should by 44100
  ValidateAudio.validateSampleRate = function(file) {
    file._results = file._results || new ValidationResults();
    if (file.mimeType.major() != 'audio') { return ValidateAudio; }

    // mp2 validation
    if (file.format.format == 'mp2') {
      if (file.format.sampleRate != 44100) {
        file._results.warning('broadcastSamplerate', {sampleRate: file.format.sampleRate} );
      }
    }

    return ValidateAudio;
  };

  ValidateAudio.validate = function (file) {
    return AnalyzeAudio.analyze(file).then( function (file) {

      file._results = new ValidationResults();
      ValidateAudio.validateType(file);
      ValidateAudio.validateBitRate(file);
      ValidateAudio.validateSampleRate(file);

      return file;
    });

  };

});
