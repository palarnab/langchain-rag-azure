const mongoose = require('mongoose');

const connection = require('../config/db').connections.history;

const HistorySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        index: {
            type: String,
            required: true,
        },
        history: [
            {
                _id: false,
                user: {
                    type: String,
                    enum: ['ai', 'human'],
                    required: true,
                },
                message: {
                    type: String,
                    required: true,
                },
                unmodifiedMsg: {
                    type: String,
                },
                response: {
                    type: mongoose.Mixed,
                },
            },
        ],
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

module.exports = connection.model('History', HistorySchema);
