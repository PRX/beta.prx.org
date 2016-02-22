var helper      = require('./spec-helper');
var modelconfig = require('./prx-model-config');
var halmock     = require('./angular-hal-mock');

describe('prx.modelConfig', function () {

  beforeEach(helper.module(modelconfig, halmock));

  it('sets a correct stateName and stateParams by default', inject(function (ngHal) {
    var anything = ngHal.mock('http://meta.prx.org/model/anything', {id: 'asdf'});
    var something = ngHal.mock('http://meta.prx.org/model/something/different');

    expect(anything.stateName).toEqual('anything.show');
    expect(something.stateName).toEqual('something.show');

    var params = anything.stateParams();

    expect(params).toEqual({anythingId: 'asdf'});
    expect(anything.stateParams()).toBe(params);
  }));

});
