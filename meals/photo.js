'use strict'

const AWS = require('aws-sdk')
const Clarifai = require('clarifai')
const nsfwClarifaiModelID = 'e9576d86d2004ed1a38ba0cf39ecb4b1'

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })
const app = new Clarifai.App({
  apiKey: 'cd39d32638754a99b969a880c2f6317e'
})

module.exports.process = event => {
  const region = process.env.REGION
  const bucket = process.env.S3_BUCKET_PHOTOS

  event.Records.forEach(record => {
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
          const nsfw = concepts.find(c => c.name === 'nsfw').value > 0.15

          if (nsfw) {
            s3.deleteObject({Bucket: bucket, Key: key},
              (err, data) => {
                err
                  ? console.log(err, err.stack)
                  : console.log(`deleted ${key} in bucket ${bucket}`)
              })
          } else {
            console.log('SFW')
            /** HERE BE DYNAMO STUFF */
          }

          console.log(`
            ${fileURL}

            NSFW: ${nsfw}
          `)
        },
        err => console.error(err)
      )
  })
}
