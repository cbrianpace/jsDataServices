const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const ivdb = 'b14af93dafkathfy';
const iv = 'notreallyinused0';

//
// encrypt and decrypt now done by database to seperate key and iv
// encryptdb and decryptdb only used for database connection
//
function encrypt(text) {
    const key = process.env.ENC_KEY;
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
    };
}

function decrypt(text) {
    const key = process.env.ENC_KEY;
    // let ivh = Buffer.from(iv, 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

function encryptdb(text) {
    const key = process.env.ENC_KEY;
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), ivdb);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        encryptedData: encrypted.toString('hex'),
    };
}

function decryptdb(text) {
    const key = process.env.ENC_KEY;
    // let ivh = Buffer.from(iv, 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(key),
        ivdb
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.encryptdb = encryptdb;
module.exports.decryptdb = decryptdb;
