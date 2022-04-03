const oradb = require('oracledb')
const rdbms = process.env.DATABASE_PLATFORM
const db = require('./'+rdbms)
const dbTables = require('../helpers/dbTables')

const queryFeatures = require('../helpers/queryFeatures');
const schema = process.env.DATABASE_SCHEMA


////////////////////////////////////
// Pool Check
////////////////////////////////////
poolCheck = async () => {
    stats = '';

    if (rdbms == "oracle") {
        pool = await oradb.getPool();
        // pool._logStats();
        stats = await pool.getStatistics()
    } else {
        stats = await db.getPoolStats()
    }
    return(stats)
}

////////////////////////////////////
// SELECT
////////////////////////////////////
const getData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        var query = `select ${dbTables[req.params.table].columns} 
                     from ${schema}.${req.params.table} 
                     where 1=1 `;

        var binds = {};
        const context = {};
        var bindCount = 0;
        var fetchClob = {};
        var sqlObject = dbTables[req.params.table];

        context.id = parseInt(req.params.id, 10);
        context.offset = parseInt(req.query.offset, 10);
        context.limit = parseInt(req.query.limit, 10);
        context.fields = req.query.fields;
        context.sort = req.query.sort;

        [query, binds, bindCount] = queryFeatures.filter(
            req,
            sqlObject,
            query,
            binds,
            bindCount
        );
        [query, binds, bindCount] = queryFeatures.advancedFilter(
            req,
            sqlObject,
            query,
            binds,
            bindCount
        );
        [query, binds, bindCount] = queryFeatures.sorting(
            req,
            sqlObject,
            query,
            binds,
            bindCount
        );
        [query, binds, bindCount] = queryFeatures.pagination(
            req,
            sqlObject,
            query,
            binds,
            bindCount
        );

        if (sqlObject.clobcolumn) {
            fetchClob = {
                fetchInfo: {},
            };

            for (key in sqlObject.clobcolumn) {
                fetchClob.fetchInfo[`${sqlObject.clobcolumn[key]}`] = {
                    type: oradb.STRING,
                };
            }
        }

        const result = await db.simpleExecute(query, binds, fetchClob);

        return result;
    } catch (err) {
        console.log(query);
        throw err;
    }
};

////////////////////////////////////
// INSERT
////////////////////////////////////
const insertData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};

        var query = ` insert into ${schema}.${req.params.table} ` + '(';
        var values = ``;

        for (var key in req.body) {
            query += `${key}, `;
            if (
                dbTables[req.params.table].encryptColumns &&
                dbTables[req.params.table].encryptColumns.includes(key)
            ) {
                values += ` ds_util_pkg.encrypt_data(pText=> :${key},pKey=> :${key}ek), `;
                binds[`${key}ek`] = process.env.ENC_KEY;
            } else if (
                dbTables[req.params.table].dateColumns &&
                dbTables[req.params.table].dateColumns.includes(key)
            ) {
                //values += ` to_timestamp(:${key},'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), `;
                if (rdbms == "oracle" ) {
                    values += ` cast(to_utc_timestamp_tz(:${key}) at time zone dbtimezone as date), `;
                } else {
                    values += ` :${key}, `;
                }
            } else {
                values += ` :${key}, `;
            }
            binds[key] = req.body[key];
        }

        query = ` ${query.substring(
            1,
            query.length - 2
        )} ) values (${values.substring(1, values.length - 2)}) returning ${
            dbTables[req.params.table].pk}`;
            
        if (rdbms == "oracle" ) {
            query = query + ` into :O${dbTables[req.params.table].pk}`;
            key = 'O' + dbTables[req.params.table].pk;
            binds[key] = {
                dir: oradb.BIND_OUT,
                type: oradb.NUMBER,
            };
        }

        const result = await db.simpleExecute(query, binds);

        return result;
    } catch (err) {
        throw err;
    }
};

////////////////////////////////////
// DELETE
////////////////////////////////////
const deleteData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};
        var bindCount = 0;

        var query = ` delete from ${schema}.${req.params.table} where ${
            dbTables[req.params.table].pk
        } = :id `;
        binds.id = parseInt(req.params.id, 10);

        // Advanced Filtering
        var queryObj = {
            ...req.query,
        };
        // excludedFields.forEach((el) => delete queryObj[el]);

        for (var key in queryObj) {
            if (queryObj[key].constructor === objectConstructor) {
                for (var key2 in queryObj[key]) {
                    query += ` and ${key} `;
                    switch (key2) {
                        case 'lt':
                            query += ' < ';
                            break;
                        case 'le':
                            query += ' <= ';
                            break;
                        case 'gt':
                            query += ' > ';
                            break;
                        case 'gte':
                            query += ' >= ';
                            break;
                        case 'ne':
                            query += ' != ';
                            break;
                        default:
                            query += ' = ';
                    }
                    query += ` :b${bindCount} `;
                    binds[`b${bindCount}`] = queryObj[key][key2];
                    bindCount++;
                }
            } else {
                query += ` and ${key} = :b${bindCount} `;
                binds[`b${bindCount}`] = queryObj[key];
                bindCount++;
            }
        }

        const result = await db.simpleExecute(query, binds);

        return result;
    } catch (err) {
        throw err;
    }
};

