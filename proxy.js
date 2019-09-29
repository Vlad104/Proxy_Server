const request = require('request');
const ReqHistory = require('./history');
const openssl = require('openssl-nodejs');
const config = require("./config");
const fs = require('fs');

function save(req) {
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

function extract(req) {
    const { url, cookies, ip, method, params, path, query, body, headers } = req;

    return { url, cookies, ip, method, params, path, query, body, headers };
}

const pass = function(req, res) {
    console.log('coonection');
    if (req.headers.host === 'localhost' && req.query.id) {
        proxyResend(req, res);
        return;
    }

    const data = extract(req);
    // save(data);
    
    // const target = 'http://localhost:3001';
    const target = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    console.log('to: ', target);
    sendToTarget(req, res, target);
}

function sendToTarget(req, res, target) {
    // generateCertificate(req.headers.host, () => {
        const options = {
            url: target,
            headers: req.headers,
            // key: fs.readFileSync(`./ssl/${req.headers.host}.key`),
            // cert: fs.readFileSync(`./ssl/${req.headers.host}.crt`),
        };
    
        if (req.method === 'GET') {
            request.get(options).pipe(res);
        } else if (req.method === 'POST') {
            request.post(options, req.body).pipe(res);
        } else if (req.method === 'PUT') {
            request.put(options, req.body).pipe(res);
        }
    // });
}

function proxyResend(req, res) {
    if (!req.query.id) {
        res.sendStatus(502);
        return;
    }

    if (req.query.id === 'all') {
        sendList(res);
        return;
    }

    resend(req.query.id, res);
}

function sendList(res) {
    ReqHistory.find({}, '_id request', (err, requests) => {
        if (err) {
          res.sendStatus(500);
        } else {
          const result = requests.map((req) => req._id);
          res.send({ result });
        }
    }).sort({_id: -1});
}

function resend(id, res) {
    const target = 'http://localhost:3001';
    ReqHistory.findById(id, (err, req) => {
        if (err) {
            res.sendStatus(404);
            return;
        } 
        
        sendToTarget(req.request, res, target);
    });
}

const connect = function(req, res, next) {
    console.log('NEW SSL');
    generateCertificate(req.host, () => {
        next();
    });
}

function generateCertificate(domain, callback) {
    // eeee callback-hell
    openssl(`openssl genrsa -out ./ssl/${domain}.key 2048`, () => {
        openssl(`openssl req -new -sha256 -key ${domain}.key -subj "/C=RF/ST=M/O=Vlad/CN=Vlad" -out ./ssl/${domain}.csr`, () => {
            openssl(`openssl x509 -req -in ./ssl/${domain}.csr -CA ./ssl/rootCA.crt -CAkey ./ssl/rootCA.key -CAcreateserial -out ./ssl/${domain}.crt -days 500 -sha256`, () => {
                callback();
            });
        });
    });
}

module.exports = {
    pass: pass,
    connect: connect,
};
