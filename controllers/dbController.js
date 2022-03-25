const db = require('../services/databaseora.js');
const oradb = require('oracledb');

const excludedFields = ['offset', 'sort', 'limit', 'fields'];
var objectConstructor = {}.constructor;
const queryFeatures = require('../helpers/queryFeatures');

const employeeModel = require("../models/employeeModel")
const departmentModel = require("../models/departmentModel")

const dbTables = {};

dbTables.employees = employeeModel.employees;
dbTables.departments = departmentModel.departments;

////////////////////////////////////
// Common Functions
////////////////////////////////////
const getData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        var query = `select ${dbTables[req.params.table].columns} 
                     from ${req.params.table} 
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

const insertData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};

        var query = ` insert into ${req.params.table} ` + '(';
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
                values += ` cast(to_utc_timestamp_tz(:${key}) at time zone dbtimezone as date), `;
            } else {
                values += ` :${key}, `;
            }
            binds[key] = req.body[key];
        }

        query = ` ${query.substring(
            1,
            query.length - 2
        )} ) values (${values.substring(1, values.length - 2)}) returning ${
            dbTables[req.params.table].pk
        } into :O${dbTables[req.params.table].pk}`;

        key = 'O' + dbTables[req.params.table].pk;
        binds[key] = {
            dir: oradb.BIND_OUT,
            type: oradb.NUMBER,
        };

        const result = await db.simpleExecute(query, binds);

        return result;
    } catch (err) {
        throw err;
    }
};

const deleteData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};
        var bindCount = 0;

        var query = ` delete from ${req.params.table} where ${
            dbTables[req.params.table].pk
        } = :id `;
        binds.id = parseInt(req.params.id, 10);

        // Advanced Filtering
        var queryObj = {
            ...req.query,
        };
        excludedFields.forEach((el) => delete queryObj[el]);

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

const updateData = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};
        var bindCount = 0;

        var query = ` update ${req.params.table} set `;

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
                    query += ` cast(to_utc_timestamp_tz(:${key}) at time zone dbtimezone as date), `;
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
        excludedFields.forEach((el) => delete queryObj[el]);

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

        const nls = await db.simpleExecute(
            'select * from NLS_SESSION_PARAMETERS'
        );

        const result = await db.simpleExecute(query, binds);

        return result;
    } catch (err) {
        throw err;
    }
};

const updateDataAll = async (req) => {
    try {
        //
        // Parse Parameters
        //
        const binds = {};
        var bindCount = 0;

        var query = ` update ${req.params.table} set `;

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
                    query += ` cast(to_utc_timestamp_tz(:${
                        dbTables[req.params.table].columns[col]
                    }) at time zone dbtimezone as date), `;
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
        excludedFields.forEach((el) => delete queryObj[el]);

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

validateTable = async (req, res, next) => {
    if (!dbTables[req.params.table]) {
        res.status(404).send({
            status: 'fail',
            message: 'Invalid table or object name',
        });
    }
    next();
};
async function getStuff(req, res, next) {
    try {
        const context = {};

        context.table = req.params.table;

        context.id = parseInt(req.params.id, 10);
        context.offset = parseInt(req.query.offset, 10);
        context.limit = parseInt(req.query.limit, 10);
        context.sort = req.query.sort;

        const result = await getData(req);

        if (result.rows.length === 0) {
            res.status(200).json({
                count: 0,
                items: [],
            });
        } else {
            res.status(200).json({
                count: result.rows.length,
                items: result.rows,
            });
        }
    } catch (err) {
        next(err);
    }
}

async function postStuff(req, res, next) {
    try {
        const result = await insertData(req);

        var reqBody = req.body;
        reqBody[dbTables[req.params.table].pk] =
            result.outBinds['O' + dbTables[req.params.table].pk][0];

        res.status(201).json({
            status: 'success',
            rowsAffected: result.rowsAffected,
            lastRowid: result.lastRowid,
            data: reqBody,
        });
    } catch (err) {
        res.status(500).send({
            status: 'fail',
            message: 'Error: ' + err.message,
        });
    }
}

async function deleteStuff(req, res, next) {
    try {
        if (!req.params.id) {
            throw new Error('ID for table not provided');
        }

        const result = await deleteData(req);

        res.status(204).json({
            status: 'success',
        });
    } catch (err) {
        res.status(500).send({
            status: 'fail',
            message: 'Error: ' + err.message,
        });
    }
}

async function patchStuff(req, res, next) {
    try {
        const result = await updateData(req);

        var reqBody = req.body;
        reqBody[dbTables[req.params.table].pk] = parseInt(req.params.id, 10);

        res.status(200).json({
            status: 'success',
            rowsAffected: result.rowsAffected,
            lastRowid: result.lastRowid,
            data: reqBody,
        });
    } catch (err) {
        res.status(500).send({
            status: 'fail',
            message: 'Error: ' + err.message,
        });
    }
}

async function putStuff(req, res, next) {
    try {
        const result = await updateDataAll(req);

        var reqBody = req.body;
        reqBody[dbTables[req.params.table].pk] = parseInt(req.params.id, 10);

        res.status(200).json({
            status: 'success',
            rowsAffected: result.rowsAffected,
            lastRowid: result.lastRowid,
            data: result.data,
        });
    } catch (err) {
        res.status(500).send({
            status: 'fail',
            message: 'Error: ' + err.message,
        });
    }
}

const metaData = async (req, res) => {
    res.status(200).json({
        status: 'success',
        tables: dbTables,
    });
};

module.exports.getStuff = getStuff;
module.exports.deleteStuff = deleteStuff;
module.exports.postStuff = postStuff;
module.exports.patchStuff = patchStuff;
module.exports.putStuff = putStuff;
module.exports.validateTable = validateTable;
module.exports.metaData = metaData;
