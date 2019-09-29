module.exports = {
  portHttp: 80,
  portHttps: 443,
  dbURL: 'mongodb://localhost:27017',
  dbOptions: {
    useUnifiedTopology: true
  },
  ssl: {
      keyPath: './ssl/rootCA.key',
      certPath: './ssl/rootCA.crt',
  }
};
