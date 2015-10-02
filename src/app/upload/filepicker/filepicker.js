angular.module('prx.upload.filepicker', ['templates', 'prx.dsp'])
.factory('PRXFilePicker', function ($q, UploadValidator, BulkTypeValidator) {
  function PRXFilePickerService () {
    this.visible = false;
    this.$pending = undefined;
    this.alert = undefined;
  }

  PRXFilePickerService.prototype.selectFiles = function (accept, multiple) {
    this.alert = undefined;
    this.acceptedTypes = accept;
    this.allowMultipleSelections = multiple;
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
    var self = this;

    var validateMediaFiles = function (files) {
      var all = [];

      angular.forEach(files, function (file) {
        all.push(UploadValidator.validate(file));
      });

      $q.all(all).then(function () {
        self.$pending.resolve(files);
        self.dismiss();
        this.$pending = undefined;
      }).catch(function (msg) {
        self.alert = 'One or more files did not meet the minimum requirements.';
      });
    };

    if (this.$pending && files) {
      if (files.length > 1 && !this.allowMultipleSelections) {
        self.alert = 'Please only upload a single file.';
        return;
      }

      if (this.acceptedTypes) {
        BulkTypeValidator.validate(files, this.acceptedTypes).then(function () {
          validateMediaFiles(files);
        }).catch(function () {
          self.alert = 'One or more files are not an acceptable type.';
        });
      } else {
        validateMediaFiles(files);
      }
    }
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
.directive('prxFileSelectButton', function (PRXFilePicker) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      var input = angular.element('<input type="file">');

      elem.on('click', openFileInput);
      scope.$on('$destroy', function () {
        elem.off('click', openFileInput);
        input.off('change', filesSelected);
      });

      input.on('change', filesSelected);

      function openFileInput(e) {
        if (PRXFilePicker.allowMultipleSelections) {
          input.attr('multiple', true);
        } else {
          input.removeAttr('multiple');
        }

        if (PRXFilePicker.acceptedTypes) {
          input.attr('accept', PRXFilePicker.acceptedTypes.join(''));
        } else {
          input.removeAttr('accept');
        }

        e.stopPropagation();
        input[0].click();
      }

      function filesSelected(e) {
        scope.$eval(attrs.onFilesSelected, { '$files': input[0].files });
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
