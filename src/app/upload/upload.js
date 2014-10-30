angular.module('prx.upload', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('upload', {
      url: '/prx-upload',
      title: 'Create Your Story',
      views: {
        '@': {
          templateUrl: 'upload/upload.html',
          controller: 'UploadCtrl as upload'
        }
      }
    }
  );
})
.controller('UploadCtrl', function () {
})
.directive('onPageScroll', function ($window) {
  return {
    restrict: 'A',
    controller: function () {
      this.root = null;

      this.statusBar = undefined;
      this.statusBarPlaceholder = undefined;

      this.inspectors = [];
      this.inspectorPlaceholders = [];


      this.registerStatusBar = function (elem) {
        this.statusBar = elem;
      };
      this.registerStatusBarPlaceholder = function (elem) {
        this.statusBarPlaceholder = elem;
      };
      this.registerInspector = function (elem) {
        this.inspectors.push(elem);
      };
      this.registerInspectorPlaceholder = function (elem) {
        this.inspectorPlaceholders.push(elem);
      };

      this.findPosX = function (obj) {
        var curleft = 0;

        if(obj.offsetParent) {
          while(1) {
            curleft += obj.offsetLeft;

            if(!obj.offsetParent) {
              break;
            }

            obj = obj.offsetParent;
          }
        } else if (obj.x) {
          curleft += obj.x;
        }

        return curleft;
      };

      this.findPosY = function (obj) {
        var curtop = 0;

        if (obj.offsetParent) {
          while(1) {
            curtop += obj.offsetTop;

            if(!obj.offsetParent) {
              break;
            }

            obj = obj.offsetParent;
          }
        } else if (obj.y) {
          curtop += obj.y;
        }

        return curtop;
      };

      this.positionInspectors = function () {
        for (i = 0; i < this.inspectors.length; i++) {

          _placeholder = this.inspectorPlaceholders[i][0];
          _inspector = this.inspectors[i][0];

          _nextInspector = undefined;
          if (this.inspectors[i + 1]) {
            _nextInspector = this.inspectors[i + 1][0];
          }

          pageY = $window.pageYOffset;

          verticalOffset = 153;
          topMargin = 30;

          y = this.findPosY(_placeholder);

          if (pageY + verticalOffset > y) {
            // Has scrolled past the static location of the inspector,
            // so we need to figure out where to display it

            // Figure out if there's collision between the display location of
            // this inspector and the static location of the next inspector

            if ((typeof _nextInspector != 'undefined')) {
              nextY = this.findPosY(_nextInspector);

              collisionY = nextY - (verticalOffset + topMargin + _inspector.offsetHeight);
              adjCollisionY = (collisionY - 208);

              if (pageY > adjCollisionY) {
                // Push the inspector off screen as necessary

                distPastCollisionY = (pageY - adjCollisionY);
                _y = (verticalOffset + topMargin) - distPastCollisionY;

                _inspector.style.position = "fixed";
                _inspector.style.top = _y + "px";
                _inspector.style.left = 'initial';
                _inspector.style.marginLeft = "-275px";
              } else {
                // Pin the current header to the top of the view
                _inspector.style.position = "fixed";
                _inspector.style.top = (verticalOffset + topMargin) + "px";
                _inspector.style.left = 'initial';
                _inspector.style.marginLeft = "-275px";
              }
            } else {
              // Pin the current header to the top of the view
              _inspector.style.position = "fixed";
              _inspector.style.top = (verticalOffset + topMargin) + "px";
              _inspector.style.left = 'initial';
              _inspector.style.marginLeft = "-275px";
            }
          } else {
            // Reset the inspector's styles
            _inspector.style.removeProperty('marginLeft');
            _inspector.style.removeProperty('margin');
            _inspector.style.removeProperty('position');
            _inspector.style.removeProperty('top');
            _inspector.style.removeProperty('left');
          }
        }
      };

      this.positionStatusBar = function () {
        bar = this.statusBar[0];
        placeholder = this.statusBarPlaceholder[0];

        if ($window.pageYOffset + 73 > this.findPosY(placeholder)) {
          placeholder.style.height = bar.offsetHeight + 'px';
          bar.style.position = "fixed";
          bar.style.top = "73px";
        } else {
          placeholder.style.height = '0px';
          bar.style.position = 'static';
          bar.style.removeProperty('top');
        }
      };
    },
    link: function (scope, elem, attrs, ctrl) {
      ctrl.root = elem[0];

      angular.element($window).on('scroll', function (event) {
        ctrl.positionStatusBar();
        ctrl.positionInspectors();
      });
    }
  };
})
.directive('statusBar', function () {
  return {
    restrict: 'A',
    require: '^onPageScroll',
    link: function (scope, elem, attrs, ctrl) {
      ctrl.registerStatusBar(elem);
    }
  };
})
.directive('statusBarPlaceholder', function () {
  return {
    restrict: 'A',
    require: '^onPageScroll',
    link: function (scope, elem, attrs, ctrl) {
      ctrl.registerStatusBarPlaceholder(elem);
    }
  };
})
.directive('inspector', function () {
  return {
    restrict: 'A',
    require: '^onPageScroll',
    link: function (scope, elem, attrs, ctrl) {
      ctrl.registerInspector(elem);
    }
  };
})
.directive('inspectorPlaceholder', function () {
  return {
    restrict: 'A',
    require: '^onPageScroll',
    link: function (scope, elem, attrs, ctrl) {
      ctrl.registerInspectorPlaceholder(elem);
    }
  };
})
;
