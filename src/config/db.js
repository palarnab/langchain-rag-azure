const mongoose = require('mongoose');
const log = require('../utils/logger');

const connections = {};

const connect = (connectionName, connectionString) => {
    const connection = mongoose.createConnection(connectionString);
    log({
        message: `${connectionName} Connected: ${connection.host}`,
    });

    connections[connectionName] = connection;
};

const connectDB = () => {
    connect('main', process.env.MONGO_URI_IDENTITY);
    connect('history', process.env.MONGO_URI_HISTORY);
};

module.exports = {
    connections,
    connectDB,
};
