angular.module('prx.upload.filepicker', ['templates'])
.factory('PRXFilePicker', function ($q) {
  function PRXFilePickerService () {
    this.visible = false;
    this.$pending = undefined;
    this.alert = undefined;
    this.mediaTypes = {
      image: 'image',
      audio: 'audio',
      multimedia: 'multimedia',
    };
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
    if (this.$pending && files) {
      if (this.acceptedTypes) {

        // Make sure files are all acceptable
        angular.forEach(files, function (file) {
          var ext = file.name.substr((~-file.name.lastIndexOf(".") >>> 0) + 2);
          if (ext) { ext = ext.toLowerCase(); }

          if (self.acceptedTypes == self.mediaTypes.image && !(ext == 'jpg' || ext == 'jpeg' || ext == 'png')) {
            self.alert = 'Please select either a JPEG or PNG image file.';
          } else if (self.acceptedTypes == self.mediaTypes.audio && !(ext == 'mp3' || ext == 'wav')) {
            self.alert = 'Please select either a WAV or MP3 audio file.';
          } else {
            self.$pending.resolve(files);
            self.dismiss();
          }
        });
        
        return;
      }

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

        var acceptClass = PRXFilePicker.acceptedTypes;

        if (acceptClass == PRXFilePicker.mediaTypes.image) {
          input.attr('accept', '.jpg,.jpeg,.png');
        } else if (acceptClass == PRXFilePicker.mediaTypes.audio) {
          // TODO Accept other types
          input.attr('accept', 'audio/mp3');
        } else if (acceptClass == PRXFilePicker.mediaTypes.multimedia) {
          input.attr('accept', 'image/*,audio/*');
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
