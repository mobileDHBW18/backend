'use strict'

const uuid = require('uuid')
const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime()
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
        veg: data.categories.veg,
        chicken: data.categories.chicken,
        beef: data.categories.beef,
        gluten: data.categories.gluten,
        pig: data.categories.pig,
        fish: data.categories.fish
      },
      ingrediences: data.ingrediences,
      allergens: data.allergens,
      rating: 0.0,
      ratingsNum: 0,
      price: data.price,
      pic: null,
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
