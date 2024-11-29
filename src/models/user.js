const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connection = require('../config/db').connections.main;

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        role: {
            type: String,
            enum: ['admin', 'pu', 'user'],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 8,
            select: false,
        },
        name: {
            type: String,
            required: [true, 'Please add a name'],
            maxlength: [40, 'Name can not be more than 40 characters'],
        },
        isLoggedIn: {
            type: Boolean,
            default: false,
        },
        checkSum: {
            type: String,
            maxlength: 50,
            select: false,
        },
        deviceContext: {
            deviceId: {
                type: String,
                maxlength: 500,
            },
            platform: {
                type: String,
                maxlength: 50,
            },
        },
        lastLoginAt: {
            type: Date,
            select: false,
        },
        lastLogoutAt: {
            type: Date,
            select: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: function (_, ret) {
                delete ret._id;
            },
        },
    }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = connection.model('User', UserSchema);
