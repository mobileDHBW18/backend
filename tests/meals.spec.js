/** WORK IN PROGRESS */
/* eslint-env jest, mocha */

describe('get', () => {
  const get = require('../meals/get').get
  const context = {}

  it('should exit immidiately if source is serverless-warmup', (done) => {
    const event = {
      source: 'serverless-plugin-warmup'
    }

    const callback = (ctx, data) => {
      expect(data).toBe('Lambda is warm!')
      done()
    }

    get(event, context, callback)
  })
})

describe('list', () => {
  const list = require('../meals/list').list
  const context = {}

  it('should exit immidiately if source is serverless-warmup', (done) => {
    const event = {
      source: 'serverless-plugin-warmup'
    }

    const callback = (ctx, data) => {
      expect(data).toBe('Lambda is warm!')
      done()
    }

    list(event, context, callback)
  })
})

describe('rate', () => {
  const rate = require('../meals/update').rate
  const context = {}

  it('should exit immidiately if source is serverless-warmup', (done) => {
    const event = {
      source: 'serverless-plugin-warmup'
    }

    const callback = (ctx, data) => {
      expect(data).toBe('Lambda is warm!')
      done()
    }

    rate(event, context, callback)
  })
})
