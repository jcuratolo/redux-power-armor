var test = require('ava')
var createApp = require('./createApp')
var appConfig = require('./appConfig')

function createConfig() {
  return appConfig
}

var app, config

test.beforeEach(t => {
  config = createConfig()
  app = createApp(config)
})

test('it returns an app object', t => {
  t.is(typeof app, typeof {})
  t.is(typeof app.actions, typeof {})
})

test('app.actions has functions', t => {
  Object.keys(app.actions).forEach(key => {
    t.is(typeof app.actions[key], typeof function() {})
  })
})

test('app actions validate action data', t => {
  t.throws(() => app.actions.SELECT_REDDIT(1))
  t.notThrows(() => app.actions.SELECT_REDDIT('derp'))
})