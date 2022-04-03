const db = require("../services/database");
const rdbms = process.env.DATABASE_PLATFORM

const excludedFields = ['offset', 'sort', 'limit', 'fields'];
var objectConstructor = {}.constructor;

const dbTables = require("../helpers/dbTables");

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

        const result = await db.getData(req);

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
        const result = await db.insertData(req);

        var reqBody = req.body;
        if (rdbms == "oracle") {
            reqBody[dbTables[req.params.table].pk] =
                result.outBinds['O' + dbTables[req.params.table].pk][0];
        } else {
            reqBody[dbTables[req.params.table].pk.toLowerCase()] = result.rows[0][dbTables[req.params.table].pk.toLowerCase()]
        }
        console.log(result)

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

        const result = await db.deleteData(req);

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
        const result = await db.updateData(req);

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
        const result = await db.updateDataAll(req);

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
