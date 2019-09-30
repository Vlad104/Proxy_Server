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
    const { url, cookies, ip, method, params, path, query, body, headers, protocol } = req;

    return { url, cookies, ip, method, params, path, query, body, headers, protocol };
}

const pass = function(req, res) {
    console.log('coonection');
    if (req.headers.host === 'localhost') {
        if (req.query.id) {
            proxyResend(req, res);
            return;
        }
        res.sendStatus(200);
        return;
    }

    const data = extract(req);
    // save(data);
    
    // const target = 'http://localhost:3001';
    // const target = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
    const target = `${req.protocol}://${req.headers.host}${req.path}`;
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
            key: req.protocol === 'https' ? fs.readFileSync(config.ssl.keyPath) : null,
            cert: req.protocol === 'https' ? fs.readFileSync(config.ssl.certPath) : null,
        };
    
        // (function(req, req, options) {
        //     if (req.method === 'GET') {
        //         return request.get(options);
        //     } else if (req.method === 'POST') {
        //         return request.post(options, req.body);
        //     } else if (req.method === 'PUT') {
        //         return request.put(options, req.body);
        //     }
        // })(req, req, options)
        req.pipe(request(options)).on('error', (error) => {
            res.status(502).send(error.message);
        })
        .pipe(res)
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

    const target = `${req.protocol}://${req.headers.host}${req.path}`;
    resend(req.query.id, res, target);
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

function resend(id, res, target) {
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
