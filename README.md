# redux-power-armor
WIP
util for quickly setting up and testing a redux store
- define actions and reducers in a large config object
- actions are standardized to the structure `{type: string: data: object}`
- define an action data json schema for each action with the key 'dataSchema'
- define a reducer for each action
- define a state json schema
- define a default store state 
- app is auto tested against state schema after store is created with actions generated against the defined action types and their dataSchemas (if applicable)

run testRun.js for demo
