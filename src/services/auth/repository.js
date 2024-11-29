const cyptojs = require('crypto-js');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const RepositoryError = require('../../utils/repositoryError');

const User = require('../../models/user');

const findUserByEmail = async (email) => {
    return await User.findOne({
        email,
        isDeleted: false,
    }).select('+password');
};

const findUserById = async (userId, selection = undefined) => {
    let query = User.findById(userId);
    if (selection) {
        query = query.select(selection);
    }

    const user = await query;
    return user && !user.isDeleted ? user : null;
};

const loginUser = async ({ id, email, role, deviceId, platform }) => {
    const loginData = {
        checkSum: getRandomToken(),
        deviceContext: { deviceId, platform },
        roleId: id,
    };

    const responseData = {
        userId: id,
        email: email,
        role: role,
    };

    if (role === 'user') {
        responseData.userId = id;
        loginData.roleId = id;
    }

    const token = getSignedJwtToken(
        id,
        loginData.checkSum,
        getjwtSecret(role, loginData.roleId)
    );

    const fieldsToUpdate = {
        failedAuth: 0,
        checkSum: loginData.checkSum,
        deviceContext: loginData.deviceContext,
        lastLoginAt: Date.now(),
        isLoggedIn: true,
    };

    await User.findByIdAndUpdate(id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    return { responseData, token };
};

const logoutUser = async (id) => {
    const fieldsToUpdate = {
        deviceContext: { deviceId: null, fcmToken: null, platform: null },
        checkSum: '',
        lastLogoutAt: Date.now(),
        isLoggedIn: false,
    };

    return await User.findByIdAndUpdate(id, fieldsToUpdate, {
        new: true,
        runValidators: true,
        select: 'email',
    }).lean();
};

const getRandomToken = (bytes = 20) => {
    return crypto.randomBytes(bytes).toString('hex');
};

const getSignedJwtToken = (id, r, c) => {
    return jwt.sign(
        {
            id,
            r,
            c,
            ha: Date.now(),
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE,
        }
    );
};

const getjwtSecret = (role, roleId) => {
    const context = {};

    if (role === 'user') {
        context.userId = roleId;
    } else {
        context.roleId = roleId;
    }

    const validationContext = JSON.stringify(context);

    return cyptojs.AES.encrypt(
        validationContext,
        process.env.CRYPTO_SECRET
    ).toString();
};

const verifyjwtSecret = (secret) => {
    const decrypted = cyptojs.AES.decrypt(secret, process.env.CRYPTO_SECRET);
    return JSON.parse(decrypted.toString(cyptojs.enc.Utf8));
};

module.exports = {
    loginUser,
    logoutUser,
    findUserByEmail,
    findUserById,
    verifyjwtSecret,
};
