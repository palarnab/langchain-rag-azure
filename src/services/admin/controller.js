const asyncHandler = require('../../middleware/async');
const { encryptPwd } = require('../../utils/authHelper');
const { version } = require('../../../package.json');
const fs = require('fs');
const path = require('path');

exports.info = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        e: process.env.NODE_ENV,
        v: version,
        t: fs.statSync(path.join(__dirname)).ctime,
        a: process.env.SERVERNAME,
        d: req.query.e ? encryptPwd(req.query.e) : undefined,
    });
});