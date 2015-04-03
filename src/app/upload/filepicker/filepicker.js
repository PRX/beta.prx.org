angular.module('prx.upload.filepicker', ['templates'])
.factory('PRXFilePicker', function ($q) {
  function PRXFilePickerService () {
    this.visible = false;
    this.$pending = undefined;
  }

  PRXFilePickerService.prototype.selectFiles = function () {
    if (this.$pending) { this.$pending.reject('interrupted'); }
    this.$pending = filePickerDeferred(this);
    this.show();
    return this.$pending.promise;
  };

  PRXFilePickerService.prototype.show = function () {
    this.visible = true;
  };

  PRXFilePickerService.prototype.dismiss = function () {
    this.visible = false;
    if (this.$pending) {
      this.$pending.reject('cancelled');
      this.$pending = undefined;
    }
  };

  PRXFilePickerService.prototype.filesSelected = function (files) {
    if (this.$pending && files) {
      this.$pending.resolve(files);
      this.$pending = undefined;
    }
    this.dismiss();
  };

  function filePickerDeferred(svc) {
    var deferred = $q.defer();
    deferred.promise.cancel = function () {
      if (svc.$pending == deferred) {
        svc.dismiss();
      }
    };
    return deferred;
  }

  return new PRXFilePickerService();
})
.directive('prxFilePickerOverlay', function () {
  return {
    restrict: 'E',
    controller: 'FilePickerOverlayCtrl',
    controllerAs: 'overlay',
    templateUrl: "upload/filepicker/overlay.html",
    replace: true
  };
})
.controller('FilePickerOverlayCtrl', function (PRXFilePicker) {
  this.picker = PRXFilePicker;
  this.filesHovering = function (event) {
    event.preventDefault();
    this.hovering = true;
  };

  this.filesLeave = function (event) {
    event.preventDefault();
    this.hovering = false;
  };

  this.filesDropped = function (event) {
    event.preventDefault();
    this.hovering = false;
    this.selectFiles(event.dataTransfer.files);
  };

  this.selectFiles = function (files) {
    PRXFilePicker.filesSelected(files);
  };
})
.directive('prxFileSelectButton', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      var input = angular.element("<input type='file' multiple>");
      elem.on("click", openFileInput);
      scope.$on("$destroy", function () {
        elem.off("click", openFileInput);
        input.off('change', filesSelected);
      });

      input.on('change', filesSelected);

      function openFileInput(e) {
        e.stopPropagation();
        input[0].click();
      }

      function filesSelected(e) {
        scope.$eval(attrs.onFilesSelected, {'$files': input[0].files});
      }
    }
  };
})
.directive('prxLocalFileUploadTab', function () {
  return {
    restrict: 'E',
    templateUrl: 'upload/filepicker/tabs/local-files.html',
    replace: true,
    scope: false
  };
});
