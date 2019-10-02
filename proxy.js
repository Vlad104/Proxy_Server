const request = require('request');
const ReqHistory = require('./history');
var selfsigned = require('selfsigned');

const certCache = {};

const createCert = function(name) {
    if (certCache[name]) {
        return certCache[name];
    }

    const attrs = [{ name: 'commonName', value: name}];
    const pem = selfsigned.generate(attrs, {
      keySize: 2048,
      algorithm: 'sha256',
      extensions: [{ name: 'basicConstraints', cA: true }],
    });
    certCache[name] = pem;

    return pem;
}

// Save request to MongoDB
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

    // if request's target is localhost (proxy) then return only: 200
    // but if you need to repeat same previous request
    // you may get list of all requests by localhost?id=all
    // and then repeat current request with localhost?id={id}
    if (req.headers.host === 'localhost') {
        if (req.query.id) {
            proxyResend(req, res);
            return;
        }
        res.sendStatus(200);
        return;
    }

    const data = extract(req);
    save(data); // save in MongoDB

    const target = `${req.protocol}://${req.headers.host}${req.path}`;
    console.log('to: ', target);
    sendToTarget(req, res, target);
}

function sendToTarget(req, res, target) {
        const options = {
            url: target,
            headers: req.headers,
        };
    
        // req.pipe(request(options))
        (function(req, options) {
            if (req.method === 'GET' || req.method === 'HEAD') {
                return request.get(options);
            } else if (req.method === 'POST') {
                return request.post(options, req.body);
            } else if (req.method === 'PUT') {
                return request.put(options, req.body);
            } else if (req.method === 'PATCH') {
                return request.patch(options, req.body);
            }
        })(req, options)
        .on('error', (error) => res.status(502).send(error.message))
        .pipe(res)
}

// repeat precious request
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
    resend(req.query.id, req, res, target);
}

// send list of stored requests
function sendList(res) {
    ReqHistory.find({}, '_id request', (err, requests) => {
        if (err) {
          res.sendStatus(500);
        } else {
          const result = requests.map((req) => [req._id, `${req.request.protocol}://${req.request.headers.host}${req.request.path}`]);
          res.send({ result });
        }
    }).sort({_id: -1});
}

// send request from store
function resend(id, req, res, target) {
    ReqHistory.findById(id, (err, request) => {
        if (err) {
            res.sendStatus(404);
            return;
        } 

        sendToTarget(request.request, res, target);
    });
}

module.exports = {
    pass: pass,
    createCert: createCert,
};
