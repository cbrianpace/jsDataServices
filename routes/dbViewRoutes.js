const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dbViewController = require('../controllers/dbViewController');

router
    .route('/metadata')
    .get(authController.authValidate, dbViewController.metaData);

router
    .route('/:table/:id?')
    .get(
        authController.authValidate,
        authController.verifyAuthentication,
        dbViewController.validateTable,
        dbViewController.getStuff
    );

module.exports = router;
