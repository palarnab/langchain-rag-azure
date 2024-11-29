const log = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    log({
        message: `API Exception ${err.stack}`,
        severity: 'error',
        user: req.user,
    });

    res.status(err.statusCode || 500).json({
        message: err.statusCode ? err.message : 'Internal error has occured',
    });
};

module.exports = errorHandler;
