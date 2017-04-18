var helper  = require('../../common/spec-helper');
var analyze = require('../upload/analyze-audio');
var prxdsp  = require('./dsp');

describe('prx.dsp', function () {

  beforeEach(helper.module(prxdsp, analyze));

  // it('includes the upload validator service', inject(function (UploadValidator) {
  //   expect(UploadValidator).toBeDefined();
  // }));
  //
  // it('includes the mp3 upload validator service', inject(function (UploadValidatorMP3) {
  //   expect(UploadValidatorMP3).toBeDefined();
  // }));
  //
  // describe('UploadValidator', function () {
  //   var UploadValidator;
  //
  //   beforeEach(inject(function (_UploadValidator_) {
  //     UploadValidator = _UploadValidator_;
  //   }));
  //
  //   it('has a validate method', function () {
  //     UploadValidator.validate();
  //   });
  // });
});
