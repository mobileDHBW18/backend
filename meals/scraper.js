'use strict'

const AWS = require('aws-sdk')
const uuid = require('uuid')
const Raven = require('raven')
const time = require('../lib/timeUtil')
const dishUtil = require('../lib/dishUtil')
const RavenWrapper = require('serverless-sentry-lib')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const parsePrice = str => parseFloat(str.replace(',', '.'))

const getDefaultDishImg = type => {
  switch (type) {
    case 'Fisch':
      return 'https://s3.eu-central-1.amazonaws.com/cantinr-dev-photos/fish.jpg'
    case 'Huhn':
      return 'https://s3.eu-central-1.amazonaws.com/cantinr-dev-photos/chicken.jpg'
    case 'Vegetarisch':
      return 'https://s3.eu-central-1.amazonaws.com/cantinr-dev-photos/veggie.jpg'
    case 'Schwein':
      return 'https://s3.eu-central-1.amazonaws.com/cantinr-dev-photos/pork.jpg'
    case 'Rind':
      return 'https://s3.eu-central-1.amazonaws.com/cantinr-dev-photos/beef.jpg'

    default:
      return 'https://s3.eu-central-1.amazonaws.com/cantinr-dev-photos/default.jpg'
  }
}

module.exports.scrape = RavenWrapper.handler(Raven, (event, context, callback) => {
  const timestamp = time.now()
  dishUtil.getHtml().then(html => {
    const dishes = dishUtil.getDishes(html)
    dishes.forEach(dish => {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_MEALS,
        Item: {
          id: uuid.v1(),
          name: dish.title,
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
          pic: [getDefaultDishImg(dish.type)],
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
})
