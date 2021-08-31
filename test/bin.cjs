#!/usr/bin/env node

'use strict'

const Joi = require('joi')

require('..')(
  'test-bin',
  {
    validator: Joi.any() // Joi.object({ ...
  },
  require('./index.cjs')
)
