const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router
    .route('/')
    .get(healthController.healthCheck);

router
    .route('/poolcheck')
    .get(healthController.poolCheck);

router
    .route('/version')
    .get(healthController.version)

module.exports = router;