const oracledb = require('oracledb');
var dbConfig = require('../config/database.js');

function initPoolSession(connection, requestedTag, cb) {
    connection.execute(
        `begin
           execute immediate 'alter session set NLS_TIMESTAMP_TZ_FORMAT=''YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"''';
           execute immediate 'alter session set NLS_TIMESTAMP_FORMAT=''YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"''';
        end;`,
        cb
    );
}

async function initialize() {
    //dbConfig.dbPool['sessionCallback'] = initPoolSession;
    const config = {
        db: {
            user: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD_DECRYPTED,
            connectString: `${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE}`,
            poolMax: dbConfig.dbPool.poolMax,
            poolMin: dbConfig.dbPool.poolMin,
            poolIncrement: dbConfig.dbPool.poolIncrement,
            enableStatistics: true
        }
    }
    const pool = await oracledb.createPool(config.db);
}

async function close() {
    await oracledb.getPool().close(30);
}

function simpleExecute(statement, binds = [], opts = {}) {
    return new Promise(async (resolve, reject) => {
        let conn;

        opts.outFormat = oracledb.OBJECT;
        opts.autoCommit = true;

        try {
            conn = await oracledb.getConnection();

            const result = await conn.execute(statement, binds, opts);

            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            if (conn) {
                // conn assignment worked, need to close
                try {
                    await conn.close();
                } catch (err) {
                    console.log(err);
                }
            }
        }
    });
}

module.exports.simpleExecute = simpleExecute;
module.exports.close = close;
module.exports.initialize = initialize;
