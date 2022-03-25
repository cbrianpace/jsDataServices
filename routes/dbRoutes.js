const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dbController = require('../controllers/dbController');

router
    .route('/metadata')
    .get(authController.authValidate, dbController.metaData);

router
    .route('/:table/:id?')
    .get(
        authController.authValidate,
        authController.verifyAuthentication,
        dbController.validateTable,
        dbController.getStuff
    )
    .post(
        authController.authValidate,
        authController.verifyAuthentication,
        dbController.validateTable,
        dbController.postStuff
    )
    .delete(
        authController.authValidate,
        authController.verifyAuthentication,
        dbController.validateTable,
        dbController.deleteStuff
    )
    .patch(
        authController.authValidate,
        authController.verifyAuthentication,
        dbController.validateTable,
        dbController.patchStuff
    )
    .put(
        authController.authValidate,
        authController.verifyAuthentication,
        dbController.validateTable,
        dbController.putStuff
    );

module.exports = router;
