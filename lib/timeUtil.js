'use strict'

exports.now = () => new Date(Date.now()).toJSON().slice(0, 10)
