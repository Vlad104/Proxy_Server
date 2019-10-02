const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const proxy = require('./proxy');
const http = require('http');
const https = require('https');
const tls = require('tls');
const config = require("./config");

const pem = proxy.createCert('localhost');

const options = {
  key: pem.private,
  ca: pem.public,
  cert: pem.cert,
  rejectUnauthorized: false,
  requestCert: true,
  SNICallback: (name, callback) => {
    const pem = proxy.createCert(name);
    const ctx = tls.createSecureContext({key: pem.private, cert: pem.cert});
    callback(null, ctx);
  }
}

// https server
const app = express();
app.use(bodyParser.json());
app.all('*', proxy.pass);

// http server
const appInsecure = express();
appInsecure.use(bodyParser.json());
appInsecure.all('*', proxy.pass);

// Connect to MongoDB for requests storing
mongoose.connect(config.dbURL, config.dbOptions);
mongoose.connection
  .once('open', () => {
    console.log('Mongo DB connected');

    http.createServer(appInsecure).listen(config.portHttp, () => {
      console.log('HTTP server start ...');
    });

    https.createServer(options, app).listen(config.portHttps, () => {
      console.log('HTTPS server start ...');
    });

  }).on('error', error => console.warn(error));
