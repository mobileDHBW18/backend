'use strict'

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'maaaate.',
      input: event
    })
  }

  callback(null, response)
}
