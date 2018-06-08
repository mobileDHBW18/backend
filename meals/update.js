'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.rate = (event, context, callback) => {
  const timestamp = new Date(Date.now()).toJSON().slice(0, 10)
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
    },
    ExpressionAttributeValues: {
      ':rating': data.rating,
      ':ratingsNum': 100,
      ':updatedAt': timestamp
    },
    UpdateExpression: 'SET rating = :rating, ratingsNum = :ratingsNum, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW'
  }

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
}
