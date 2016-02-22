module.exports = function errorsController(prxError) {
  'ngInject';

  this.show = prxError.hasError;
  this.canRetry = prxError.canRetry;
  this.canGoBack = prxError.canGoBack;
  this.goBack = prxError.goBack;
  this.retry = prxError.retry;
  this.headline = prxError.headline;
  this.message = prxError.message;
  this.object = prxError.object;
  this.debuggable = prxError.debuggable;
};
