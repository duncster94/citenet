const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const crypto = require('crypto')
require('dotenv').config()

const app = express()

// Boilerplate
const port = process.env.WEBHOOK_PORT
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post('/payload', (req, res) => {
  try {
    const secret = process.env.WEBHOOK_SECRET
    // https://stackoverflow.com/questions/7480158/how-do-i-use-node-js-crypto-to-create-a-hmac-sha1-hash
    const hashedSecret = crypto.createHmac('sha1', secret)
      .update(req.body)
      .digest('hex')
    console.log(hashedSecret)
    console.log(req.body)
    // console.log(crypto.timingSafeEqual(hashedSecret))
  } catch (err) {
    console.log(err)
  }
})

app.listen(port, () => {
  console.log(`Server listening on Port ${port}`);
})