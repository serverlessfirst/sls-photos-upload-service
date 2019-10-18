
enum LogLevel {
    DEBUG = 0,
    INFO,
    WARN,
    ERROR,
}

const CURRENT_LOG_LEVEL: LogLevel = process.env.LOG_LEVEL
    ? LogLevel[process.env.LOG_LEVEL.toUpperCase() as keyof typeof LogLevel]
    : LogLevel.DEBUG;

function isEnabled(level: LogLevel): boolean {
    return level >= CURRENT_LOG_LEVEL;
}

function appendError(params: any, err?: Error): any {
    if (!err) {
        return params;
    }

    return Object.assign(
        {},
        params || {},
        { errorName: err.name, errorMessage: err.message, stackTrace: err.stack },
    );
}

function log(level: LogLevel, message: string, params?: any): void {
    if (!isEnabled(level)) {
        return;
    }
    const logMsg = Object.assign({}, params, {
        level: LogLevel[level],
        message,
    });
    /* eslint no-console: 0 */
    console.log(JSON.stringify(logMsg));
}

export default {
    debug: (msg: string, params?: any): void => log(LogLevel.DEBUG, msg, params),
    info: (msg: string, params?: any): void => log(LogLevel.INFO, msg, params),
    warn: (msg: string, params?: any, error?: Error): void => log(LogLevel.WARN, msg, appendError(params, error)),
    error: (msg: string, params?: any, error?: Error): void => log(LogLevel.ERROR, msg, appendError(params, error)),
};
