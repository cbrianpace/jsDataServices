module.exports = {
    dbPool: {
        user: process.env.USERNAME,
        password: process.env.DATABASE_PASSWORD_DECRYPTED,
        connectString: process.env.DATABASE,
        poolMin: 20,
        poolMax: 20,
        poolIncrement: 0,
        queueRequests: true,
    },
};
