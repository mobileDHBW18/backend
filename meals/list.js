'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const params = {
  TableName: process.env.DYNAMODB_TABLE_MEALS
}

module.exports.list = (event, context, callback) => {
  const qs = event.queryStringParameters

  if (qs && qs.mensa && qs.date) {
    params.FilterExpression = '#mensa = :mensa_val AND #date = :date_val'
    params.ExpressionAttributeNames = {
      '#mensa': 'mensa',
      '#date': 'date'
    }
    params.ExpressionAttributeValues = {
      ':mensa_val': qs.mensa,
      ':date_val': qs.date
    }
  }

  // fetch all meals from the database
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the meals.'
      })
      return
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items)
    }
    callback(null, response)
  })
}
