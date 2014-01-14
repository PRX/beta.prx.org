describe('prxp', function () {

  /* https://github.com/angular/angular.js/blob/01c5be4681e34cdc5f5c461b7a618fefe8038919/src/Angular.js#L1021 */
  function parseKeyValue(keyValue) {
    var obj = {}, key_value, key;
    angular.forEach(keyValue.split('&'), function(keyValue){
      // if ( keyValue ) {
        key_value = keyValue.split('=');
        key = tryDecodeURIComponent(key_value[0]);
        // if ( angular.isDefined(key) ) {
          var val = tryDecodeURIComponent(key_value[1]);
          if (!obj[key]) {
            obj[key] = val;
          } else if(angular.isArray(obj[key])) {
            obj[key].push(val);
          } else {
            obj[key] = [obj[key],val];
          }
        // }
      // }
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


  beforeEach(module('prx-experiments', function (prxperimentProvider) {
    prxperimentProvider.clientId('fooBar').base('');
  }));

  var prxperiment;

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

  it ('adds forces automatically when the query is updated', inject(function ($location, $rootScope) {
    spyOn(prxperiment, 'addForce');
    $location.search('ok', 'yes');
    $rootScope.$apply();
    $location.search('prxp-force-name', 'value');
    $rootScope.$apply();
    expect(prxperiment.addForce).toHaveBeenCalledWith('name', 'value');
  }));
});