const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');

const ErrorResponse = require('../utils/errorResponse');
const repository = require('../services/auth/repository');

exports.protectExperimental = asyncHandler(async (req, res, next) => {
    if (req.headers.experimental === 'true') {
        next();
    } else {
        return next(
            new ErrorResponse('Experimental API allowance required', 407)
        );
    }
});

exports.open = asyncHandler(async (req, res, next) => {
    req.isTest = req.headers.testkey === 'playground';
    next();
});

exports.protectRoot = asyncHandler(async (req, res, next) => {
    if (req.headers.authorization === 'blindman') {
        next();
    } else {
        return next(new ErrorResponse('Not authorized', 401));
    }
});

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await repository.findUserById(decoded.id, '+checkSum');
        if (!user.isLoggedIn || user.checkSum !== decoded.r) {
            return next(new ErrorResponse('Not authorized', 401));
        } else {
            const context = repository.verifyjwtSecret(decoded.c);
            req.user = { id: user.id, role: user.role, ...context };
            req.isTest = req.headers.testkey === 'playground';
        }
        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized', 401));
    }
});

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role) && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(
                    `user role ${req.user.role} is not authorized to access`,
                    403
                )
            );
        }
        next();
    };
};
