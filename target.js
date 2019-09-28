const express = require("express");

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

    res.send({data: 'Privet'});
});

app.listen(3001, function () {
    console.log('Example app listening on port 3001!');
});