////////////////////////////////////
// UPDATE
////////////////////////////////////
const updateData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};
        var bindCount = 0;

        var query = ` update ${schema}.${req.params.table} set `;

        for (var key in req.body) {
            if (key != dbTables[req.params.table].pk) {
                query += ` ${key} = `;
                if (
                    dbTables[req.params.table].encryptColumns &&
                    dbTables[req.params.table].encryptColumns.includes(key)
                ) {
                    query += ` ds_util_pkg.encrypt_data(pText=> :${key},pKey=> :${key}ek), `;
                    binds[`${key}ek`] = process.env.ENC_KEY;
                } else if (
                    dbTables[req.params.table].dateColumns &&
                    dbTables[req.params.table].dateColumns.includes(key)
                ) {
                    //query += ` to_timestamp(:${key},'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"'), `;
                    if (rdbms == "oracle" ) {
                        query += ` cast(to_utc_timestamp_tz(:${key}) at time zone dbtimezone as date), `;
                    } else {
                        query += ` :${key}, `;
                    }
                } else {
                    query += ` :${key}, `;
                }
                binds[key] = req.body[key];
            }
        }

        query = ` ${query.substring(1, query.length - 2)} where ${
            dbTables[req.params.table].pk
        } = :id `;
        binds.id = parseInt(req.params.id, 10);

        // Advanced Filtering
        var queryObj = {
            ...req.query,
        };
        // excludedFields.forEach((el) => delete queryObj[el]);

        for (var key in queryObj) {
            if (queryObj[key].constructor === objectConstructor) {
                for (var key2 in queryObj[key]) {
                    query += ` and ${key} `;
                    switch (key2) {
                        case 'lt':
                            query += ' < ';
                            break;
                        case 'le':
                            query += ' <= ';
                            break;
                        case 'gt':
                            query += ' > ';
                            break;
                        case 'gte':
                            query += ' >= ';
                            break;
                        case 'ne':
                            query += ' != ';
                            break;
                        default:
                            query += ' = ';
                    }
                    query += ` :b${bindCount} `;
                    binds[`b${bindCount}`] = queryObj[key][key2];
                    bindCount++;
                }
            } else {
                query += ` and ${key} = :b${bindCount} `;
                binds[`b${bindCount}`] = queryObj[key];
                bindCount++;
            }
        }

        var nls = null;

        if (rdbms == "oracle") {
            nls = await db.simpleExecute(
                'select * from NLS_SESSION_PARAMETERS'
            );
        }

        const result = await db.simpleExecute(query, binds);

        return result;
    } catch (err) {
        throw err;
    }
};

////////////////////////////////////
// UPDATE ALL
////////////////////////////////////
const updateDataAll = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};
        var bindCount = 0;

        var query = ` update ${schema}.${req.params.table} set `;

        for (var col in dbTables[req.params.table].columns) {
            if (
                dbTables[req.params.table].columns[col] !=
                dbTables[req.params.table].pk
            ) {
                query += ` ${dbTables[req.params.table].columns[col]} = `;
                if (
                    dbTables[req.params.table].encryptColumns &&
                    dbTables[req.params.table].encryptColumns.includes(
                        dbTables[req.params.table].columns[col]
                    )
                ) {
                    query += ` ds_util_pkg.encrypt_data(pText=> :${
                        dbTables[req.params.table].columns[col]
                    },pKey=> :${dbTables[req.params.table].columns[col]}ek), `;
                    binds[`${dbTables[req.params.table].columns[col]}ek`] =
                        process.env.ENC_KEY;
                } else if (
                    dbTables[req.params.table].dateColumns &&
                    dbTables[req.params.table].dateColumns.includes(
                        dbTables[req.params.table].columns[col]
                    )
                ) {
                    if (rdbms == "oracle" ) {
                        query += ` cast(to_utc_timestamp_tz(:${
                            dbTables[req.params.table].columns[col]
                        }) at time zone dbtimezone as date), `;
                    } else {
                        query += ` :${dbTables[req.params.table].columns[col]}, `;
                    }
                } else {
                    query += ` :${dbTables[req.params.table].columns[col]}, `;
                }
                binds[dbTables[req.params.table].columns[col]] =
                    req.body[dbTables[req.params.table].columns[col]];
            }
        }

        query = ` ${query.substring(1, query.length - 2)} where ${
            dbTables[req.params.table].pk
        } = :id `;
        binds.id = parseInt(req.params.id, 10);

        // Advanced Filtering
        var queryObj = {
            ...req.query,
        };
        // excludedFields.forEach((el) => delete queryObj[el]);

        for (var key in queryObj) {
            if (queryObj[key].constructor === objectConstructor) {
                for (var key2 in queryObj[key]) {
                    query += ` and ${key} `;
                    switch (key2) {
                        case 'lt':
                            query += ' < ';
                            break;
                        case 'le':
                            query += ' <= ';
                            break;
                        case 'gt':
                            query += ' > ';
                            break;
                        case 'gte':
                            query += ' >= ';
                            break;
                        case 'ne':
                            query += ' != ';
                            break;
                        default:
                            query += ' = ';
                    }
                    query += ` :b${bindCount} `;
                    binds[`b${bindCount}`] = queryObj[key][key2];
                    bindCount++;
                }
            } else {
                query += ` and ${key} = :b${bindCount} `;
                binds[`b${bindCount}`] = queryObj[key];
                bindCount++;
            }
        }

        var result = await db.simpleExecute(query, binds);
        result.data = binds;

        return result;
    } catch (err) {
        throw err;
    }
};

module.exports.getData = getData;
module.exports.insertData = insertData;
module.exports.deleteData = deleteData;
module.exports.updateData = updateData;
module.exports.updateDataAll = updateDataAll;
module.exports.poolCheck = poolCheck;

