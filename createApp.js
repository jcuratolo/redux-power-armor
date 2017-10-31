var redux = require('redux')
var jsf = require('json-schema-faker');
var Ajv = require('ajv')
var ajv = new Ajv

var configSchema = {
  type: 'object',
  properties: {
    actions: {
      type: 'object'
    },
    state: {
      type: 'object',
      properties: {
        initial: {
          type: 'object'
        },
        schema: {
          type: 'object'
        }
      },
      required: ['initial', 'schema']
    },
    options: {
      type: 'object'
    }
  },
  required: ['actions', 'state']
}

var actionSchema = {
  type: 'object',
  properties: {
    dataSchema: {
      type: 'object',
    }
  },
}

function createReducer(config) {
  return (state = config.state.initial, action) => {
    return config.actions[action.type] ?
      config.actions[action.type].reducer(state, action) :
      state
  }
}

function createApp(config) {
  validateConfig(config)
  var reducer = createReducer(config)
  var store = redux.createStore(reducer, redux.applyMiddleware(...config.middleware || []))
  var actions = createBoundActions(config, store)

  runSelfTest(config, store)

  return {
    actions,
    store
  }
}

function createBoundActions(config, store) {
  return Object
    .keys(config.actions)
    .reduce(function (actions, actionType) {
      actions[actionType] = data => {
        var actionShouldHaveData = Boolean(config.actions[actionType].dataSchema)
        var action = { type: actionType }

        if (actionShouldHaveData) {
          validateActionData(config, actionType, data)
          action.data = data
        }

        store.dispatch(action)
      }

      return actions
    }, {})
}

function runSelfTest(config, store) {
  // Build fake actions. Use config.options.testActions for number of test actions
  // per type
  var fakeActionsByType = Object
    .keys(config.actions)
    .reduce((fakeActionsByType, actionType) => {
      fakeActionsByType[actionType] = fakeActionsByType[actionType] || []
      for (var i = 0; i < config.options.testActions; i++) {
        var action = {
          type: actionType
        }
        var dataSchema = config.actions[actionType].dataSchema

        if (dataSchema) action.data = jsf(dataSchema)

        fakeActionsByType[actionType].push(action)
      }

      return fakeActionsByType
    }, {})

  var totalActionCount = Object
    .keys(fakeActionsByType)
    .reduce((count, actionType) => count + fakeActionsByType[actionType].length, 0)

  // Dispatch fake actions, save resulting state
  var results = Object
    .keys(fakeActionsByType)
    .reduce((results, actionType) => {
      if (results.done) return results

      fakeActionsByType[actionType].forEach(action => {
        if (results.done) return results
        store.dispatch(action)
        var isValid = ajv.validate(config.state.schema, store.getState())

        if (isValid) {
          results.data.pass += 1
          return
        }

        results.done = true
        results.error = `ERROR: ${action.type} resulted in invalid state: 
        ${combineErrorMessages('state', ajv.errors)}
        ${JSON.stringify(store.getState(), null, 2)}
        `
      })

      return results
    }, {
      done: false,
      error: '',
      data: {
        pass: 0
      }
    })


  console.log(`Pass: ${results.data.pass} / ${totalActionCount}`, results.error)
}

function validateActionData(config, actionType, data) {
  if (!ajv.validate(config.actions[actionType], data))
    throw combineErrorMessages(`${actionType} `, ajv.errors)
}

function validateConfig(config) {
  if (!ajv.validate(configSchema, config)) {
    throw combineErrorMessages('config', ajv.errors)
  }

  Object.keys(config.actions).forEach(actionType => {
    var action = config.actions[actionType]

    // Action has bad dataSchema
    if (action.dataSchema && !ajv.validateSchema(action.dataSchema))
      throw `Action ${actionType} is missing a valid data schema`

    // Action aint got no reducer
    if (typeof action.reducer !== typeof
      function () {})
      throw `Action ${actionType} is missing a reducer`
  })
}

function combineErrorMessages(prefix = '', errors) {
  return errors.reduce((msg, error) => {
    return msg += `${prefix}${error.dataPath} ${error.message}`
  }, '')
}

module.exports = createApp