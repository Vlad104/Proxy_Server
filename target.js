const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

function extract(req) {
    const { url, cookies, ip, method, params, path, query, body, headers } = req;

    return { url, cookies, ip, method, params, path, query, body, headers };
}

app.all('*', function (req, res) {
    const body = extract(req);
    console.log(body);

    res.send({data: 'Privet from Target'});
});

app.listen(3001, function () {
    console.log('Example app listening on port 3001!');
});
