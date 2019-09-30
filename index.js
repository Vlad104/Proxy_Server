const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const proxy = require('./proxy');
const config = require("./config");
const fs = require('fs');
const http = require('http');
const https = require('https');

const options = {
  key: fs.readFileSync(config.ssl.keyPath),
  ca: fs.readFileSync(config.ssl.caPath),
  cert: fs.readFileSync(config.ssl.certPath),
  rejectUnauthorized: false,
  requestCert: true,
  agent: false
}

const app = express();
app.use(bodyParser.json());
app.connect('*', proxy.connect);
app.all('*', proxy.pass);

const appInsequre = express();
// appInsequre.all('*', (req, res) => {
//   res.redirect(`https://${req.headers.host}${req.originalUrl}`);
// });
appInsequre.use(bodyParser.json());
appInsequre.all('*', proxy.pass);

mongoose.connect(config.dbURL, config.dbOptions);
mongoose.connection
  .once('open', () => {
    console.log('Mongo DB connected');

    http.createServer(appInsequre).listen(config.portHttp, () => {
      console.log('HTTP server start ...');
    });

    https.createServer(options, app).listen(config.portHttps, () => {
      console.log('HTTPS server start ...');
    });

  }).on('error', error => console.warn(error));
