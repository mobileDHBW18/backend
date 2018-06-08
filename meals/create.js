'use strict'

const AWS = require('aws-sdk')
const uuid = require('uuid')
const time = require('../lib/timeUtil')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.create = (event, context, callback) => {
  const timestamp = time.now()
  const data = JSON.parse(event.body)
  if (typeof data.name !== 'string') {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the mensa item.'
    })
    return
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_MEALS,
    Item: {
      id: uuid.v1(),
      name: data.name,
      mensa: data.mensa,
      categories: {
        fish: data.categories.fish,
        chicken: data.categories.chicken,
        veg: data.categories.veg,
        pig: data.categories.pig,
        beef: data.categories.beef
      },
      ingrediences: data.ingrediences,
      rating: 0.0,
      ratingsNum: 0,
      price: data.price,
      pic: null,
      date: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  }

  // write the mensa to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the mensa item.'
      })
      return
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    }

    callback(null, response)
  })
}
