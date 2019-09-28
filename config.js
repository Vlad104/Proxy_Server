module.exports = {
  port: 3000,
  dbURL: 'mongodb://localhost:27017',
  dbOptions: { useMongoClient: true },
  ssl: {
      keyPath: '../some.pem',
      keyPath: '../some.cert',
  }
};
