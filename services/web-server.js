const https = require('https');
// const http = require('http');
const port = process.env.PORT || 3000;

// Certs
// openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout ./jsDataServices.key -out jsDataServices.crt
const fs = require('fs');
var key = fs.readFileSync(__dirname + '/../sslcert/jsDataServices.key');
var cert = fs.readFileSync(__dirname + '/../sslcert/jsDataServices.crt');
var appOptions = {
    key: key,
    cert: cert
}

let server;

function initialize() {
    return new Promise((resolve, reject) => {
        const app = require('../app');
        server = https.createServer(appOptions, app);
        // server = http.createServer(appOptions, app);

        server.listen(port)
            .on('listening', () => {
                console.log(`Server listening on port: ${port}`);

                resolve();
            })
            .on('error', err => {
                reject(err);
            });
    });
}

function close() {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

module.exports.close = close;
module.exports.initialize = initialize;