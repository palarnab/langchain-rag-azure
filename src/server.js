const log = require('./utils/logger');

const app = require('./app');

const port = process.env.PORT || 5000;
const server = app.listen(
    port,
    log({
        message: `app running in ${process.env.NODE_ENV} on port ${port}`,
    })
);

// handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    log({
        message: `Unhandled Rejection ${err.message}`,
    });
    server.close(() => {
        process.exit(1);
    });
});
