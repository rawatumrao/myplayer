class Logger {
    constructor() { }

    log(text, logLevel) {
        var time = new Date().toISOString();
        switch (logLevel) {
            case 'debug':
                console.debug(`[${time}] ${text}`);
                break;
            case 'info':
                console.info(`[${time}] ${text}`);
                break;
            case 'warn':
                console.warn(`[${time}] ${text}`);
                break;
            case 'error':
                console.error(`[${time}] ${text}`);
                break;
            default:
                console.log(`[${time}] ${text}`);
                break;
        }
    }

    debug(text) {
        this.log(text, 'debug');
    }

    info(text) {
        this.log(text, 'info');
    }

    warn(text) {
        this.log(text, 'warn');
    }

    error(text) {
        this.log(text, 'error');
    }
}

export default Logger;
