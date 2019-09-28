module.exports = {
  port: 443,
  dbURL: 'mongodb://localhost:27017',
  dbOptions: {
    useUnifiedTopology: true
  },
  ssl: {
      keyPath: './proxy_server.key',
      certPath: './proxy_server.crt',
  }
};
