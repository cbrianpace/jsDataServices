const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const ActivteDirectory = require('activedirectory');
const axios = require('axios');
const jwt = require('jsonwebtoken')

const signToken = username => {
    return jwt.sign({ id: username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
}

exports.authValidate = (req, res, next) => {
    if (
        !req.headers.authorization ||
        (req.headers.authorization.indexOf('Bearer ') === -1 && req.headers.authorization.indexOf('Basic ') === -1)
    ) {
        res.status(401).send({
            status: 'fail',
            message: 'Missing Authorization Header',
        });
    } else {
        next();
    }
};

exports.authLogin = (req, res, next) => {
    // Replace with code to integrate to desired authentication
    [username, password] = Buffer.from(req.headers.authorization.split(' ')[1],'base64').toString().split(':');
    if ( username == password ) {
        const token = signToken(username);
        res.status(200).json({
            status: 'success',
            token
        })
    } else {
        res.status(401).send({
            status: 'fail',
            message: 'Authentication Error',
        });        
    }
}

exports.verifyAuthentication = async (req, res, next) => {
    // Verify token
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        res.status(401).send({
            status: 'fail',
            message: 'Authentication Error',
        });        
    }

    let decoded;

    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        next();
    } catch(e) {
        res.status(401).send({
            status: 'fail',
            message: 'Authentication Error - Bad Token',
        });        
    }
    
    // Verify User Still Exists
    // place code here to verify user

    
}
