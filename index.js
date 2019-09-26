const express = require("express");
const request = require('request');

const app = express();

function getData(req) {
    const { url, cookies, ip, method, params, path, query, body } = req;

    return { url, cookies, ip, method, params, path, query, body };
}

const logger = function(data) {
    console.log(data);
}

app.all('*', function (req, res) {
    const body = getData(req);
    logger(body);

    if (req.method === 'GET') {
        request.get('http://localhost:3001').pipe(res);
    } else if (req.method === 'POST') {
        request.post('http://localhost:3001', req.body).pipe(res);
    }

    // res.send(body);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});