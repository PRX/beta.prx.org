/* istanbul ignore next */
if (FEAT.TCF_DEMO) {
  angular.module('prx.upload', ['angular-dnd'])
  .config(function ($stateProvider) {
    $stateProvider.state('upload', {

    }).state('upload.new_story', {
      url: '/upload',
      params: {uploads: []},
      views:{
        '@': {
          template: "<ul><li ng-repeat='upload in uploads'><pre>{{upload | json}}</pre></li></ul>",
          controller: function ($scope, $stateParams) {
            $scope.uploads = $stateParams.uploads;
          }
        }
      }
    });
  })
  .service('UploadTarget', function ($rootScope) {
    var targets = [],
        active  = {};

    this.registerTarget = function (targetName) {
      if (targets.indexOf(targetName) == -1) {
        targets.push(targetName);
        active[targetName] = false;
      }
    };

    this.targetActive = function (targetName) {
      return !!active[targetName];
    };

    this.showTarget = function (targetName) {
      if (targets.indexOf(targetName) !== -1) {
        active[targetName] = true;
      }
    };

    this.dismissTarget = function (targetName) {
      if (targets.indexOf(targetName) !== -1) {
        active[targetName] = false;
      }
    };

    this.deregisterTarget = function (targetName) {
      if (targets.indexOf(targetName) !== -1) {
        targets.splice(targets.indexOf(targetName), 1);
        active[targetName] = undefined;
      }
    };

    $rootScope.$on('$stateChangeStart', function () {
      angular.forEach(active, function (val, key) {
        active[key] = false;
      });
    });
  })
  .directive('prxFileTarget', function () {
    return {
      restrict: 'E',
      priority: 1000,
      templateUrl: "upload/file_target.html",
      replace: true,
      scope: {
        targetName: '@name'
      },
      controller: 'prxFileTargetCtrl',
      controllerAs: 'target',
      bindToController: true
    };
  })
  .directive('prxFileSelect', function () {
    return {
      restrict: 'A',
      require: '^prxFileTarget',
      link: function (scope, elem, attrs, ctrl) {
        ctrl.selectFiles = function () {
          elem[0].click();
        };
      }
    };
  })
  .service('Validate', function ValidateService($timeout, $q) {
    var invalidatedOnce = false;

    function validationResult (file) {
      return function () {
        if (invalidatedOnce) {
          return file;
        } else {
          invalidatedOnce = true;
          return $q.reject({error: "MP3 bitrate too low!", file: file});
        }
      };
    }

    this.validate = function (file) {
      return $timeout(angular.noop, Math.random() * 1500 + 500).then(validationResult(file));
    };
  })
  .service('Upload', function UploadService($interval) {
    var activeUploads = [], intervalScheduled = false;

    function Upload(file) {
      this.file = file;
      this.progress = 0;
      activeUploads.push(this);
      scheduleInterval();
    }

    this.upload = function (file) {
      return new Upload(file);
    };

    function scheduleInterval() {
      if (!intervalScheduled) {
        intervalScheduled = $interval(increaseUploads, 200);
      }
    }

    function increaseUploads() {
      if (activeUploads.length) {
        activeUploads[0].progress += Math.random() * 10 + 1;
        if (activeUploads[0].progress >= 100) {
          activeUploads[0].progress = 100;
          activeUploads.splice(0, 1);
        }
      } else {
        $interval.cancel(intervalScheduled);
        intervalScheduled = false;
      }
    }
  })
  .controller('prxFileTargetCtrl', function (UploadTarget, $scope, Upload, Validate, $state, $q, $timeout) {
    var ctrl = this, errorClearer;

    var MESSAGES = {
      NO_DRAG: "Drag Files Here",
      DRAG: "Drop Files Here to Upload",
      DROPPED: "Analyzing..."
    };

    UploadTarget.registerTarget(this.targetName);

    this.visible = function () {
      return UploadTarget.targetActive(this.targetName);
    };

    this.message = MESSAGES.NO_DRAG;

    this.updateMessage = function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.message != MESSAGES.DRAG) {
        this.message = MESSAGES.DRAG;
      }
    };

    this.filesDropped = function (event) {
      event.preventDefault();
      event.stopPropagation();
      this.message = MESSAGES.DROPPED;
      var validations = [];
      if (errorClearer) {
        $timeout.cancel(errorClearer);
        clearError();
      }
      angular.forEach(event.dataTransfer.files, function (file) {
        validations.push(Validate.validate(file));
      });
      $q.all(validations).then(function (validFiles) {
        angular.forEach(validFiles, function (file, index) {
          validFiles[index] = Upload.upload(file);
        });
        return validFiles;
      }, function (validationError) {
        ctrl.message = MESSAGES.NO_DRAG;
        ctrl.errorMessage = validationError.error;
        errorClearer = $timeout(clearError, 5000);
        return errorClearer.then(function () {
          return $q.reject(validationError.error);
        });
      }).then(function (uploads) {
        $state.go('upload.new_story', {uploads: uploads});
      });
    };

    this.showFileSelect = function () {
      return this.message == MESSAGES.NO_DRAG;
    };

    this.dragLeave = function () {
      this.message = MESSAGES.NO_DRAG;
    };

    this.busy = function () {
      return this.message == MESSAGES.DROPPED;
    };

    $scope.$on("$destroy", function () {
      UploadTarget.deregisterTarget(targetName);
    });

    function clearError () {
      ctrl.errorMessage = null;
      errorClearer = null;
    }
  });
}
