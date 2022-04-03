const db = require("../services/database");
const rdbms = process.env.DATABASE_PLATFORM
const dbe = require('../services/'+rdbms)


exports.healthCheck = async (req, res) => {
    try {
        let query = 'SELECT 1';
        if ( rdbms == "oracle") {
            query += ' FROM dual'
        }
        result = await dbe.simpleExecute(query);

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
        result = await db.poolCheck();
        return res.status(200).send(result);
    } catch (err) {
        //send error message
        return res.status(500).send('Error Pulling Stats: ' + err.message);
    }
};

exports.version = async (req, res) => {
    return res.status(200).send(process.env.VERSION);
};
