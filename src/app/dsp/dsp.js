var angular = require('angular');

// TODO: is this module needed?
var app = angular.module('prx.dsp', [
  require('../../common/angular-id3'),
  require('../../common/angular-aurora')
]);
module.exports = app.name;

// app.service('UploadValidator', function (MimeType, UploadValidatorMP3) {
//   this.validate = function (file) {
//     if (!file) { return; }
//     var mimeType = MimeType.lookup(file);
//
//     if (mimeType.type === 'audio/mp3') {
//       return UploadValidatorMP3.validate(file);
//     }
//   };
// })
// .service('UploadValidatorMP3', function ($q, MimeTypeValidator, ID3Validator, DurationValidator, FormatValidator) {
//   this.validate = function (file) {
//     var deferred = $q.defer();
//
//     $q.all({
//       mime: MimeTypeValidator.validate(file, ['audio/mpeg','audio/mp3']),
//       // "id3": ID3Validator.validate(upload.file, ['title', 'artist']),
//       duration: DurationValidator.validate(file, (30 * 1000), (90 * 60 * 1000)),
//       format: FormatValidator.validate(file, {
//         bitrate: [128000, 320000],
//         sampleRate: 44100,
//         format: 'mp3'
//       })
//     }).then(function () {
//       deferred.resolve();
//     }).catch(function (msg) {
//       deferred.reject(msg);
//     });
//
//     return deferred.promise;
//   };
// });
