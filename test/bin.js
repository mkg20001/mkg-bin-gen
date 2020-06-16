#!/usr/bin/env node

'use strict'

const Joi = require('@hapi/joi')

require('..')(
  'test-bin',
  {
    validator: Joi.any() // Joi.object({ ...
  },
  require('.')
)
