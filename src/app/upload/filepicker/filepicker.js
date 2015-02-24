angular.module('prx.upload.filepicker', ['templates'])
.factory('PRXFilePicker', function () {
  return {
    show: function () {
      this.visible = true;
    },
    dismiss: function () {
      this.visible = false;
    },
    visible: false
  };
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
.controller('FilePickerOverlayCtrl', function (PRXFilePicker, Upload) {
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
    angular.forEach(files, function (file) {
      Upload.upload(file).then(function () {
        console.log(arguments);
      }, function () {
        console.log(arguments);
      }, function () {
        console.log(arguments);
      });
    });
  };
})
.directive('prxFileSelectButton', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      var input = angular.element("<input type='file'>");
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
