#!/usr/bin/env node

debugger

import Bin from '../index.js'
import Joi from 'joi'

await Bin(
  'test-bin',
  {
    validator: Joi.any() // Joi.object({ ...
  },
  (await import('./index.cjs'))
)
