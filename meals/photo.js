'use strict'

const AWS = require('aws-sdk')
const Clarifai = require('clarifai')
const nsfwClarifaiModelID = 'e9576d86d2004ed1a38ba0cf39ecb4b1'

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
const app = new Clarifai.App({
  apiKey: 'cd39d32638754a99b969a880c2f6317e'
})

const deleteImage = (bucket, key) => {
  s3.deleteObject({ Bucket: bucket, Key: key },
    (error, data) => {
      error
        ? console.log(error, error.stack)
        : console.log(`deleted ${key} in bucket ${bucket}`)
    })
}

const updateMealDocument = (key, fileURL) => {
  const gerichtID = key.split('/')[0]

  const params = {
    TableName: process.env.DYNAMODB_TABLE_MEALS,
    Key: {
      id: gerichtID
    }
  }

  // fetch meal from the database
  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.error(error)
    } else {
      const picArray = result.Item.pic
      picArray.push(fileURL)

      // Add Update Properties to Params
      params.ExpressionAttributeValues = {
        ':pic': picArray
      }
      params.UpdateExpression = 'SET pic = :pic'
      params.ReturnValues = 'ALL_NEW'

      dynamoDb.update(params, (error, result) => {
        if (error) console.log(error)
        console.log(result)
      })
    }
  })
}

const processUploadRecord = record => {
  const region = process.env.REGION
  const bucket = process.env.S3_BUCKET_PHOTOS
  const key = record.s3.object.key
  const fileURL = [
    'https://s3.',
    region,
    '.amazonaws.com/',
    bucket,
    '/',
    key
  ].join('')

  app.models.predict(nsfwClarifaiModelID, fileURL)
    .then(
      response => {
        const concepts = response.outputs[0].data.concepts
        const nsfw = concepts.find(c => c.name === 'nsfw').value > 0.45

        nsfw
          ? deleteImage(bucket, key)
          : updateMealDocument(key, fileURL)
      },

      error => console.error(error)
    )
}

/** ==================== HANDLER ==================== */
module.exports.process = event => {
  event.Records.forEach(processUploadRecord)
}
