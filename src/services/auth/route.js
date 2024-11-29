const express = require('express');
const { loginUser, logout } = require('./controller');
const { open, protect } = require('../../middleware/auth');

const router = express.Router();

router.post('/login', open, loginUser).put('/logout', protect, logout);

module.exports = router;
