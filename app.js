const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routes/authRoutes');
const healthRouter = require('./routes/healthRoutes');
const dbRouter = require('./routes/dbRoutes');
const cors = require('cors');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    //app.use(morgan('combined'));
}
app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    //console.log('Application Middleware Started');
    next();
});

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/db', dbRouter);

module.exports = app;
