const express = require('express');
const { info } = require('./controller');
const { protectRoot } = require('../../middleware/auth');

const router = express.Router();

router.get('/info', protectRoot, info);

module.exports = router;
