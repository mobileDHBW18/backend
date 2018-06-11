'use strict'

const AWS = require('aws-sdk')
const Raven = require('raven')
const time = require('../lib/timeUtil')
const RavenWrapper = require('serverless-sentry-lib')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const newRating = (oldRating, oldRatingNum, rating) => (oldRating * oldRatingNum + rating) / (oldRatingNum + 1)

module.exports.rate = RavenWrapper.handler(Raven, (event, context, callback) => {
  /** exit function immediately if invoked by serverless-warmup */
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUP - Lambda is warm!')
    return callback(null, 'Lambda is warm!')
  }

  const timestamp = time.now()
  const data = JSON.parse(event.body)

  // validation
  if (typeof data.rating !== 'number') {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the meal item.'
    })
    return
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

    const oldRating = result.Item.rating
    const oldRatingNum = result.Item.ratingsNum

    // Add Update Properties to Params
    params.ExpressionAttributeValues = {
      ':rating': newRating(oldRating, oldRatingNum, data.rating),
      ':ratingsNum': oldRatingNum + 1,
      ':updatedAt': timestamp
    }
    params.UpdateExpression = 'SET rating = :rating, ratingsNum = :ratingsNum, updatedAt = :updatedAt'
    params.ReturnValues = 'ALL_NEW'

    // update the todo in the database
    dynamoDb.update(params, (error, result) => {
      // handle potential errors
      if (error) {
        console.error(error)
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Couldn\'t fetch the todo item.'
        })
        return
      }

      // create a response
      const response = {
        statusCode: 200,
        body: JSON.stringify(result.Attributes)
      }
      callback(null, response)
    })
  })
})
