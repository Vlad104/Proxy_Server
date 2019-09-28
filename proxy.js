const request = require('request');
const ReqHistory = require('./history');

const save = function(req) {
    const newReqHistory = new ReqHistory({
        request: req,
    });

    newReqHistory.save((err, data) => {
        if (!err) {
            console.log('OK');
            console.log(data);
        } else {
            console.log('ERROR');
            console.log(err);
        }
    });
}

const extract = function(req) {
    const { url, cookies, ip, method, params, path, query, body, headers } = req;

    return { url, cookies, ip, method, params, path, query, body, headers  };
}

const pass = function(req, res) {
    const data = extract(req);
    save(data);
    const target = `${req.protocol}'://'${req.headers.host}${req.originalUrl}`;
    console.log(target);

    if (req.method === 'GET') {
        request.get(target).pipe(res);
    } else if (req.method === 'POST') {
        request.post(target, req.body).pipe(res);
    }
}

const connect = function(req, res) {
    console.log('connect');
}

module.exports = {
    pass: pass,
    connect: connect,
};
