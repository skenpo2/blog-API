const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { API: 'E-Commerce' },
  transports: [
    // Console Transport (Only for development)
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `${timestamp} [${level}]: ${stack}`
            : `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),

    // File Transport for Errors
    new winston.transports.File({ filename: 'error.log', level: 'error' }),

    // File Transport for All Logs
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Handle uncaught exceptions & promise rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: 'exceptions.log' })
);
process.on('unhandledRejection', (reason) => {
  throw reason;
});

module.exports = logger;
