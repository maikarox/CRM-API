import winston from 'winston';

const { NODE_ENV = 'dev' } = process.env;

const transports = [];

if (NODE_ENV === 'dev') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.cli(),
        winston.format.splat(),
      ),
    }),
  );
}

declare module 'winston' {
  interface LoggerOptions {
    rejectionHandlers?: unknown;
  }
}

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports,
  exceptionHandlers: transports,
  rejectionHandlers: transports
});

export default logger;