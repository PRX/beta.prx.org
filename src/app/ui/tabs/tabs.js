angular.module('prx.ui.tabs', ['ng-animate'])
.directive('tabs', function () {
  return {
    restrict: 'E',
    scope: false,
    require: ['tabs', '^^?tabs'],
    link: function (scope, elem, attrs, ctrls) {
      if (ctrls[1]) {
        ctrls[1].addChild(ctrls[0]);
      }
      ctrls[0].setStateParamName(attrs.stateParam);
      elem.append(ctrls[0].tabList).append(ctrls[0].tabHolder);
      ctrls[0].commit();
    },
    controller: function ($rootScope, $state, $stateParams, $location, $animate, $compile) {
      var tabsController = this, activeTab, activePromises = [];
      var tabs = [], children = [], stateParamName, sParams, holder;
      this.tabList = angular.element('<ul tab-list>');
      this.tabHolder = $compile(angular.element('<div tab-content lock-parent-scrolling>'))($rootScope);
      this.setStateParamName = function (name) {
        stateParamName = name;
      };

      this.addTab = function (tab) {
        tabs.push(tab);
        tab.key = tab.key || tabs.length;
        tab.name(function (nElem) {
          tab.link = angular.element('<a>').append(nElem);
          tab.link.data('tab', tab);
        });
        tab.li = angular.element('<li>').append(tab.link);
      };

      this.addChild = function (child) {
        children.push(child);
      };

      this.commit = function () {
        if (stateParamName) {
          sParams = angular.copy($stateParams);
          angular.forEach(tabs, configureStateBasedTab);
        } else {
          angular.forEach(tabs, configureClickTab);
        }

        if (!activeTab) {
          setActive(tabs[0]);
        }
      };

      this.removeState = function (params) {
        if (stateParamName) {
          params[stateParamName] = undefined;
        }
        angular.forEach(children, function (child) {
          child.removeState(params);
        });
      };

      function configureStateBasedTab(tab) {
        if (!tab.disabled) {
          sParams[stateParamName] = tab.key;
          tab.link.attr('href', $state.href('.', sParams));
          tab.link.on('click', activateState);
          if (tab.key === $stateParams[stateParamName]) {
            setActive(tab);
          }
        } else {
          tab.li.addClass('disabled');
        }
        tabsController.tabList.append(tab.li);
      }

      function activateState(event) {
        var elem = angular.element(this), tab = elem.data('tab');
        $rootScope.$apply(function () {
          tabsController.removeState($stateParams);
          $stateParams[stateParamName] = tab.key;

          if ($state.$current.reloadOnSearch === false) {
            var newSearch = $location.search();
            tabsController.removeState(newSearch);
            newSearch[stateParamName] = tab.key;
            $location.search(newSearch);

            setActive(tab);
          } else {
            $state.go('.', $stateParams);
          }
        });
        event.stopPropagation();
        event.preventDefault();
      }

      function configureClickTab(tab) {
        if (!tab.disabled) {
          tab.link.on('click', activateTab);
        } else {
          tab.li.addClass('disabled');
        }
        tabsController.tabList.append(tab.li);
      }

      function activateTab(event) {
        var elem = angular.element(this), tab = elem.data('tab');
        $rootScope.$apply(function () {
          setActive(tab);
        });

        event.stopPropagation();
        event.preventDefault();
      }

      function setActive(tab) {
        children.length = 0;
        angular.forEach(activePromises, function (promise) {
          $animate.cancel(promise);
        });
        activePromises.length = 0;

        if (tab && tab !== activeTab) {
          tab.content(function (contentElem) {
            tab.contentElem = contentElem;
            activePromises.push($animate.addClass(tab.li, 'active'));
            activePromises.push($animate.enter(contentElem,
              tabsController.tabHolder,
              activeTab ? activeTab.contentElem : undefined));
            if (activeTab) {
              activePromises.push($animate.removeClass(activeTab.li, 'active'));
              activePromises.push($animate.leave(activeTab.contentElem));
            }

            activeTab = tab;
          });
        }
      }
    }
  };
})
.directive('tab', function () {
  return {
    restrict: 'E',
    require: ['^^tabs','tab'],
    scope: false,
    link: function (scope, elem, attrs, ctrls) {
      elem.remove();
      ctrls[0].addTab(ctrls[1].tab);
    },
    controller: function ($attrs) {
      this.tab = {key: $attrs.key, disabled: $attrs.disabled};
      this.setName = function (nameFn) {
        this.tab.name = nameFn;
      };
      this.setContent = function (contentFn) {
        this.tab.content = contentFn;
      };
    }
  };
})
.directive('tabName', function () {
  return {
    restrict: 'E',
    require: '^tab',
    transclude: true,
    scope: false,
    link: function (scope, elem, attrs, ctrl, transclude) {
      ctrl.setName(transclude);
    }
  };
})
.directive('tabContent', function () {
  return {
    restrict: 'E',
    require: '^tab',
    transclude: true,
    scope: false,
    link: function (scope, elem, attrs, ctrl, transclude) {
      ctrl.setContent(transclude);
    }
  };
});
