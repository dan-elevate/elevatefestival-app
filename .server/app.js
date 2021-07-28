
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
let rawdata = fs.readFileSync('apple-app-site-association.json');
let student = JSON.parse(rawdata);
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.send(student)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})