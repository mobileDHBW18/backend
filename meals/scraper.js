'use strict'

const AWS = require('aws-sdk')
const uuid = require('uuid')
const time = require('../lib/timeUtil')
const dishUtil = require('../lib/dishUtil')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const parsePrice = str => parseFloat(str.replace(',', '.'))

module.exports.scrape = (event, context, callback) => {
  const timestamp = time.now()
  dishUtil.getHtml().then(html => {
    const dishes = dishUtil.getDishes(html)
    dishes.forEach(dish => {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_MEALS,
        Item: {
          id: uuid.v1(),
          name: dish.contents[1],
          mensa: 'DHBW Mannheim Mensaria Metropol',
          categories: {
            fish: dish.type === 'Fisch',
            chicken: dish.type === 'Huhn',
            veg: dish.type === 'Vegetarisch',
            pig: dish.type === 'Schwein',
            beef: dish.type === 'Rind'
          },
          ingrediences: dish.contents,
          rating: 0.0,
          ratingsNum: 0,
          price: parsePrice(dish.price),
          pic: null,
          date: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
      // write the meal to the database
      dynamoDb.put(params, (error) => {
        // handle potential errors
        if (error) {
          console.error(error)
        }
      })
    })
    callback(null, 'done')
  })
}
