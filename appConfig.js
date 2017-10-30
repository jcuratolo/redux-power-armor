
module.exports = {
  info: {
    description: '',
    version: '',
    title: '',
  },
  actions: {
    SELECT_REDDIT: {
      reducer: (state, {data}) => ({...state, reddit: data.reddit }),
      dataSchema: {
        type: 'object',
        properties: {
          reddit: {type: 'string'}
        },
        required: ['reddit']
      },
    },
    REQUEST_POSTS: {
      reducer: (state, action) => ({...state, isFetching: true, didInvalidate: false}),
      dataSchema: {
        type: 'object',
      }
    },
    RECEIVE_POSTS: {
      reducer: (state, {data}) => ({
        ...state, 
        ...data, 
        isFetching: false, 
        items: data.posts, 
        lastUpdated: data.receivedAt 
      }),
      dataSchema: {
        type: 'object',
        properties: {
          reddit: {type: 'string'},
          posts: {type: 'array', items: {type: 'string'}},
          receivedAt: {type: 'string'}
        }
      },
    },
    INVALIDATE_REDDIT: {
      dataSchema: { type: 'object' },
      reducer: (state, action) => ({...state, didInvalidate: true}),
    }
  },
  state: {
    initial: {
      reddit: 'reactjs',
      didInvalidate: false,
      isFetching: false,
      items: []
    },
    schema: {
      type: 'object',
      properties: {
        reddit: {type: 'string',},
        didInvalidate: {type: 'boolean'},
        isFetching: {type: 'boolean'},
        items: {type: 'array', items: {type: 'string'}}
      },
      required: ['reddit']
    },
  },
  options: {
    testActions: 100
  }
}