const pgdb = require('pg');
var dbConfig = require('../config/database.js');
let pool = null;

// Query Convert
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

function queryConvert(parameterizedSql, params) {
    var _a = Object.entries(params).reduce(function (_a, _b) {
        var sql = _a[0], array = _a[1], index = _a[2];
        var key = _b[0], value = _b[1];
        return [sql.replace(":".concat(key), "$".concat(index)), __spreadArray(__spreadArray([], array, true), [value], false), index + 1];
    }, [parameterizedSql, [], 1]), text = _a[0], values = _a[1];
    return { text: text, values: values };
}

function initPoolSession(connection, requestedTag, cb) {
    connection.execute(
        `begin
           execute immediate 'alter session set NLS_TIMESTAMP_TZ_FORMAT=''YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"''';
           execute immediate 'alter session set NLS_TIMESTAMP_FORMAT=''YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"''';
        end;`,
        cb
    );
}

async function getPoolStats() {
    stats = {}
    stats.totalCount = pool.totalCount;
    stats.idleCount = pool.idleCount;
    stats.waitingCount = pool.waitingCount;

    return(stats)
}

async function initialize() {
    //dbConfig.dbPool['sessionCallback'] = initPoolSession;
    const config = {
        db: {
            host: process.env.DATABASE_HOST,
            port: process.env.DATABASE_PORT,
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD_DECRYPTED,
            database: process.env.DATABASE,
            max: dbConfig.dbPool.poolMax,
            connectionTimeoutMillis: dbConfig.dbPool.connectionTimeoutMillis,
            idleTimeoutMillis: dbConfig.dbPool.idleTimeoutMillis
        }
    }
    pool = new pgdb.Pool(config.db);
    const {rows, fields} = await pool.query("select now() as dt", null);
}

async function close() {
    await pool.end();
}

function simpleExecute(statement, binds = [], opts = {}) {
    return new Promise(async (resolve, reject) => {
        pool
            .connect()
            .then(client => {
                return client
                .query(queryConvert(statement, binds))
                .then(res => {
                    client.release()
                    resolve(res)
                })
                .catch(err => {
                    client.release()
                    reject(err)
                })
            })
    }
    )
}

module.exports.simpleExecute = simpleExecute;
module.exports.close = close;
module.exports.initialize = initialize;
module.exports.getPoolStats = getPoolStats;