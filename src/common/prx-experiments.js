angular.module('prx.experiments', [])
.provider('prxperiment', function () {
  var config = {}, http, q, $injector;
  var Provider = {
    base: function (base) {
      config.base = base;
      return Provider;
    },
    clientId: function (clientId) {
      config.clientId = clientId;
      return Provider;
    },
    '$get': ['$http', '$q', '$injector',
      function ($http, $q, $injector_) {
        $injector = $injector_;
        return new Experiment($http, $q, config);
    }]
  };


  function Experiment ($http, $q, config) {
    http = $http;
    q = $q;
    this.base = config.base;
    if (angular.isArray(config.clientId) ||
      angular.isFunction(config.clientId)) {
      config.clientId = $injector.invoke(config.clientId);
    }

    this.clientId = $q.when(config.clientId);
    this.forces = {};
    this.active = {};
  }

  Experiment.prototype.flushActive = function () {
    this.active = {};
  };

  Experiment.prototype.flushForces = function () {
    this.forces = {};
  };

  Experiment.prototype.addForce = function (key, value) {
    if (typeof this.active[key] != 'undefined' && this.active[key].length) {
      angular.forEach(this.active[key], function (pp) {
        pp.set(value);
      });
    }
    this.forces[key] = value;
  };

  function ParticipationPromise (base, alternatives, promise) {
    var self = this;
    this.alternatives = alternatives;
    this.then         = promise.then(function (response) {
      return self.resolved = new Participation(base, response.data);
    }).then;
    this.alternative = this.then(function (p) { return p.alternative; });
    this.choice      = this.alternative;
  }

  ParticipationPromise.prototype.convert = function (kpi) {
    return this.then(function (p) {
      return p.convert(kpi);
    });
  };

  ParticipationPromise.prototype.set = function (value) {
    if (this.alternatives.indexOf(value) !== -1) {
      this.alternative = q.when(value);
      this.choice      = this.alternative;
      if (typeof this.resolved !== 'undefined') {
        this.resolved.set(value);
      } else {
        this.then = this.then(function (p) {
          p.set(value);
          return p;
        }).then;
      }
    }
  };

  function Participation (base, data) {
    this.base        = base;
    this.experiment  = data.experiment.name;
    this.alternative = data.alternative.name;
    this.choice      = this.alternative;
    this.clientId    = data.client_id;
  }

  Participation.prototype.set = function (value) {
    this.alternative = value;
    this.choice      = this.alternative;
  };

  Participation.prototype.convert = function (kpi) {
    var query = [this.base + '/convert?experiment=', this.experiment, '&client_id=', this.clientId];
    if (typeof kpi !== 'undefined') { query.push('&kpi=', kpi); }
    return http.get(query.join(''));
  };

  Participation.prototype.toString = function () {
    return this.choice;
  };

  Experiment.prototype.participate = function (experiment, alternatives) {
    var self = this, httpPromise = this.clientId.then(function (clientId) {
      var query = [self.base, '/participate?experiment=', experiment, '&client_id=', clientId];
      angular.forEach(alternatives, function (alt) {
        query.push('&alternatives=', alt);
      });

      if (typeof self.forces[experiment] !== 'undefined' && alternatives.indexOf(self.forces[experiment]) !== -1) {
        query.push('&force=', self.forces[experiment]);
      }

      return http.get(query.join(''));
    });

    this.active[experiment] = this.active[experiment] || [];
    var promise = new ParticipationPromise(this.base, alternatives, httpPromise);
    this.active[experiment].push(promise);
    return promise;
  };

  Experiment.prototype.run = function (experiment, alternatives) {
    return this.participate(experiment, alternatives);
  };

  Experiment.prototype.get = function (experiment) {
    if (this.active[experiment] &&
      this.active[experiment].length &&
      this.active[experiment][0].resolved) {
        return this.active[experiment][0].resolved;
    }
  };

  return Provider;
}).run(function ($location, $rootScope, prxperiment) {
  $rootScope.$on('$stateChangeStart', function () {
    prxperiment.flushActive();
  });
  $rootScope.$on('$locationChangeSuccess', function () {
    prxperiment.flushForces();
    angular.forEach($location.search(), function (value, key) {
      if (key.match(/^(?:sixpack|prxp)-force/)) {
        prxperiment.addForce(key.replace(/(?:sixpack|prxp)-force-/, ''), value);
      }
    });
  });
})
.directive('prxpConvert', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, elem, attr) {
      var converted = false;
      elem.bind('click', convert);

      function convert () {
        if (!converted) {
          converted = true;
          scope.$eval(attr.prxpConvert).convert();

          // For some reason, if we mess with the
          // event handlers in this cycle, the browser
          // will block the rest from executing.
          // So, we wait before unbinding this one.
          $timeout(unbind);
        }
      }

      function unbind() {
        elem.unbind('click', convert);
      }
    }
  };
});
