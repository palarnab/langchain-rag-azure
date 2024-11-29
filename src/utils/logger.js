const severities = ['debug', 'warn', 'error', 'fatal'];

const log = ({ message, severity, user }) => {
    const logLevel = severities.indexOf(process.env.LOG_LEVEL);

    if (message && message.length > 0) {
        severity =
            severity === undefined || severities.indexOf(severity) === -1
                ? 'debug'
                : severity;
        user = user && user.id ? user.id : '#';

        if (severity === 'debug') {
            if (logLevel < 1) {
                console.log({
                    message,
                    severity,
                    user,
                });
            }
        } else if (severity === 'warn') {
            if (logLevel < 2) {
                console.warn({
                    message,
                    severity,
                    user,
                });
            }
        } else {
            console.error({
                message,
                severity,
                user,
            });
        }
    }
};

module.exports = log;
