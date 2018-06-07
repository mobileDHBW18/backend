'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const getOldRating = (id, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_MEALS,
    Key: {
      id: id
    }
  }
  // fetch meal from the database
  dynamoDb.get(params, (error, result) => {
    error
      ? callback(error, null)
      : callback(null, result.Item)
  })
}

module.exports.rate = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const ID = event.pathParameters.id
  const data = JSON.parse(event.body)

  // validation
  if (typeof data.id !== 'string' || typeof data.rating !== 'number') {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the todo item.'
    })
    return
  }

  getOldRating(ID, (err, result) => {
    // no meal
    if (err) {
      console.error('No Meal Found')
      callback(null, {
        statusCode: 400,
        headers: { 'Content-Type': 'text/plain' },
        body: 'No Meal Found'
      })
    } else {
      const rating = result.rating
      const ratingNum = result.ratingNum++

      const newRating = data.rating

      const params = {
        TableName: process.env.DYNAMODB_TABLE_MEALS,
        Key: {
          id: ID
        },
        ExpressionAttributeNames: {
          '#todo_text': 'text'
        },
        ExpressionAttributeValues: {
          ':text': data.text,
          ':checked': data.checked,
          ':updatedAt': timestamp
        },
        UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt',
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
  })
}
