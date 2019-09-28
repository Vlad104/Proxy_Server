const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const proxy = require('./proxy');
const config = require("./config");
// const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// const ssl = {
//     key: fs.readFileSync(config.ssl.key),
//     cert: fs.readFileSync(config.ssl.cert),
// }

app.connect('*', proxy.connect);
app.all('*', proxy.pass);

mongoose.connect(config.dbURL, config.dbOptions);
mongoose.connection
  .once('open', () => {
    console.log('Mongo DB connected');
    app.listen(process.env.PORT || config.port, 'localhost', () =>
      console.log(`Server start on port ${config.port} ...`)
    );
  })
  .on('error', error => console.warn(error));
