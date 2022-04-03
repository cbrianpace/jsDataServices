const cryptonite = require('../helpers/cryptonite');
const readline = require('readline');
const dotenv = require('dotenv');
dotenv.config({
    path: '../config/config.env',
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Password: ', function (text) {
    console.log(text);
    var hw = cryptonite.encryptdb(text);
    console.log(hw);
    //console.log(hw.encryptedData);
    //console.log(decrypt(hw))
    rl.close();
});
