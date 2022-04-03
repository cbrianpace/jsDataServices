const dotenv = require('dotenv');
const https = require('https');
const os = require('os');
dotenv.config({
    path: './config/jsDataServices.env',
});

dotenv.config({
    path: './config/config.env',
});

const cryptonite = require('./helpers/cryptonite');

process.env.DATABASE_PASSWORD_DECRYPTED = cryptonite.decryptdb(
    process.env.DATABASE_PASSWORD
);

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
process.env['HOSTNAME'] = os.hostname();

const dbConfig = require('./config/database.js');
const defaultThreadPoolSize = 4;
process.env.UV_THREADPOOL_SIZE =
    dbConfig.dbPool.poolMax + defaultThreadPoolSize;

let database = null;

if ( process.env.DATABASE_PLATFORM == "oracle") {
    database = require('./services/oracle.js');
}

if (process.env.DATABASE_PLATFORM == "postgres") {
    database = require('./services/postgres.js');
}

const ldap = require('./services/ldap.js');

console.log('PID: ', process.pid);

const server = require('./services/web-server.js');

async function startup() {
    console.log('Starting application');

    try {
        console.log('Using Database Platform: ' + process.env.DATABASE_PLATFORM);
        console.log('Initializing database module');

        await database.initialize();

    } catch (err) {
        console.error(err);

        process.exit(1); // Non-zero failure code
    }

    // try {
    //     console.log('Initializing LDAP configuration');

    //     await ldap.initialize();
    // } catch (err) {
    //     console.error(err);

    //     process.exit(1); // Non-zero failure code
    // }

    try {
        console.log('Initializing web server module');

        await server.initialize();
    } catch (err) {
        console.error(err);

        process.exit(1); // Non-zero failure code
    }
}

startup();

async function shutdown(e) {
    let err = e;

    console.log('Shutting down');

    try {
        console.log('Update database status');

        console.log('Closing database module');

        await database.close();
    } catch (err) {
        console.log('Encountered error', err);

        err = err || e;
    }

    try {
        console.log('Closing web server module');

        await server.close();
    } catch (e) {
        console.log('Encountered error', e);

        err = err || e;
    }

    console.log('Exiting process');

    if (err) {
        process.exit(1); // Non-zero failure code
    } else {
        process.exit(0);
    }
}

process.on('SIGTERM', () => {
    console.log('Received SIGTERM');

    shutdown();
});

process.on('SIGINT', () => {
    console.log('Received SIGINT');

    shutdown();
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught exception');
    console.error(err);

    shutdown(err);
});
