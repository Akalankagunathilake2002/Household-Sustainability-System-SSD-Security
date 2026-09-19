const { createLogger, format, transports } = require("winston");
const path = require("path");

const logFormat = format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        logFormat
    ),
    transports: [
        // Console (shows in Render logs)
        new transports.Console(),

        // File logs (temporary on Render)
        new transports.File({
            filename: path.join(__dirname, "../logs/error.log"),
            level: "error"
        }),
        new transports.File({
            filename: path.join(__dirname, "../logs/combined.log")
        })
    ]
});

module.exports = logger;