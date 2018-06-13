'use strict'

const Clarifai = require('clarifai')
const bucket = process.env.S3_BUCKET_PHOTOS
const region = process.env.REGION
const nsfwClarifaiModelID = 'e9576d86d2004ed1a38ba0cf39ecb4b1'

const app = new Clarifai.App({
  apiKey: 'cd39d32638754a99b969a880c2f6317e'
})

module.exports.process = event => {
  event.Records.forEach(record => {
    const fileKey = record.s3.object.key
    const fileURL = `https://s3.${region}.amazonaws.com/${bucket}/${fileKey}`

    app.models.predict(nsfwClarifaiModelID, fileURL)
      .then(
        response => {
          const concepts = response.outputs[0].data.concepts
          const nsfw = concepts.find(c => c.name === 'nsfw').value > 0.15

          console.log(`
            ${fileURL}

            ${JSON.stringify(concepts, null, 2)}

            NSFW: ${nsfw}
          `)
        },
        err => console.error(err)
      )
  })
}
