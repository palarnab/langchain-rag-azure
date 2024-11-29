const asyncHandler = require('../../middleware/async');
const log = require('../../utils/logger');
const ErrorResponse = require('../../utils/errorResponse');
const { decryptPwd } = require('../../utils/authHelper');

const repository = require('./repository');

exports.loginUser = asyncHandler(async (req, res, next) => {
    let { email, password, deviceId, platform } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password'));
    }

    if (req.headers.encrypt && req.headers.encrypt === 'des') {
        password = decryptPwd(password);
    }

    const { token, responseData } = await login(
        email,
        password,
        deviceId,
        platform
    );

    res.status(200)
        .setHeader('Authorization', `Bearer ${token}`)
        .setHeader('Access-Control-Expose-Headers', `Authorization`)
        .json(responseData);
});

exports.logout = asyncHandler(async (req, res, next) => {
    const user = await repository.logoutUser(req.user.id);

    log({
        message: `User logout success`,
        user: req.user,
    });

    res.status(200).json({
        message: `User ${user.email} has successfully logged out`,
    });
});

const login = async (email, password, deviceId, platform) => {
    email = email.toLowerCase();
    const user = await repository.findUserByEmail(email);

    if (!user || user.isDeleted) {
        throw new ErrorResponse('User does not exist', 401);
    } else if (!(await user.matchPassword(password))) {
        throw new ErrorResponse('Invalid credentials', 401);
    } else if (
        user.role !== 'admin' &&
        user.role !== 'pu' &&
        user.role !== 'user'
    ) {
        throw new ErrorResponse('Inconsistent role for user', 401);
    } else {
        const { token, responseData } = await repository.loginUser({
            id: user.id,
            email: user.email,
            role: user.role,
            deviceId,
            platform,
        });

        log({
            message: `${responseData.role} login success`,
            user,
        });

        return { token, responseData };
    }
};
