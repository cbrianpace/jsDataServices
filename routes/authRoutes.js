const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');

// router.param('id', tourController.checkID);

router
    .route('/')
    .post(
        authController.authValidate,
    );

router
    .route('/login')
    .post(
        authController.authValidate,
        authController.authLogin
    );

router
    .route('/session')
    .post(authController.authValidate);

module.exports = router;
