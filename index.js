const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const proxy = require('./proxy');
const config = require("./config");
const fs = require('fs');
const https = require('https');

const ssl = {
  key: fs.readFileSync(config.ssl.keyPath),
  cert: fs.readFileSync(config.ssl.certPath),
}

const app = express();
app.use(bodyParser.json());


app.connect('*', proxy.connect);
app.all('*', proxy.pass);

mongoose.connect(config.dbURL, config.dbOptions);
mongoose.connection
  .once('open', () => {
    console.log('Mongo DB connected');
    // app.listen(process.env.PORT || config.port, 'localhost', () =>
    //   console.log(`Server start on port ${config.port} ...`)
    // );
    https.createServer({
      key: ssl.key,
      cert: ssl.cert,
    }, app).listen(config.port, () => {
      console.log('Server start ...');
    })
  })
  .on('error', error => console.warn(error));
