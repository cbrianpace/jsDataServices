//export DYLD_LIBRARY_PATH=/app/oracle/client/instantclient_19_3

const oracledb = require('oracledb');

// hr schema password
var password = 'Welcome1'
// checkConnection asycn function
async function checkConnection() {
    try {
        connection = await oracledb.getConnection({
            user: "hr",
            password: password,
            connectString: "192.168.2.10:1521/progress"
        });
        console.log('connected to database');
    } catch (err) {
        console.error(err.message);
    } finally {
        if (connection) {
            try {
                // Always close connections
                await connection.close();
                console.log('close connection success');
            } catch (err) {
                console.error(err.message);
            }
        }
    }
}

checkConnection();