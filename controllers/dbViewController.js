const db = require("../services/database");
const rdbms = process.env.DATABASE_PLATFORM

const excludedFields = ['offset', 'sort', 'limit', 'fields'];
var objectConstructor = {}.constructor;

const dbViews = require("../helpers/dbViews");

validateTable = async (req, res, next) => {
    if (!dbViews[req.params.table]) {
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


const metaData = async (req, res) => {
    res.status(200).json({
        status: 'success',
        tables: dbViews,
    });
};

module.exports.getStuff = getStuff;
module.exports.validateTable = validateTable;
module.exports.metaData = metaData;
