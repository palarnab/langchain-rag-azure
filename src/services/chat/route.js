const express = require('express');
const { ask, fetch } = require('./controller');
const { authorize, protect } = require('../../middleware/auth');

const router = express.Router();

router
    .route('/')
    .post(protect, authorize('user'), ask)
    .get(protect, authorize('user'), fetch);

module.exports = router;
