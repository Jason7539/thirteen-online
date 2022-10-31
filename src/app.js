const express = require('express');
const app = express();
const port = 8080;
const path = require('path')
const parentDir = path.resolve(__dirname, '..');


app.use(express.static(path.join(__dirname, "public")));



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
})

app.listen(port, () => {
  console.log(`example app listening on port ${port}`)
})
