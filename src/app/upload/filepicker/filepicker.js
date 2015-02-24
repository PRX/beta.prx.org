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
.controller('FilePickerOverlayCtrl', function (PRXFilePicker) {
  this.picker = PRXFilePicker;
});
