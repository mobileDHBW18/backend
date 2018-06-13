'use strict'

const axios = require('axios')
const url = [
  'https://s3.',
  'region',
  '.amazonaws.com/',
  'bucket',
  '/',
  'fileKey'
].join('')

console.log(url)
