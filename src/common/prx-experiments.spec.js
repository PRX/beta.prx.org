var helper = require('./spec-helper');
var prxxp  = require('./prx-experiments');

describe('prx.experiments', function () {

  /* https://github.com/angular/angular.js/blob/01c5be4681e34cdc5f5c461b7a618fefe8038919/src/Angular.js#L1021 */
  function parseKeyValue(keyValue) {
    var obj = {}, key_value, key;
    angular.forEach(keyValue.split('&'), function(keyValue){
      key_value = keyValue.split('=');
      key = tryDecodeURIComponent(key_value[0]);
      var val = tryDecodeURIComponent(key_value[1]);
      if (!obj[key]) {
        obj[key] = val;
      } else if(angular.isArray(obj[key])) {
        obj[key].push(val);
      } else {
        obj[key] = [obj[key],val];
      }
    });
    return obj;
  }

  function tryDecodeURIComponent(value) {
    try {
      return decodeURIComponent(value);
    } catch(e) {
      // Ignore any invalid uri component
    }
  }


  function participationResponse (value) {
    return function (method, url) {
      var things = parseKeyValue(url.split('?', 2)[1]);
      if (things.force) {
        value = things.force;
      }
      return [200, {
        experiment: {name: things.experiment},
        alternative: {name: value},
        client_id: things.client_id
      }];
    };
  }

  var flush;

  function expectParticipationRequest(value) {
    inject(function ($httpBackend) {
      $httpBackend.expectGET(/^\/participate/).respond(participationResponse(value));
      flush = function () {
        $httpBackend.flush();
      };
    });
  }

  function expectConversion(experiment, kpi) {
    inject(function ($httpBackend) {
      var rx = '^\/convert.*experiment='+experiment;
      if (typeof kpi !== 'undefined') {
        rx = rx + '.*kpi=' + kpi;
      }
      $httpBackend.expectGET(new RegExp(rx)).respond({});
    });
  }


  describe ('configuration', function () {
    it ('can accept an injectable function for the clientId', function () {
      helper.module(prxxp, function (prxperimentProvider, $provide) {
        $provide.constant('myClientId', 'testing');
        prxperimentProvider.clientId(function (myClientId) {
          return myClientId;
        });
      });

      inject(function (prxperiment) {
        expect(prxperiment.clientId).toResolveTo('testing');
      });
    });

    it ('can be disabled', function () {
      helper.module(prxxp, function (prxperimentProvider) {
        prxperimentProvider.enabled(false);
      });

      inject(function (prxperiment) {
        expect(prxperiment.run('experiment', ['asd', 'fgh']).then(function (x) { return x.toString(); })).toResolveTo('asd');
      });
    });
  });


  describe ('when configured', function () {
    var prxperiment;

    beforeEach(helper.module(prxxp, function (prxperimentProvider) {
      prxperimentProvider.clientId('fooBar').base('');
    }));

    beforeEach(inject(function (_prxperiment_) {
      prxperiment = _prxperiment_;
      prxperiment.flushActive();
    }));

    it ('can do experiments', function () {
      expectParticipationRequest('option2');
      var p;
      prxperiment.run('experiment', ['option1', 'option2']).then(function (participation) {
        p = participation;
      });
      flush();
      expect(p.alternative).toEqual('option2');
    });

    it ('memoizes experiments', function () {
      var exp = prxperiment.run('experiment', ['option2', 'option3']);
      expect(prxperiment.run('experiment')).toBe(exp);
    });

    it ('can force existing experiments to have a certain value', function () {
      expectParticipationRequest('option2');
      var x, p = prxperiment.run('experiment', ['option1', 'option2']).then(function (c) { x = c; });
      flush();
      expect(x.choice).toEqual('option2');
      prxperiment.addForce('experiment', 'option1');
      expect(x.choice).toEqual('option1');
    });

    it ('can force experiments before they are run', function () {
      prxperiment.addForce('experiment', 'okval');
      expectParticipationRequest('nokayval');
      var x, p = prxperiment.run('experiment', ['nokayval', 'okval']).then(function (c) { x = c; });
      flush();
      expect(x.choice).toEqual('okval');
    });

    it ('can force experiments before they are resolved', function () {
      expectParticipationRequest('4');
      var x, p = prxperiment.run('xp', ['1', '2', '3', '4']).then(function (c) { x = c; });
      prxperiment.addForce('xp', '2');
      flush();
      expect(x.choice).toEqual('2');
    });

    it ('refuses to force an invalid alternative', function () {
      expectParticipationRequest('1');
      var x, p = prxperiment.run('xp', ['1', '2']).then(function (c) { x = c; });
      prxperiment.addForce('xp', '3');
      flush();
      expect(x.choice).toEqual('1');
    });

    it ('can convert', function () {
      expectParticipationRequest('1');
      expectConversion('xp');
      prxperiment.run('xp', ['1', '2']).convert();
      flush();
    });

    it ('can convert with kpi', function () {
      expectParticipationRequest('1');
      expectConversion('xp', 'asd');
      prxperiment.run('xp', ['1', '2']).convert('asd');
      flush();
    });

    it ('calls toString the choice', function () {
      expectParticipationRequest('option2');
      var x;
      prxperiment.run('experiment', ['option1', 'option2']).then(function (p) { x = p; });
      flush();
      expect(x.toString()).toEqual('option2');
    });

    it ('flushes active experiments on the start of state changes', inject(function ($rootScope) {
      spyOn(prxperiment, 'flushActive');
      $rootScope.$broadcast('$stateChangeStart');
      expect(prxperiment.flushActive).toHaveBeenCalled();
    }));

    it ('flushes active experiments by calling unforce on them', function () {
      expectParticipationRequest('option1');
      var exp = prxperiment.run('experiment', ['option1', 'option2']);
      spyOn(exp, 'unforce');
      prxperiment.flushActive();
      expect(exp.unforce).toHaveBeenCalled();
    });

    it ('unforces post resolve', function () {
      expectParticipationRequest('option1');
      var exp = prxperiment.run('experiment', ['option1', 'option2']);
      exp.set('option2');
      flush();
      expect(exp.then(function (s) { return s.toString(); })).toResolveTo('option2');
      exp.unforce();
      expect(exp.then(function (s) { return s.toString(); })).toResolveTo('option1');
    });

    it ('unforces pre resolve', function () {
      expectParticipationRequest('option1');
      var exp = prxperiment.run('experiment', ['option1', 'option2']);
      exp.set('option2');
      exp.unforce();
      flush();
      expect(exp.then(function (s) { return s.toString(); })).toResolveTo('option1');
    });

    it ('noops when unforce is meaningless', function () {
      expectParticipationRequest('option1');
      var exp = prxperiment.run('experiment', ['option1', 'option2']);
      flush();
      exp.unforce();
      expect(exp.then(function (s) { return s.toString(); })).toResolveTo('option1');
    });

    describe ('get', function () {
      it ('returns the resolved participation', function () {
        expectParticipationRequest('option1');
        var exp = prxperiment.run('experiment', ['option1', 'option2']);
        expect(prxperiment.get('experiment')).not.toBeDefined();
        flush();
        expect(prxperiment.get('experiment')).toBeDefined();
        expect(exp).toResolveTo(prxperiment.get('experiment'));
      });
    });

    describe ('tryconvert', function () {
      it ('converts an experiment if it is running', function () {
        expectParticipationRequest('option1');
        prxperiment.run('experiment', ['option1', 'option2']).then(function (x) {
          spyOn(x, 'convert');
          return x;
        });
        prxperiment.tryConvert('experiment');
        flush();
        expect(prxperiment.get('experiment').convert).toHaveBeenCalled();
      });

      it ('does nothing if the experiment is not running', function () {
        prxperiment.tryConvert('experiment');
      });
    });

    it ('adds forces automatically when the query is updated', inject(function ($location, $rootScope) {
      spyOn(prxperiment, 'addForce');
      $location.search('ok', 'yes');
      $rootScope.$apply();
      $location.search('prxp-force-name', 'value');
      $rootScope.$apply();
      expect(prxperiment.addForce).toHaveBeenCalledWith('name', 'value');
    }));
  });
});
