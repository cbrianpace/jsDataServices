module.exports = {
    dbPool: {
        user: process.env.USERNAME,
        password: process.env.DATABASE_PASSWORD_DECRYPTED,
        poolMin: 10,
        poolMax: 20,
        poolIncrement: 0,
        queueRequests: true,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    },
};
