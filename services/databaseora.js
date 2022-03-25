const oracledb = require('oracledb');
var dbConfig = require('../config/databaseora.js');

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
    const pool = await oracledb.createPool(dbConfig.dbPool);
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

//
//  Example of using simpleExecute function
//
// app.get('/', async (req, res) => {
//     const result = await database.simpleExecute('select user, systimestamp from dual');
//     const user = result.rows[0].USER;
//     const date = result.rows[0].SYSTIMESTAMP;

//     res.end(`DB user: ${user}\nDate: ${date}`);
//   });
