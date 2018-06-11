'use strict'

const AWS = require('aws-sdk')
const Raven = require('raven')
const RavenWrapper = require('serverless-sentry-lib')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const round = num => Math.round(num * 10) / 10

module.exports.get = RavenWrapper.handler(Raven, (event, context, callback) => {
  /** exit function immediately if invoked by serverless-warmup */
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_MEALS,
    Key: {
      id: event.pathParameters.id
    }
  }

  // fetch meal from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the meal item.'
      })
      return
    }

    result.Item.rating = round(result.Item.rating)

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item)
    }
    callback(null, response)
  })
})
