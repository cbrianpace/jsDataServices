const db = require('../services/databaseora.js');
const oradb = require('oracledb');

exports.healthCheck = async (req, res) => {
    try {
        let query = 'SELECT 1 FROM dual';
        result = await db.simpleExecute(query);

        if (result.rows.length == 1) {
            return res.status(200).send('AVAILABLE');
        }
    } catch (err) {
        //send error message
        return res.status(500).send('DOWN : ' + err.message);
    }
};

exports.poolCheck = async (req, res) => {
    try {
        pool = await oradb.getPool();
        pool._logStats();

        return res.status(200).send('');
    } catch (err) {
        //send error message
        return res.status(500).send('Error Pulling Stats: ' + err.message);
    }
};

exports.version = async (req, res) => {
    return res.status(200).send(process.env.VERSION);
};
